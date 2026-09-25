package com.medistock.repository;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    Optional<Inventory> findByMedicine(Medicine medicine);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i")
    Long getTotalStock();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity <= 20")
    Long countLowStockMedicines();

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= 20")
    List<Inventory> findLowStockMedicines();
}