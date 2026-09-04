package com.medistock.entity;

import com.medistock.enums.ExpiryStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_batches")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", nullable = false, length = 100)
    private String batchNumber;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @Column(name = "mfg_date")
    private LocalDate mfgDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "purchase_price")
    private Double purchasePrice = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "expiry_status", length = 30)
    private ExpiryStatus expiryStatus = ExpiryStatus.VALID;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.expiryStatus == null) {
            this.expiryStatus = ExpiryStatus.VALID;
        }
    }

    public Batch() {
    }

    public Batch(Medicine medicine, String batchNumber, Integer quantity, LocalDate mfgDate, LocalDate expiryDate, Double purchasePrice) {
        this.medicine = medicine;
        this.batchNumber = batchNumber;
        this.quantity = quantity != null ? quantity : 0;
        this.mfgDate = mfgDate;
        this.expiryDate = expiryDate;
        this.purchasePrice = purchasePrice != null ? purchasePrice : 0.0;
        this.expiryStatus = ExpiryStatus.VALID;
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

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getMfgDate() {
        return mfgDate;
    }

    public void setMfgDate(LocalDate mfgDate) {
        this.mfgDate = mfgDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public ExpiryStatus getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(ExpiryStatus expiryStatus) {
        this.expiryStatus = expiryStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
