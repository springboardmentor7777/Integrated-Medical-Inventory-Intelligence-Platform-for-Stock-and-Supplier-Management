package com.medistock.dto.medicine;

import com.medistock.entity.Medicine;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class MedicineResponse {

    private Long id;
    private String name;
    private String code;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private String dosageForm;
    private String storageCondition;
    private String description;
    private Double unitPrice;
    private Integer reorderLevel;
    private Integer totalQuantity;
    private String stockStatus;
    private String expiryStatus;
    private LocalDate nearestExpiryDate;
    private List<BatchDto> batches = new ArrayList<>();

    public MedicineResponse() {
    }

    public static MedicineResponse fromEntity(Medicine medicine) {
        if (medicine == null) return null;
        MedicineResponse res = new MedicineResponse();
        res.setId(medicine.getId());
        res.setName(medicine.getName());
        res.setCode(medicine.getCode());
        
        if (medicine.getCategory() != null) {
            res.setCategoryId(medicine.getCategory().getId());
            res.setCategoryName(medicine.getCategory().getName());
        }
        
        if (medicine.getSupplier() != null) {
            res.setSupplierId(medicine.getSupplier().getId());
            res.setSupplierName(medicine.getSupplier().getName());
        }

        res.setDosageForm(medicine.getDosageForm());
        res.setStorageCondition(medicine.getStorageCondition());
        res.setDescription(medicine.getDescription());
        res.setUnitPrice(medicine.getUnitPrice());
        res.setReorderLevel(medicine.getReorderLevel());
        
        if (medicine.getInventory() != null) {
            res.setTotalQuantity(medicine.getInventory().getQuantity());
            res.setStockStatus(medicine.getInventory().getStockStatus() != null ? 
                medicine.getInventory().getStockStatus().name() : null);
        } else {
            res.setTotalQuantity(0);
            res.setStockStatus(medicine.getStockStatus() != null ? 
                medicine.getStockStatus().name() : "OUT_OF_STOCK");
        }

        res.setExpiryStatus(medicine.getExpiryStatus() != null ? 
            medicine.getExpiryStatus().name() : "VALID");
        res.setNearestExpiryDate(medicine.getNearestExpiryDate());

        if (medicine.getBatches() != null) {
            res.setBatches(medicine.getBatches().stream()
                .map(BatchDto::fromEntity)
                .collect(Collectors.toList()));
        }

        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getDosageForm() {
        return dosageForm;
    }

    public void setDosageForm(String dosageForm) {
        this.dosageForm = dosageForm;
    }

    public String getStorageCondition() {
        return storageCondition;
    }

    public void setStorageCondition(String storageCondition) {
        this.storageCondition = storageCondition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public String getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(String expiryStatus) {
        this.expiryStatus = expiryStatus;
    }

    public LocalDate getNearestExpiryDate() {
        return nearestExpiryDate;
    }

    public void setNearestExpiryDate(LocalDate nearestExpiryDate) {
        this.nearestExpiryDate = nearestExpiryDate;
    }

    public List<BatchDto> getBatches() {
        return batches;
    }

    public void setBatches(List<BatchDto> batches) {
        this.batches = batches;
    }
}
