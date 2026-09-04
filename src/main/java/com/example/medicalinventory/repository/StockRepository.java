package com.example.medicalinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.medicalinventory.model.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {
}