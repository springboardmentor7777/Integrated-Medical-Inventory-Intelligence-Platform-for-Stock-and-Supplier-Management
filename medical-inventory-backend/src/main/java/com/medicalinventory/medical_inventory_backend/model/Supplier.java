package com.medicalinventory.medical_inventory_backend.model;
import jakarta.persistence.*;
@Entity @Table(name="suppliers") public class Supplier {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; @Column(unique=true) private String email; private String phone; private String address; private boolean active=true;
}
