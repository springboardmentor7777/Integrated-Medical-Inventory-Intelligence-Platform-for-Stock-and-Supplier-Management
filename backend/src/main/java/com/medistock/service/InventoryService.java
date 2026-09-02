package com.medistock.service;

import com.medistock.dto.inventory.InventoryResponse;
import com.medistock.dto.inventory.StockLogResponse;
import com.medistock.dto.inventory.StockUpdateRequest;
import com.medistock.entity.*;
import com.medistock.enums.StockMovementType;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.enums.StockStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockLogRepository stockLogRepository;
    private final AuthService authService;

    public InventoryService(InventoryRepository inventoryRepository,
                            MedicineRepository medicineRepository,
                            StockLogRepository stockLogRepository,
                            AuthService authService) {
        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.stockLogRepository = stockLogRepository;
        this.authService = authService;
    }

    // ── GET ALL INVENTORY ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll()
                .stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET LOW-STOCK ITEMS ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findByStockStatus(StockStatus.LOW_STOCK)
                .stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET OUT-OF-STOCK ITEMS ────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutOfStockItems() {
        return inventoryRepository.findByStockStatus(StockStatus.OUT_OF_STOCK)
                .stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET STOCK HISTORY (last 50 logs) ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<StockLogResponse> getStockHistory() {
        return stockLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET STOCK HISTORY FOR A SPECIFIC MEDICINE ────────────────────────────
    @Transactional(readOnly = true)
    public List<StockLogResponse> getStockHistoryByMedicine(Long medicineId) {
        medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
        return stockLogRepository.findByMedicineIdOrderByCreatedAtDesc(medicineId)
                .stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── UPDATE STOCK (IN or OUT adjustment) ──────────────────────────────────
    @Transactional
    public InventoryResponse updateStock(Long medicineId, StockUpdateRequest request) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory record not found for medicine id: " + medicineId));

        int previousStock = inventory.getQuantity();
        int qty = request.getQuantity();

        // Validate OUT doesn't exceed current stock
        if (request.getType() == StockMovementType.OUT && qty > previousStock) {
            throw new BadRequestException(
                    "Cannot deduct " + qty + " units. Current stock is only " + previousStock + " units.");
        }

        int newStock = request.getType() == StockMovementType.IN
                ? previousStock + qty
                : previousStock - qty;

        inventory.setQuantity(newStock);
        inventoryRepository.save(inventory);

        // Write audit log
        User performedBy = null;
        String performedByName = "System";
        try {
            performedBy = authService.getCurrentAuthenticatedUser();
            performedByName = performedBy.getName();
        } catch (Exception ignored) { }

        StockLog stockLog = new StockLog(
                medicine,
                request.getBatchNumber(),
                request.getType(),
                request.getReason(),
                qty,
                previousStock,
                newStock,
                performedBy,
                performedByName,
                null,
                request.getNotes()
        );
        stockLogRepository.save(stockLog);

        return InventoryResponse.fromEntity(inventory);
    }
}
