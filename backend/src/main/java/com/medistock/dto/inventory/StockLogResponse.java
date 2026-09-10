package com.medistock.dto.inventory;

import com.medistock.entity.StockLog;
import com.medistock.enums.AdjustmentReason;
import com.medistock.enums.StockMovementType;
import java.time.LocalDateTime;

public class StockLogResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private StockMovementType type;
    private AdjustmentReason reason;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String performedByName;
    private String referenceId;
    private String notes;
    private LocalDateTime createdAt;

    public static StockLogResponse fromEntity(StockLog log) {
        StockLogResponse dto = new StockLogResponse();
        dto.id = log.getId();
        dto.batchNumber = log.getBatchNumber();
        dto.type = log.getType();
        dto.reason = log.getReason();
        dto.quantity = log.getQuantity();
        dto.previousStock = log.getPreviousStock();
        dto.newStock = log.getNewStock();
        dto.performedByName = log.getPerformedByName();
        dto.referenceId = log.getReferenceId();
        dto.notes = log.getNotes();
        dto.createdAt = log.getCreatedAt();

        if (log.getMedicine() != null) {
            dto.medicineId = log.getMedicine().getId();
            dto.medicineName = log.getMedicine().getName();
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public StockMovementType getType() { return type; }
    public void setType(StockMovementType type) { this.type = type; }

    public AdjustmentReason getReason() { return reason; }
    public void setReason(AdjustmentReason reason) { this.reason = reason; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousStock() { return previousStock; }
    public void setPreviousStock(Integer previousStock) { this.previousStock = previousStock; }

    public Integer getNewStock() { return newStock; }
    public void setNewStock(Integer newStock) { this.newStock = newStock; }

    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
