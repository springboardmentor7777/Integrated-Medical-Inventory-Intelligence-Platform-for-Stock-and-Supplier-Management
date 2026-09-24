package com.medistock.repository;

import com.medistock.entity.LowStockAlert;
import com.medistock.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LowStockAlertRepository
        extends JpaRepository<LowStockAlert, Integer> {

    List<LowStockAlert> findByStatus(String status);

    List<LowStockAlert> findByMedicine(Medicine medicine);
}