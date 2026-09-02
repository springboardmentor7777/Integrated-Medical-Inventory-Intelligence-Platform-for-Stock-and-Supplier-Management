package com.medistock.dto.inventory;

import com.medistock.entity.Inventory;
import com.medistock.enums.StockStatus;
import java.time.LocalDateTime;

public class InventoryResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String categoryName;
    private String supplierName;
    private Integer quantity;
    private Integer reorderLevel;
    private StockStatus stockStatus;
    private LocalDateTime updatedAt;

    public static InventoryResponse fromEntity(Inventory inv) {
        InventoryResponse dto = new InventoryResponse();
        dto.id = inv.getId();
        dto.quantity = inv.getQuantity();
        dto.reorderLevel = inv.getReorderLevel();
        dto.stockStatus = inv.getStockStatus();
        dto.updatedAt = inv.getUpdatedAt();

        if (inv.getMedicine() != null) {
            dto.medicineId = inv.getMedicine().getId();
            dto.medicineName = inv.getMedicine().getName();
            dto.medicineCode = inv.getMedicine().getCode();
            dto.categoryName = inv.getMedicine().getCategory() != null
                    ? inv.getMedicine().getCategory().getName() : null;
            dto.supplierName = inv.getMedicine().getSupplier() != null
                    ? inv.getMedicine().getSupplier().getName() : null;
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public StockStatus getStockStatus() { return stockStatus; }
    public void setStockStatus(StockStatus stockStatus) { this.stockStatus = stockStatus; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
