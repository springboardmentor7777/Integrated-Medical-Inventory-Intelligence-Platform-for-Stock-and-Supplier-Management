package com.medistock.service;

import com.medistock.dto.purchase.CreatePurchaseOrderRequest;
import com.medistock.dto.purchase.PurchaseOrderItemRequest;
import com.medistock.dto.purchase.PurchaseOrderResponse;
import com.medistock.entity.*;
import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.OrderStatus;
import com.medistock.enums.StockMovementType;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final StockLogRepository stockLogRepository;
    private final AuthService authService;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                MedicineRepository medicineRepository,
                                InventoryRepository inventoryRepository,
                                StockLogRepository stockLogRepository,
                                AuthService authService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockLogRepository = stockLogRepository;
        this.authService = authService;
    }

    // ── GET ALL (with optional filters) ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllOrders(Long supplierId, String status, String search) {
        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status value: " + status);
            }
        }
        return purchaseOrderRepository
                .searchOrders(supplierId, orderStatus, search)
                .stream()
                .map(PurchaseOrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return PurchaseOrderResponse.fromEntity(po);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse createOrder(CreatePurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Supplier not found with id: " + request.getSupplierId()));

        String poNumber = generatePoNumber();
        double totalAmount = request.getItems().stream()
                .mapToDouble(PurchaseOrderItemRequest::computedTotal)
                .sum();

        PurchaseOrder po = new PurchaseOrder(
                poNumber,
                supplier,
                LocalDate.now(),
                request.getExpectedDeliveryDate(),
                totalAmount,
                request.getNotes()
        );

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            PurchaseOrderItem item = new PurchaseOrderItem(
                    po,
                    itemReq.getMedicineId(),
                    itemReq.getMedicineName(),
                    itemReq.getQuantity(),
                    itemReq.getUnitPrice(),
                    itemReq.computedTotal()
            );
            po.addItem(item);
        }

        return PurchaseOrderResponse.fromEntity(purchaseOrderRepository.save(po));
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse updateOrderStatus(Long id, String newStatus) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(newStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + newStatus +
                    ". Allowed: PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED");
        }

        // Prevent backward status transitions
        if (po.getStatus() == OrderStatus.DELIVERED || po.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a " + po.getStatus() + " order.");
        }

        po.setStatus(status);
        purchaseOrderRepository.save(po);

        // ── Auto-restock inventory when PO is DELIVERED ──────────────────────
        if (status == OrderStatus.DELIVERED) {
            User user = null;
            String userName = "System";
            try {
                user = authService.getCurrentAuthenticatedUser();
                userName = user.getName();
            } catch (Exception ignored) { }

            final User finalUser = user;
            final String finalUserName = userName;

            for (PurchaseOrderItem item : po.getItems()) {
                if (item.getMedicineId() == null) continue;

                medicineRepository.findById(item.getMedicineId()).ifPresent(medicine -> {
                    inventoryRepository.findByMedicineId(medicine.getId()).ifPresent(inventory -> {
                        int prev = inventory.getQuantity();
                        int added = item.getQuantity() != null ? item.getQuantity() : 0;
                        inventory.setQuantity(prev + added);
                        inventoryRepository.save(inventory);

                        // Write stock log
                        StockLog stockLog = new StockLog(
                                medicine,
                                null,
                                StockMovementType.IN,
                                AdjustmentReason.SHIPMENT_RECEIVED,
                                added,
                                prev,
                                inventory.getQuantity(),
                                finalUser,
                                finalUserName,
                                po.getPoNumber(),
                                "Auto-restocked on delivery of " + po.getPoNumber()
                        );
                        stockLogRepository.save(stockLog);
                    });
                });
            }
        }

        return PurchaseOrderResponse.fromEntity(po);
    }

    // ── HELPER: generate sequential PO number ─────────────────────────────────
    private String generatePoNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = purchaseOrderRepository.count() + 1;
        return String.format("PO-%s-%03d", year, count);
    }
}
