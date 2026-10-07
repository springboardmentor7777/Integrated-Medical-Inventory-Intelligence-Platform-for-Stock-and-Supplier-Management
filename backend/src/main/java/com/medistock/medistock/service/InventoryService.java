package com.medistock.medistock.service;

import com.medistock.medistock.dto.InventoryRequest;
import com.medistock.medistock.dto.InventoryResponse;
import com.medistock.medistock.entity.Inventory;
import com.medistock.medistock.entity.Medicine;
import com.medistock.medistock.repository.InventoryRepository;
import com.medistock.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import com.medistock.medistock.dto.alert.LowStockDetectionRequest;
import com.medistock.medistock.dto.alert.StockSnapshot;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final AlertService alertService;

    public InventoryService(
            InventoryRepository inventoryRepository,
            MedicineRepository medicineRepository,
            AlertService alertService) {

        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.alertService = alertService;
    }

    public InventoryResponse createInventory(InventoryRequest request) {

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        if (inventoryRepository.findByMedicineId(request.getMedicineId()).isPresent()) {
            throw new RuntimeException("Inventory already exists for this medicine");
        }

        Inventory inventory = Inventory.builder()
                .medicine(medicine)
                .quantity(request.getQuantity())
                .reorderLevel(medicine.getReorderLevel())
                .build();

        Inventory savedInventory = inventoryRepository.save(inventory);

        alertService.detectLowStock(new LowStockDetectionRequest(
                Collections.singletonList(new StockSnapshot(
                        medicine.getId(),
                        medicine.getName(),
                        savedInventory.getQuantity(),
                        savedInventory.getReorderLevel()
                ))
        ));

        return mapToResponse(savedInventory);
    }

    public List<InventoryResponse> getAllInventory() {

        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InventoryResponse getInventoryById(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        return mapToResponse(inventory);
    }

    public InventoryResponse getInventoryByMedicine(Long medicineId) {

        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        return mapToResponse(inventory);
    }

    public InventoryResponse updateStock(Long id, Integer quantity) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (quantity < 0) {
            throw new RuntimeException("Quantity cannot be negative");
        }

        inventory.setQuantity(quantity);

        Inventory savedInventory = inventoryRepository.save(inventory);

        alertService.detectLowStock(new LowStockDetectionRequest(
                Collections.singletonList(new StockSnapshot(
                        savedInventory.getMedicine().getId(),
                        savedInventory.getMedicine().getName(),
                        savedInventory.getQuantity(),
                        savedInventory.getReorderLevel()
                ))
        ));

        return mapToResponse(savedInventory);
    }

    private InventoryResponse mapToResponse(Inventory inventory) {

        String status;

        if (inventory.getQuantity() == 0) {
            status = "OUT_OF_STOCK";
        } else if (inventory.getQuantity() <= inventory.getReorderLevel()) {
            status = "LOW_STOCK";
        } else {
            status = "IN_STOCK";
        }

        return InventoryResponse.builder()
                .id(inventory.getId())
                .medicineId(inventory.getMedicine().getId())
                .medicineName(inventory.getMedicine().getName())
                .quantity(inventory.getQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .status(status)
                .build();
    }
}