package com.medistock.service;

import com.medistock.dto.medicine.MedicineRequest;
import com.medistock.dto.medicine.MedicineResponse;
import com.medistock.entity.Category;
import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockMovementType;
import com.medistock.enums.StockStatus;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final StockLogRepository stockLogRepository;
    private final AuthService authService;

    public MedicineService(MedicineRepository medicineRepository,
                          CategoryRepository categoryRepository,
                          SupplierRepository supplierRepository,
                          InventoryRepository inventoryRepository,
                          StockLogRepository stockLogRepository,
                          AuthService authService) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockLogRepository = stockLogRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines(String query, Long categoryId, String stockStatus, String expiryStatus) {
        List<Medicine> medicines;
        if ((query == null || query.isBlank()) && (categoryId == null) && (stockStatus == null || stockStatus.isBlank()) && (expiryStatus == null || expiryStatus.isBlank())) {
            medicines = medicineRepository.findAll();
        } else {
            medicines = medicineRepository.findAll().stream()
                    .filter(m -> query == null || query.isBlank() ||
                            (m.getName() != null && m.getName().toLowerCase().contains(query.toLowerCase())) ||
                            (m.getCode() != null && m.getCode().toLowerCase().contains(query.toLowerCase())) ||
                            (m.getCategory() != null && m.getCategory().getName() != null && m.getCategory().getName().toLowerCase().contains(query.toLowerCase())) ||
                            (m.getSupplier() != null && m.getSupplier().getName() != null && m.getSupplier().getName().toLowerCase().contains(query.toLowerCase())))
                    .filter(m -> categoryId == null || categoryId.equals(m.getCategory() != null ? m.getCategory().getId() : null))
                    .filter(m -> stockStatus == null || stockStatus.isBlank() || (m.getStockStatus() != null && m.getStockStatus().name().equalsIgnoreCase(stockStatus)))
                    .filter(m -> expiryStatus == null || expiryStatus.isBlank() || (m.getExpiryStatus() != null && m.getExpiryStatus().name().equalsIgnoreCase(expiryStatus)))
                    .collect(Collectors.toList());
        }
        return medicines.stream().map(MedicineResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String query) {
        if (query == null || query.isBlank()) {
            return getAllMedicines(null, null, null, null);
        }
        return medicineRepository.searchMedicines(query).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getLowStockMedicines() {
        return medicineRepository.findByStockStatus(StockStatus.LOW_STOCK).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getOutOfStockMedicines() {
        return medicineRepository.findByStockStatus(StockStatus.OUT_OF_STOCK).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiredMedicines() {
        return medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRED).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiringSoonMedicines() {
        return medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRING_SOON).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return MedicineResponse.fromEntity(medicine);
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (request == null) {
            throw new BadRequestException("Medicine payload is required");
        }
        String name = request.getName() == null ? "" : request.getName().trim();
        String code = request.getCode() == null ? "" : request.getCode().trim();
        if (name.isBlank() || code.isBlank()) {
            throw new BadRequestException("Medicine name and code are required");
        }
        if (medicineRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Medicine code '" + code + "' already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        Medicine medicine = new Medicine(
                name,
                code,
                category,
                supplier,
                request.getDosageForm() == null ? "Tablets" : request.getDosageForm(),
                request.getStorageCondition() == null ? "Room Temperature (15-25°C)" : request.getStorageCondition(),
                request.getDescription() == null ? "" : request.getDescription(),
                request.getUnitPrice() == null ? 0.0 : request.getUnitPrice(),
                request.getReorderLevel() == null ? 20 : request.getReorderLevel()
        );
        medicine.setNearestExpiryDate(request.getNearestExpiryDate());
        medicine.setStockStatus(request.toStockStatus());
        medicine.setExpiryStatus(request.toExpiryStatus());

        Medicine savedMedicine = medicineRepository.save(medicine);

        Integer qty = request.getTotalQuantity() == null ? 0 : request.getTotalQuantity();
        Inventory inventory = new Inventory(savedMedicine, qty, request.getReorderLevel() == null ? 20 : request.getReorderLevel());
        inventoryRepository.save(inventory);
        savedMedicine.setInventory(inventory);

        if (qty != null && qty > 0) {
            User currentUser = null;
            try {
                currentUser = authService.getCurrentAuthenticatedUser();
            } catch (Exception ignored) {
            }
            StockLog stockLog = new StockLog(
                    savedMedicine,
                    null,
                    StockMovementType.IN,
                    AdjustmentReason.INITIAL_STOCK,
                    qty,
                    0,
                    qty,
                    currentUser,
                    currentUser != null ? currentUser.getName() : "System",
                    "INIT-" + savedMedicine.getId(),
                    "Initial stock entry"
            );
            stockLogRepository.save(stockLog);
        }

        return MedicineResponse.fromEntity(savedMedicine);
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            medicine.setName(request.getName().trim());
        }
        if (request.getCode() != null && !request.getCode().isBlank()) {
            String code = request.getCode().trim();
            if (!Objects.equals(code, medicine.getCode()) && medicineRepository.existsByCodeIgnoreCase(code)) {
                throw new DuplicateResourceException("Medicine code '" + code + "' already exists");
            }
            medicine.setCode(code);
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
        if (request.getReorderLevel() != null) medicine.setReorderLevel(request.getReorderLevel());
        if (request.getNearestExpiryDate() != null) medicine.setNearestExpiryDate(request.getNearestExpiryDate());
        if (request.getExpiryStatus() != null) medicine.setExpiryStatus(request.toExpiryStatus());

        if (request.getTotalQuantity() != null || request.getReorderLevel() != null) {
            Inventory inventory = medicine.getInventory();
            if (inventory == null) {
                inventory = new Inventory(medicine, request.getTotalQuantity() == null ? 0 : request.getTotalQuantity(), request.getReorderLevel() == null ? medicine.getReorderLevel() : request.getReorderLevel());
                medicine.setInventory(inventory);
                inventoryRepository.save(inventory);
            } else {
                inventory.setQuantity(request.getTotalQuantity() == null ? inventory.getQuantity() : request.getTotalQuantity());
                if (request.getReorderLevel() != null) {
                    inventory.setReorderLevel(request.getReorderLevel());
                }
                inventoryRepository.save(inventory);
            }
        }

        return MedicineResponse.fromEntity(medicineRepository.save(medicine));
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        medicineRepository.delete(medicine);
    }
}