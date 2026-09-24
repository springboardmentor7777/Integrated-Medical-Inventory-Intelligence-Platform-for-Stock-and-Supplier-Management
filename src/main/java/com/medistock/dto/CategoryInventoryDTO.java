package com.medistock.dto;

public class CategoryInventoryDTO {

    private String category;
    private Long medicineCount;
    private Long totalStock;

    public CategoryInventoryDTO(
            String category,
            Long medicineCount,
            Number totalStock) {

        this.category = category;
        this.medicineCount = medicineCount;
        this.totalStock = totalStock.longValue();
    }

    public String getCategory() {
        return category;
    }

    public Long getMedicineCount() {
        return medicineCount;
    }

    public Long getTotalStock() {
        return totalStock;
    }
}