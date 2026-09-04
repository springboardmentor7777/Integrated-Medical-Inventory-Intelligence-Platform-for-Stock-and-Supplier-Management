package com.example.medicalinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.medicalinventory.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

}