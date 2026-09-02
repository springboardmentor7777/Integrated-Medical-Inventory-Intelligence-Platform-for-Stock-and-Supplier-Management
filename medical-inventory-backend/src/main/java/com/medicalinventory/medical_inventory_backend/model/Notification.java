package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="notifications") public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne private User recipient; @Column(nullable=false) private String type; @Column(nullable=false) private String message; private boolean readStatus=false; @Column(nullable=false) private Instant createdAt=Instant.now();
}
