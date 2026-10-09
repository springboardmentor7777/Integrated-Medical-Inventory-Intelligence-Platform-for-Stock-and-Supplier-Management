package com.medistock.dto.medicine;

import com.medistock.entity.Batch;
import java.time.LocalDate;

public class BatchDto {

    private Long id;
    private String batchNumber;
    private Integer quantity;
    private LocalDate mfgDate;
    private LocalDate expiryDate;
    private Double purchasePrice;
    private String expiryStatus;

    public BatchDto() {
    }

    public static BatchDto fromEntity(Batch batch) {
        if (batch == null) return null;
        BatchDto dto = new BatchDto();
        dto.setId(batch.getId());
        dto.setBatchNumber(batch.getBatchNumber());
        dto.setQuantity(batch.getQuantity());
        dto.setMfgDate(batch.getMfgDate());
        dto.setExpiryDate(batch.getExpiryDate());
        dto.setPurchasePrice(batch.getPurchasePrice());
        dto.setExpiryStatus(batch.getExpiryStatus() != null ? batch.getExpiryStatus().name() : null);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(String expiryStatus) {
        this.expiryStatus = expiryStatus;
    }
}
