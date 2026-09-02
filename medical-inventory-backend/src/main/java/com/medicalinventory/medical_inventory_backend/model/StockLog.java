package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="stock_logs") public class StockLog {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Inventory inventory; @ManyToOne(optional=false) private User performedBy; @Column(nullable=false) private String action; @Column(nullable=false) private int quantityChange; private String notes; @Column(nullable=false) private Instant createdAt=Instant.now();
}
