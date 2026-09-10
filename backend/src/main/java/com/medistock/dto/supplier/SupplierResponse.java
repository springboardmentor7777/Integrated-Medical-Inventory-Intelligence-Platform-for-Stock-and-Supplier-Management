package com.medistock.dto.supplier;

import com.medistock.entity.Supplier;
import java.time.LocalDateTime;

public class SupplierResponse {

    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String taxId;
    private String paymentTerms;
    private String status;
    private Double rating;
    private Double onTimeDeliveryRate;
    private Integer leadTimeDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Static factory — converts Supplier entity → SupplierResponse DTO */
    public static SupplierResponse fromEntity(Supplier s) {
        SupplierResponse dto = new SupplierResponse();
        dto.id                = s.getId();
        dto.name              = s.getName();
        dto.contactPerson     = s.getContactPerson();
        dto.email             = s.getEmail();
        dto.phone             = s.getPhone();
        dto.address           = s.getAddress();
        dto.taxId             = s.getTaxId();
        dto.paymentTerms      = s.getPaymentTerms();
        dto.status            = s.getStatus();
        dto.rating            = s.getRating();
        dto.onTimeDeliveryRate = s.getOnTimeDeliveryRate();
        dto.leadTimeDays      = s.getLeadTimeDays();
        dto.createdAt         = s.getCreatedAt();
        dto.updatedAt         = s.getUpdatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Double getOnTimeDeliveryRate() { return onTimeDeliveryRate; }
    public void setOnTimeDeliveryRate(Double onTimeDeliveryRate) { this.onTimeDeliveryRate = onTimeDeliveryRate; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
