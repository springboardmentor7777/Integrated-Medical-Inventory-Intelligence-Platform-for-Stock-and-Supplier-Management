package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="purchase_orders") public class PurchaseOrder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String orderNumber; @ManyToOne(optional=false) private Supplier supplier; @Column(nullable=false) private String status="DRAFT"; @ManyToOne private User createdBy; @Column(nullable=false) private Instant createdAt=Instant.now();
}
