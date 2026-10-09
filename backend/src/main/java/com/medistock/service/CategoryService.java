package com.medistock.service;

import com.medistock.dto.category.CategoryRequest;
import com.medistock.dto.category.CategoryResponse;
import com.medistock.entity.Category;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public CategoryService(CategoryRepository categoryRepository, MedicineRepository medicineRepository) {
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> {
                    int count = medicineRepository.findByCategoryId(cat.getId()).size();
                    return CategoryResponse.fromEntity(cat, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        int count = medicineRepository.findByCategoryId(category.getId()).size();
        return CategoryResponse.fromEntity(category, count);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = "CAT-" + request.getName().replaceAll("[^a-zA-Z0-9]", "").substring(0, Math.min(3, request.getName().length())).toUpperCase();
        }

        if (categoryRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Category code already exists: " + code);
        }

        Category category = new Category(
                request.getName(),
                code,
                request.getDescription(),
                request.getStorage() != null ? request.getStorage() : "Room Temperature (15-25°C)"
        );

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved, 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (request.getCode() != null && !request.getCode().equalsIgnoreCase(category.getCode())) {
            if (categoryRepository.existsByCodeIgnoreCase(request.getCode())) {
                throw new DuplicateResourceException("Category code already in use: " + request.getCode());
            }
            category.setCode(request.getCode());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getStorage() != null) {
            category.setStorage(request.getStorage());
        }

        Category updated = categoryRepository.save(category);
        int count = medicineRepository.findByCategoryId(updated.getId()).size();
        return CategoryResponse.fromEntity(updated, count);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        int medCount = medicineRepository.findByCategoryId(id).size();
        if (medCount > 0) {
            throw new BadRequestException("Cannot delete category containing " + medCount + " assigned medicine(s).");
        }

        categoryRepository.delete(category);
    }
}
