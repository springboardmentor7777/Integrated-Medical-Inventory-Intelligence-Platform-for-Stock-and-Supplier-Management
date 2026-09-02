package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.math.BigDecimal;
@Entity @Table(name="medicines") public class Medicine {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String sku; @Column(nullable=false) private String name; private String genericName; private String manufacturer; private String dosageForm; private String strength; private BigDecimal unitPrice; private int reorderLevel=0; private boolean active=true;
}
