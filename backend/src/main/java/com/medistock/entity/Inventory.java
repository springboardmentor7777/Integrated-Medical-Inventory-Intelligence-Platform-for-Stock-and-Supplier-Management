package com.medistock.entity;

import com.medistock.enums.StockStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false, unique = true)
    private Medicine medicine;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 20;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 30)
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateStockStatus() {
        this.updatedAt = LocalDateTime.now();
        if (this.quantity == null || this.quantity <= 0) {
            this.stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (this.reorderLevel != null && this.quantity <= this.reorderLevel) {
            this.stockStatus = StockStatus.LOW_STOCK;
        } else {
            this.stockStatus = StockStatus.IN_STOCK;
        }
    }

    public Inventory() {
    }

    public Inventory(Medicine medicine, Integer quantity, Integer reorderLevel) {
        this.medicine = medicine;
        this.quantity = quantity != null ? quantity : 0;
        this.reorderLevel = reorderLevel != null ? reorderLevel : 20;
        updateStockStatus();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = Math.max(0, quantity != null ? quantity : 0);
        updateStockStatus();
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel != null ? reorderLevel : 0;
        updateStockStatus();
    }

    public StockStatus getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(StockStatus stockStatus) {
        this.stockStatus = stockStatus;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
