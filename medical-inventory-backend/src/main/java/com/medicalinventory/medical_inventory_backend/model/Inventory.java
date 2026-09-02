package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.LocalDate;
@Entity @Table(name="inventory", uniqueConstraints=@UniqueConstraint(columnNames={"medicine_id","batchNumber"})) public class Inventory {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Medicine medicine; @ManyToOne private Supplier supplier; @Column(nullable=false) private String batchNumber; @Column(nullable=false) private int quantity; private String location; @Column(nullable=false) private LocalDate expiryDate;
}
