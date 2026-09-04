package com.medistock.dto.inventory;

import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.StockMovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StockUpdateRequest {

    @NotNull(message = "Movement type is required (IN or OUT)")
    private StockMovementType type;

    @NotNull(message = "Adjustment reason is required")
    private AdjustmentReason reason;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String batchNumber;

    private String notes;

    public StockMovementType getType() { return type; }
    public void setType(StockMovementType type) { this.type = type; }

    public AdjustmentReason getReason() { return reason; }
    public void setReason(AdjustmentReason reason) { this.reason = reason; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
