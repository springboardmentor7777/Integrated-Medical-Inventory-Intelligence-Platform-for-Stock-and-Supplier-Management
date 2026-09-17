package com.medistock.service;

import com.medistock.dto.medicine.BatchDto;
import com.medistock.dto.medicine.BatchRequest;
import com.medistock.dto.medicine.MedicineRequest;
import com.medistock.dto.medicine.MedicineResponse;
import com.medistock.entity.*;
import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockMovementType;
import com.medistock.enums.StockStatus;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final BatchRepository batchRepository;
    private final StockLogRepository stockLogRepository;
    private final AuthService authService;
    private final RealtimeNotificationService realtimeNotificationService;

    public MedicineService(MedicineRepository medicineRepository,
                           CategoryRepository categoryRepository,
                           SupplierRepository supplierRepository,
                           InventoryRepository inventoryRepository,
                           BatchRepository batchRepository,
                           StockLogRepository stockLogRepository,
                           AuthService authService,
                           RealtimeNotificationService realtimeNotificationService) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.batchRepository = batchRepository;
        this.stockLogRepository = stockLogRepository;
        this.authService = authService;
        this.realtimeNotificationService = realtimeNotificationService;
    }

    // ── GET ALL MEDICINES (with multi-criteria filter) ─────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines(String search, Long categoryId, String stockStatus, String expiryStatus) {
        List<Medicine> medicines;

        if (search != null && !search.isBlank()) {
            medicines = medicineRepository.searchMedicines(search.trim());
        } else if (categoryId != null) {
            medicines = medicineRepository.findByCategoryId(categoryId);
        } else if (stockStatus != null && !stockStatus.isBlank() && !"ALL".equalsIgnoreCase(stockStatus)) {
            try {
                medicines = medicineRepository.findByStockStatus(StockStatus.valueOf(stockStatus.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                medicines = medicineRepository.findAll();
            }
        } else if (expiryStatus != null && !expiryStatus.isBlank() && !"ALL".equalsIgnoreCase(expiryStatus)) {
            try {
                medicines = medicineRepository.findByExpiryStatus(ExpiryStatus.valueOf(expiryStatus.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                medicines = medicineRepository.findAll();
            }
        } else {
            medicines = medicineRepository.findAll();
        }

        // Apply secondary in-memory filters if multiple were specified
        return medicines.stream()
                .filter(m -> categoryId == null || (m.getCategory() != null && m.getCategory().getId().equals(categoryId)))
                .filter(m -> {
                    if (stockStatus == null || stockStatus.isBlank() || "ALL".equalsIgnoreCase(stockStatus)) return true;
                    StockStatus ss = m.getInventory() != null ? m.getInventory().getStockStatus() : m.getStockStatus();
                    return ss != null && ss.name().equalsIgnoreCase(stockStatus.trim());
                })
                .filter(m -> {
                    if (expiryStatus == null || expiryStatus.isBlank() || "ALL".equalsIgnoreCase(expiryStatus)) return true;
                    return m.getExpiryStatus() != null && m.getExpiryStatus().name().equalsIgnoreCase(expiryStatus.trim());
                })
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return MedicineResponse.fromEntity(medicine);
    }

    // ── CREATE MEDICINE ──────────────────────────────────────────────────────
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = "MED-" + (int)(Math.random() * 900 + 100);
        }

        if (medicineRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Medicine code already exists: " + code);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        Medicine medicine = new Medicine(
                request.getName(),
                code,
                category,
                supplier,
                request.getDosageForm() != null ? request.getDosageForm() : "Tablets",
                request.getStorageCondition() != null ? request.getStorageCondition() : "Room Temperature (15-25°C)",
                request.getDescription() != null ? request.getDescription() : "",
                request.getUnitPrice(),
                request.getReorderLevel() != null ? request.getReorderLevel() : 20
        );

        int initialQty = request.getInitialQuantity() != null ? Math.max(0, request.getInitialQuantity()) : 0;
        StockStatus stockStatus = determineStockStatus(initialQty, medicine.getReorderLevel());
        medicine.setStockStatus(stockStatus);

        if (request.getExpiryDate() != null) {
            medicine.setNearestExpiryDate(request.getExpiryDate());
            medicine.setExpiryStatus(determineExpiryStatus(request.getExpiryDate()));
        } else {
            medicine.setExpiryStatus(ExpiryStatus.VALID);
        }

        Medicine savedMedicine = medicineRepository.save(medicine);

        // Create Inventory record
        Inventory inventory = new Inventory(savedMedicine, initialQty, savedMedicine.getReorderLevel());
        inventory.setStockStatus(stockStatus);
        inventoryRepository.save(inventory);
        savedMedicine.setInventory(inventory);

        // Create Initial Batch if batchNumber or initial quantity provided
        if (request.getBatchNumber() != null && !request.getBatchNumber().isBlank()) {
            LocalDate expDate = request.getExpiryDate() != null ? request.getExpiryDate() : LocalDate.now().plusYears(2);
            LocalDate mfg = request.getMfgDate() != null ? request.getMfgDate() : LocalDate.now().minusMonths(1);
            Double pPrice = request.getPurchasePrice() != null ? request.getPurchasePrice() : (request.getUnitPrice() * 0.7);

            Batch batch = new Batch(
                    savedMedicine,
                    request.getBatchNumber(),
                    initialQty,
                    mfg,
                    expDate,
                    pPrice
            );
            batch.setExpiryStatus(determineExpiryStatus(expDate));
            // Use cascade via addBatch — do NOT call batchRepository.save separately
            savedMedicine.addBatch(batch);
        }

        // Stock log for initial inventory
        if (initialQty > 0) {
            User user = null;
            String userName = "System";
            try {
                user = authService.getCurrentAuthenticatedUser();
                userName = user.getName();
            } catch (Exception ignored) { }

            StockLog stockLog = new StockLog(
                    savedMedicine,
                    request.getBatchNumber() != null ? request.getBatchNumber() : "INIT-001",
                    StockMovementType.IN,
                    AdjustmentReason.SHIPMENT_RECEIVED,
                    initialQty,
                    0,
                    initialQty,
                    user,
                    userName,
                    null,
                    "Initial stock during medicine catalog creation"
            );
            stockLogRepository.save(stockLog);
        }

        realtimeNotificationService.notifyInventoryUpdate(
                "MEDICINE_CREATED", savedMedicine.getId(), savedMedicine.getName(), null);

        return MedicineResponse.fromEntity(savedMedicine);
    }

    // ── UPDATE MEDICINE ──────────────────────────────────────────────────────
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (request.getCode() != null && !request.getCode().equalsIgnoreCase(medicine.getCode())) {
            if (medicineRepository.existsByCodeIgnoreCase(request.getCode())) {
                throw new DuplicateResourceException("Medicine code already in use: " + request.getCode());
            }
            medicine.setCode(request.getCode());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            medicine.setName(request.getName());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            medicine.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
            medicine.setSupplier(supplier);
        }

        if (request.getDosageForm() != null) medicine.setDosageForm(request.getDosageForm());
        if (request.getStorageCondition() != null) medicine.setStorageCondition(request.getStorageCondition());
        if (request.getDescription() != null) medicine.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) medicine.setUnitPrice(request.getUnitPrice());

        if (request.getReorderLevel() != null) {
            medicine.setReorderLevel(request.getReorderLevel());
            if (medicine.getInventory() != null) {
                medicine.getInventory().setReorderLevel(request.getReorderLevel());
                medicine.getInventory().setStockStatus(
                        determineStockStatus(medicine.getInventory().getQuantity(), request.getReorderLevel()));
                inventoryRepository.save(medicine.getInventory());
            }
        }

        Medicine updated = medicineRepository.save(medicine);
        return MedicineResponse.fromEntity(updated);
    }

    // ── DELETE MEDICINE ──────────────────────────────────────────────────────
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        stockLogRepository.deleteByMedicineId(id);
        inventoryRepository.deleteByMedicineId(id);
        batchRepository.deleteByMedicineId(id);
        medicineRepository.delete(medicine);

        realtimeNotificationService.notifyInventoryUpdate(
                "MEDICINE_DELETED", id, medicine.getName(), null);
    }

    // ── ADD BATCH TO MEDICINE ────────────────────────────────────────────────
    @Transactional
    public MedicineResponse addBatch(Long medicineId, BatchRequest batchRequest) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        LocalDate mfg = batchRequest.getMfgDate() != null ? batchRequest.getMfgDate() : LocalDate.now().minusMonths(1);
        Double price = batchRequest.getPurchasePrice() != null ? batchRequest.getPurchasePrice() : (medicine.getUnitPrice() * 0.7);

        Batch batch = new Batch(
                medicine,
                batchRequest.getBatchNumber(),
                batchRequest.getQuantity(),
                mfg,
                batchRequest.getExpiryDate(),
                price
        );
        batch.setExpiryStatus(determineExpiryStatus(batchRequest.getExpiryDate()));
        // Add to collection FIRST so cascade handles the INSERT (avoids duplicate save)
        medicine.addBatch(batch);

        // Update inventory quantity
        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseGet(() -> new Inventory(medicine, 0, medicine.getReorderLevel()));

        int prevQty = inventory.getQuantity();
        int newQty = prevQty + batchRequest.getQuantity();
        inventory.setQuantity(newQty);
        inventory.setStockStatus(determineStockStatus(newQty, inventory.getReorderLevel()));
        inventoryRepository.save(inventory);

        // Update nearest expiry date and expiry status
        updateNearestExpiry(medicine);
        medicineRepository.save(medicine);

        // Log Stock Entry
        User user = null;
        String userName = "System";
        try {
            user = authService.getCurrentAuthenticatedUser();
            userName = user.getName();
        } catch (Exception ignored) { }

        StockLog stockLog = new StockLog(
                medicine,
                batch.getBatchNumber(),
                StockMovementType.IN,
                AdjustmentReason.SHIPMENT_RECEIVED,
                batchRequest.getQuantity(),
                prevQty,
                newQty,
                user,
                userName,
                null,
                "New batch added: " + batch.getBatchNumber()
        );
        stockLogRepository.save(stockLog);

        realtimeNotificationService.notifyInventoryUpdate(
                "BATCH_ADDED", medicine.getId(), medicine.getName(), null);

        return MedicineResponse.fromEntity(medicine);
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────
    private StockStatus determineStockStatus(int quantity, int reorderLevel) {
        if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
        if (quantity <= reorderLevel) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    private ExpiryStatus determineExpiryStatus(LocalDate expiryDate) {
        if (expiryDate == null) return ExpiryStatus.VALID;
        LocalDate now = LocalDate.now();
        if (expiryDate.isBefore(now)) return ExpiryStatus.EXPIRED;
        if (expiryDate.isBefore(now.plusDays(30)) || expiryDate.isEqual(now.plusDays(30))) {
            return ExpiryStatus.EXPIRING_SOON;
        }
        return ExpiryStatus.VALID;
    }

    private void updateNearestExpiry(Medicine medicine) {
        List<Batch> batches = medicine.getBatches();
        if (batches != null && !batches.isEmpty()) {
            batches.stream()
                    .map(Batch::getExpiryDate)
                    .filter(d -> d != null)
                    .min(Comparator.naturalOrder())
                    .ifPresent(minExp -> {
                        medicine.setNearestExpiryDate(minExp);
                        medicine.setExpiryStatus(determineExpiryStatus(minExp));
                    });
        }
    }
}
