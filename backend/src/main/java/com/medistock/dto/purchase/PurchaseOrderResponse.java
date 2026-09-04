package com.medistock.dto.purchase;

import com.medistock.entity.PurchaseOrder;
import com.medistock.entity.PurchaseOrderItem;
import com.medistock.enums.OrderStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PurchaseOrderResponse {

    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private OrderStatus status;
    private Double totalAmount;
    private String notes;
    private List<ItemDto> items;
    private LocalDateTime createdAt;

    public static class ItemDto {
        private Long id;
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;

        public static ItemDto fromEntity(PurchaseOrderItem i) {
            ItemDto dto = new ItemDto();
            dto.id = i.getId();
            dto.medicineId = i.getMedicineId();
            dto.medicineName = i.getMedicineName();
            dto.quantity = i.getQuantity();
            dto.unitPrice = i.getUnitPrice();
            dto.totalPrice = i.getTotalPrice();
            return dto;
        }

        public Long getId() { return id; }
        public Long getMedicineId() { return medicineId; }
        public String getMedicineName() { return medicineName; }
        public Integer getQuantity() { return quantity; }
        public Double getUnitPrice() { return unitPrice; }
        public Double getTotalPrice() { return totalPrice; }
    }

    public static PurchaseOrderResponse fromEntity(PurchaseOrder po) {
        PurchaseOrderResponse dto = new PurchaseOrderResponse();
        dto.id = po.getId();
        dto.poNumber = po.getPoNumber();
        dto.supplierId = po.getSupplier() != null ? po.getSupplier().getId() : null;
        dto.supplierName = po.getSupplier() != null ? po.getSupplier().getName() : null;
        dto.orderDate = po.getOrderDate();
        dto.expectedDeliveryDate = po.getExpectedDeliveryDate();
        dto.status = po.getStatus();
        dto.totalAmount = po.getTotalAmount();
        dto.notes = po.getNotes();
        dto.createdAt = po.getCreatedAt();
        if (po.getItems() != null) {
            dto.items = po.getItems().stream()
                    .map(ItemDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
