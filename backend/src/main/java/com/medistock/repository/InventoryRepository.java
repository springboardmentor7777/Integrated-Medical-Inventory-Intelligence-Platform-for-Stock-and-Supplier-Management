package com.medistock.repository;

import com.medistock.entity.Inventory;
import com.medistock.enums.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByMedicineId(Long medicineId);
    List<Inventory> findByStockStatus(StockStatus stockStatus);
}
