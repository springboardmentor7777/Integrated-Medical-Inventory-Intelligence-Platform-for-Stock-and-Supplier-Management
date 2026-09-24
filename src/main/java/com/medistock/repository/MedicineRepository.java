package com.medistock.repository;

import com.medistock.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Integer> {

    // Medicines whose expiry date has already passed
    @Query("SELECT m FROM Medicine m WHERE m.expiryDate < :today")
    List<Medicine> findExpiredMedicines(LocalDate today);

    // Medicines expiring between today and the given date
    @Query("""
            SELECT m FROM Medicine m
            WHERE m.expiryDate >= :today
            AND m.expiryDate <= :futureDate
            """)
    List<Medicine> findMedicinesExpiringBetween(
            LocalDate today,
            LocalDate futureDate
    );
}