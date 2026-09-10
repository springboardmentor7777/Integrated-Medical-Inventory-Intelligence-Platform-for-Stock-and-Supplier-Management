package com.medistock.entity;

import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "dosage_form", length = 100)
    private String dosageForm;

    @Column(name = "storage_condition", length = 200)
    private String storageCondition;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice = 0.0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 20;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", length = 30)
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    @Enumerated(EnumType.STRING)
    @Column(name = "expiry_status", length = 30)
    private ExpiryStatus expiryStatus = ExpiryStatus.VALID;

    @Column(name = "nearest_expiry_date")
    private LocalDate nearestExpiryDate;

    @OneToOne(mappedBy = "medicine", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Inventory inventory;

    @OneToMany(mappedBy = "medicine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Batch> batches = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.stockStatus == null) {
            this.stockStatus = StockStatus.IN_STOCK;
        }
        if (this.expiryStatus == null) {
            this.expiryStatus = ExpiryStatus.VALID;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Medicine() {
    }

    public Medicine(String name, String code, Category category, Supplier supplier, String dosageForm, 
                    String storageCondition, String description, Double unitPrice, Integer reorderLevel) {
        this.name = name;
        this.code = code;
        this.category = category;
        this.supplier = supplier;
        this.dosageForm = dosageForm;
        this.storageCondition = storageCondition;
        this.description = description;
        this.unitPrice = unitPrice != null ? unitPrice : 0.0;
        this.reorderLevel = reorderLevel != null ? reorderLevel : 20;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
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

    public StockStatus getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(StockStatus stockStatus) {
        this.stockStatus = stockStatus;
    }

    public ExpiryStatus getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(ExpiryStatus expiryStatus) {
        this.expiryStatus = expiryStatus;
    }

    public LocalDate getNearestExpiryDate() {
        return nearestExpiryDate;
    }

    public void setNearestExpiryDate(LocalDate nearestExpiryDate) {
        this.nearestExpiryDate = nearestExpiryDate;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
        if (inventory != null) {
            inventory.setMedicine(this);
        }
    }

    public List<Batch> getBatches() {
        return batches;
    }

    public void setBatches(List<Batch> batches) {
        this.batches = batches;
    }

    public void addBatch(Batch batch) {
        this.batches.add(batch);
        batch.setMedicine(this);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
