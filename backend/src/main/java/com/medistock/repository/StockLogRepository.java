package com.medistock.repository;

import com.medistock.entity.StockLog;
import com.medistock.enums.StockMovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    List<StockLog> findByMedicineIdOrderByCreatedAtDesc(Long medicineId);
    List<StockLog> findByType(StockMovementType type);
    List<StockLog> findTop50ByOrderByCreatedAtDesc();
}
