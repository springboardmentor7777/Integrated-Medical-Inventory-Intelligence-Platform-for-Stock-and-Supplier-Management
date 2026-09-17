package com.medistock.dto.medicine;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class BatchRequest {

    @NotBlank(message = "Batch number is required")
    private String batchNumber;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be zero or positive")
    private Integer quantity;

    private LocalDate mfgDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private Double purchasePrice;

    public BatchRequest() {
    }

    public BatchRequest(String batchNumber, Integer quantity, LocalDate mfgDate, LocalDate expiryDate, Double purchasePrice) {
        this.batchNumber = batchNumber;
        this.quantity = quantity;
        this.mfgDate = mfgDate;
        this.expiryDate = expiryDate;
        this.purchasePrice = purchasePrice;
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
}
