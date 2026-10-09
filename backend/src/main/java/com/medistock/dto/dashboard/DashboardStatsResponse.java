package com.medistock.dto.dashboard;

import java.util.List;

public class DashboardStatsResponse {

    private int totalMedicines;
    private int totalCategories;
    private int totalSuppliers;
    private int lowStockCount;
    private int outOfStockCount;
    private int expiringSoonCount;
    private int expiredCount;
    private double totalInventoryValue;

    private List<CategoryBreakdown> categoryBreakdown;
    private List<RecentActivity> recentActivities;
    private List<AlertItem> lowStockAlertList;
    private List<AlertItem> expiringAlertList;

    // --- Nested classes ---

    public static class CategoryBreakdown {
        private String categoryName;
        private int count;

        public CategoryBreakdown(String categoryName, int count) {
            this.categoryName = categoryName;
            this.count = count;
        }

        public String getCategoryName() { return categoryName; }
        public int getCount() { return count; }
    }

    public static class RecentActivity {
        private Long medicineId;
        private String medicineName;
        private String type;
        private String reason;
        private int quantity;
        private String performedByName;
        private String createdAt;

        public RecentActivity(Long medicineId, String medicineName, String type, String reason,
                              int quantity, String performedByName, String createdAt) {
            this.medicineId = medicineId;
            this.medicineName = medicineName;
            this.type = type;
            this.reason = reason;
            this.quantity = quantity;
            this.performedByName = performedByName;
            this.createdAt = createdAt;
        }

        public Long getMedicineId() { return medicineId; }
        public String getMedicineName() { return medicineName; }
        public String getType() { return type; }
        public String getReason() { return reason; }
        public int getQuantity() { return quantity; }
        public String getPerformedByName() { return performedByName; }
        public String getCreatedAt() { return createdAt; }
    }

    public static class AlertItem {
        private Long medicineId;
        private String medicineName;
        private String medicineCode;
        private String stockStatus;
        private String expiryStatus;
        private Integer quantity;
        private String nearestExpiryDate;

        public AlertItem(Long medicineId, String medicineName, String medicineCode,
                         String stockStatus, String expiryStatus, Integer quantity, String nearestExpiryDate) {
            this.medicineId = medicineId;
            this.medicineName = medicineName;
            this.medicineCode = medicineCode;
            this.stockStatus = stockStatus;
            this.expiryStatus = expiryStatus;
            this.quantity = quantity;
            this.nearestExpiryDate = nearestExpiryDate;
        }

        public Long getMedicineId() { return medicineId; }
        public String getMedicineName() { return medicineName; }
        public String getMedicineCode() { return medicineCode; }
        public String getStockStatus() { return stockStatus; }
        public String getExpiryStatus() { return expiryStatus; }
        public Integer getQuantity() { return quantity; }
        public String getNearestExpiryDate() { return nearestExpiryDate; }
    }

    // --- Root getters/setters ---

    public int getTotalMedicines() { return totalMedicines; }
    public void setTotalMedicines(int totalMedicines) { this.totalMedicines = totalMedicines; }

    public int getTotalCategories() { return totalCategories; }
    public void setTotalCategories(int totalCategories) { this.totalCategories = totalCategories; }

    public int getTotalSuppliers() { return totalSuppliers; }
    public void setTotalSuppliers(int totalSuppliers) { this.totalSuppliers = totalSuppliers; }

    public int getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(int lowStockCount) { this.lowStockCount = lowStockCount; }

    public int getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(int outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public int getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(int expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public int getExpiredCount() { return expiredCount; }
    public void setExpiredCount(int expiredCount) { this.expiredCount = expiredCount; }

    public double getTotalInventoryValue() { return totalInventoryValue; }
    public void setTotalInventoryValue(double totalInventoryValue) { this.totalInventoryValue = totalInventoryValue; }

    public List<CategoryBreakdown> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryBreakdown> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<RecentActivity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivity> recentActivities) { this.recentActivities = recentActivities; }

    public List<AlertItem> getLowStockAlertList() { return lowStockAlertList; }
    public void setLowStockAlertList(List<AlertItem> lowStockAlertList) { this.lowStockAlertList = lowStockAlertList; }

    public List<AlertItem> getExpiringAlertList() { return expiringAlertList; }
    public void setExpiringAlertList(List<AlertItem> expiringAlertList) { this.expiringAlertList = expiringAlertList; }
}
