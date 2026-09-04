package com.medistock.service;

import com.medistock.dto.dashboard.DashboardStatsResponse;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockStatus;
import com.medistock.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;
    private final InventoryRepository inventoryRepository;

    public DashboardService(MedicineRepository medicineRepository,
                            CategoryRepository categoryRepository,
                            SupplierRepository supplierRepository,
                            StockLogRepository stockLogRepository,
                            InventoryRepository inventoryRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.stockLogRepository = stockLogRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        List<Medicine> allMedicines = medicineRepository.findAll();

        long lowStockCount = allMedicines.stream()
                .filter(m -> m.getStockStatus() == StockStatus.LOW_STOCK).count();
        long outOfStockCount = allMedicines.stream()
                .filter(m -> m.getStockStatus() == StockStatus.OUT_OF_STOCK).count();
        long expiringSoonCount = allMedicines.stream()
                .filter(m -> m.getExpiryStatus() == ExpiryStatus.EXPIRING_SOON).count();
        long expiredCount = allMedicines.stream()
                .filter(m -> m.getExpiryStatus() == ExpiryStatus.EXPIRED).count();

        // Total inventory value: sum(unitPrice × quantity) across all inventory records
        double totalInventoryValue = inventoryRepository.findAll().stream()
                .mapToDouble(inv -> {
                    double price = inv.getMedicine() != null ? inv.getMedicine().getUnitPrice() : 0.0;
                    return price * inv.getQuantity();
                }).sum();

        // Category breakdown
        List<DashboardStatsResponse.CategoryBreakdown> categoryBreakdown =
                categoryRepository.findAll().stream()
                        .map(cat -> {
                            long count = allMedicines.stream()
                                    .filter(m -> m.getCategory() != null
                                            && m.getCategory().getId().equals(cat.getId()))
                                    .count();
                            return new DashboardStatsResponse.CategoryBreakdown(cat.getName(), (int) count);
                        })
                        .collect(Collectors.toList());

        // Recent activities from stock logs
        List<StockLog> recentLogs = stockLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream().limit(5).collect(Collectors.toList());

        List<DashboardStatsResponse.RecentActivity> recentActivities = recentLogs.stream()
                .map(log -> new DashboardStatsResponse.RecentActivity(
                        log.getMedicine() != null ? log.getMedicine().getId() : null,
                        log.getMedicine() != null ? log.getMedicine().getName() : "Unknown",
                        log.getType() != null ? log.getType().name() : "",
                        log.getReason() != null ? log.getReason().name() : "",
                        log.getQuantity() != null ? log.getQuantity() : 0,
                        log.getPerformedByName(),
                        log.getCreatedAt() != null ? log.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());

        // Alert lists
        List<DashboardStatsResponse.AlertItem> lowStockAlertList = allMedicines.stream()
                .filter(m -> m.getStockStatus() == StockStatus.LOW_STOCK
                        || m.getStockStatus() == StockStatus.OUT_OF_STOCK)
                .map(m -> new DashboardStatsResponse.AlertItem(
                        m.getId(), m.getName(), m.getCode(),
                        m.getStockStatus().name(), m.getExpiryStatus().name(),
                        m.getInventory() != null ? m.getInventory().getQuantity() : 0,
                        m.getNearestExpiryDate() != null ? m.getNearestExpiryDate().toString() : null
                ))
                .collect(Collectors.toList());

        List<DashboardStatsResponse.AlertItem> expiringAlertList = allMedicines.stream()
                .filter(m -> m.getExpiryStatus() == ExpiryStatus.EXPIRING_SOON
                        || m.getExpiryStatus() == ExpiryStatus.EXPIRED)
                .map(m -> new DashboardStatsResponse.AlertItem(
                        m.getId(), m.getName(), m.getCode(),
                        m.getStockStatus().name(), m.getExpiryStatus().name(),
                        m.getInventory() != null ? m.getInventory().getQuantity() : 0,
                        m.getNearestExpiryDate() != null ? m.getNearestExpiryDate().toString() : null
                ))
                .collect(Collectors.toList());

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalMedicines(allMedicines.size());
        response.setTotalCategories((int) categoryRepository.count());
        response.setTotalSuppliers((int) supplierRepository.count());
        response.setLowStockCount((int) lowStockCount);
        response.setOutOfStockCount((int) outOfStockCount);
        response.setExpiringSoonCount((int) expiringSoonCount);
        response.setExpiredCount((int) expiredCount);
        response.setTotalInventoryValue(totalInventoryValue);
        response.setCategoryBreakdown(categoryBreakdown);
        response.setRecentActivities(recentActivities);
        response.setLowStockAlertList(lowStockAlertList);
        response.setExpiringAlertList(expiringAlertList);
        return response;
    }
}
