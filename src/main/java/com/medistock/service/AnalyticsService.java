
        package com.medistock.service;

import com.medistock.dto.CategoryInventoryDTO;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;

    public AnalyticsService(
            InventoryRepository inventoryRepository,
            MedicineRepository medicineRepository) {

        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
    }

    // Total number of medicines
    public long getTotalMedicines() {
        return medicineRepository.count();
    }

    // Total stock units
    public long getTotalStock() {
        return inventoryRepository.getTotalStock();
    }

    // Number of low-stock medicines
    // Low stock = quantity <= 20
    public long getLowStockCount() {
        return inventoryRepository.countLowStockMedicines();
    }

    // Number of expired medicines
    public long getExpiredCount() {
        LocalDate today = LocalDate.now();

        return medicineRepository
                .findExpiredMedicines(today)
                .size();
    }

    // Number of medicines expiring within next 30 days
    public long getExpiringSoonCount() {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(30);

        return medicineRepository
                .findMedicinesExpiringBetween(today, futureDate)
                .size();
    }

    // Category-wise inventory analytics
    public List<CategoryInventoryDTO> getCategoryWiseInventory() {
        return medicineRepository.getCategoryWiseInventory();
    }

    // Complete analytics summary
    public Map<String, Long> getAnalyticsSummary() {

        Map<String, Long> summary = new HashMap<>();

        summary.put("totalMedicines", getTotalMedicines());
        summary.put("totalStock", getTotalStock());
        summary.put("lowStock", getLowStockCount());
        summary.put("expired", getExpiredCount());
        summary.put("expiringSoon", getExpiringSoonCount());

        return summary;
    }
}

