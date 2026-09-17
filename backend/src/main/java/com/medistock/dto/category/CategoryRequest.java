package com.medistock.dto.category;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String code;

    private String description;

    private String storage;

    public CategoryRequest() {
    }

    public CategoryRequest(String name, String code, String description, String storage) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.storage = storage;
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
}
