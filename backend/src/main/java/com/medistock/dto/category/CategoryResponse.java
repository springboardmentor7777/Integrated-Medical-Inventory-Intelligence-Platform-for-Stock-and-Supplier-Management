package com.medistock.dto.category;

import com.medistock.entity.Category;

public class CategoryResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String storage;
    private Integer medicineCount = 0;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id, String name, String code, String description, String storage, Integer medicineCount) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.storage = storage;
        this.medicineCount = medicineCount != null ? medicineCount : 0;
    }

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setDescription(category.getDescription());
        response.setStorage(category.getStorage());
        response.setMedicineCount(0);
        return response;
    }

    public static CategoryResponse fromEntity(Category category, int medicineCount) {
        if (category == null) return null;
        CategoryResponse response = fromEntity(category);
        response.setMedicineCount(medicineCount);
        return response;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStorage() {
        return storage;
    }

    public void setStorage(String storage) {
        this.storage = storage;
    }

    public Integer getMedicineCount() {
        return medicineCount;
    }

    public void setMedicineCount(Integer medicineCount) {
        this.medicineCount = medicineCount;
    }
}
