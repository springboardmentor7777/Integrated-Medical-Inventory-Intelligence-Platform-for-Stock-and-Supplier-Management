package com.medistock.dto.medicine;

import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 200, message = "Medicine name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Medicine code is required")
    @Size(max = 50, message = "Medicine code must not exceed 50 characters")
    private String code;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long supplierId;

    @Size(max = 100, message = "Dosage form must not exceed 100 characters")
    private String dosageForm;

    @Size(max = 200, message = "Storage condition must not exceed 200 characters")
    private String storageCondition;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Double unitPrice = 0.0;
    private Integer reorderLevel = 20;
    private Integer totalQuantity = 0;
    private String stockStatus = "IN_STOCK";
    private String expiryStatus = "VALID";
    private LocalDate nearestExpiryDate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

    public String getStorageCondition() { return storageCondition; }
    public void setStorageCondition(String storageCondition) { this.storageCondition = storageCondition; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public String getExpiryStatus() { return expiryStatus; }
    public void setExpiryStatus(String expiryStatus) { this.expiryStatus = expiryStatus; }

    public LocalDate getNearestExpiryDate() { return nearestExpiryDate; }
    public void setNearestExpiryDate(LocalDate nearestExpiryDate) { this.nearestExpiryDate = nearestExpiryDate; }

    public StockStatus toStockStatus() {
        if (this.stockStatus == null || this.stockStatus.isBlank()) {
            return StockStatus.IN_STOCK;
        }
        try {
            return StockStatus.valueOf(this.stockStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return StockStatus.IN_STOCK;
        }
    }

    public ExpiryStatus toExpiryStatus() {
        if (this.expiryStatus == null || this.expiryStatus.isBlank()) {
            return ExpiryStatus.VALID;
        }
        try {
            return ExpiryStatus.valueOf(this.expiryStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ExpiryStatus.VALID;
        }
    }
}