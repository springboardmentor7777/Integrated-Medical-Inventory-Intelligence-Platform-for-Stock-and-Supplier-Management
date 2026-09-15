package com.medistock.dto.category;

import com.medistock.entity.Category;

public class CategoryResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String storage;

    public static CategoryResponse fromEntity(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setDescription(category.getDescription());
        response.setStorage(category.getStorage());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }
}