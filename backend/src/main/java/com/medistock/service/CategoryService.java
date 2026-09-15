package com.medistock.service;

import com.medistock.dto.category.CategoryRequest;
import com.medistock.dto.category.CategoryResponse;
import com.medistock.entity.Category;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName() == null ? "" : request.getName().trim();
        String code = request.getCode() == null ? "" : request.getCode().trim();
        if (name.isBlank() || code.isBlank()) {
            throw new BadRequestException("Category name and code are required");
        }
        if (categoryRepository.existsByNameIgnoreCase(name) || categoryRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Category with the same name or code already exists");
        }
        Category category = new Category(name, code, request.getDescription(), request.getStorage());
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equalsIgnoreCase(category.getName()) && categoryRepository.existsByNameIgnoreCase(newName)) {
                throw new DuplicateResourceException("Category with the same name already exists");
            }
            category.setName(newName);
        }
        if (request.getCode() != null && !request.getCode().isBlank()) {
            String newCode = request.getCode().trim();
            if (!newCode.equalsIgnoreCase(category.getCode()) && categoryRepository.existsByCodeIgnoreCase(newCode)) {
                throw new DuplicateResourceException("Category with the same code already exists");
            }
            category.setCode(newCode);
        }
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getStorage() != null) category.setStorage(request.getStorage());
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (categoryRepository.count() <= 1) {
            throw new BadRequestException("At least one category must remain in the catalog");
        }
        categoryRepository.delete(category);
    }
}