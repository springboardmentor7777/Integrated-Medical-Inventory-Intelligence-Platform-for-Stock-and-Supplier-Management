package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.LocalDate;
@Entity @Table(name="expiry_tracking") public class ExpiryTracking {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @OneToOne(optional=false) private Inventory inventory; @Column(nullable=false) private LocalDate expiryDate; @Column(nullable=false) private String status="OPEN"; private LocalDate resolvedAt;
}
