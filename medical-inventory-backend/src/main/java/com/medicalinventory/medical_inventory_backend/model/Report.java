package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="reports") public class Report {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String type; @Column(nullable=false) private String name; @ManyToOne private User generatedBy; @Column(nullable=false) private Instant generatedAt=Instant.now(); private String storageReference;
}
