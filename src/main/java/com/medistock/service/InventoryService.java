package com.medistock.service;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockLogService stockLogService;
    private final LowStockAlertService lowStockAlertService;

    public InventoryService(
            InventoryRepository inventoryRepository,
            MedicineRepository medicineRepository,
            StockLogService stockLogService,
            LowStockAlertService lowStockAlertService) {

        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.stockLogService = stockLogService;
        this.lowStockAlertService = lowStockAlertService;
    }

    // Add stock
    public Inventory addStock(Integer medicineId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Stock quantity must be greater than 0");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found with id: " + medicineId));

        Inventory inventory = inventoryRepository.findByMedicine(medicine)
                .orElse(null);

        if (inventory == null) {
            inventory = new Inventory();
            inventory.setMedicine(medicine);
            inventory.setQuantity(quantity);
        } else {
            inventory.setQuantity(
                    inventory.getQuantity() + quantity
            );
        }

        medicine.setQuantity(
                medicine.getQuantity() + quantity
        );

        medicineRepository.save(medicine);

        // Create stock log for added quantity
        stockLogService.createLog(
                medicineId,
                "ADD",
                quantity
        );

        // Check for low stock
        lowStockAlertService.checkLowStock(medicine);

        return inventoryRepository.save(inventory);
    }

    // Update stock
    public Inventory updateStock(Integer medicineId, Integer quantity) {

        if (quantity == null || quantity < 0) {
            throw new RuntimeException(
                    "Stock quantity cannot be negative");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found with id: " + medicineId));

        Inventory inventory = inventoryRepository.findByMedicine(medicine)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory not found for medicine id: "
                                        + medicineId));

        int previousQuantity = inventory.getQuantity();

        inventory.setQuantity(quantity);

        medicine.setQuantity(quantity);
        medicineRepository.save(medicine);

        // Calculate how much the stock changed
        int quantityChanged = quantity - previousQuantity;

        String actionType;

        if (quantityChanged > 0) {
            actionType = "ADD";
        } else if (quantityChanged < 0) {
            actionType = "REDUCE";
        } else {
            actionType = "UPDATE";
        }

        // Create log only when stock actually changes
        if (quantityChanged != 0) {
            stockLogService.createLog(
                    medicineId,
                    actionType,
                    quantityChanged
            );
        }

        // Check for low stock
        lowStockAlertService.checkLowStock(medicine);

        return inventoryRepository.save(inventory);
    }

    // View all inventory
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // View inventory by medicine
    public Inventory getInventoryByMedicineId(Integer medicineId) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found for medicine id: "
                                        + medicineId));

        return inventoryRepository.findByMedicine(medicine)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory not found for medicine id: "
                                        + medicineId));
    }
}