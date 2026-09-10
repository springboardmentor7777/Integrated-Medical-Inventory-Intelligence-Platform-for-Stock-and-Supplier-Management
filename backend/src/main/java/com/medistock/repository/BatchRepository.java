package com.medistock.repository;

import com.medistock.entity.Batch;
import com.medistock.enums.ExpiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByMedicineId(Long medicineId);
    List<Batch> findByExpiryStatus(ExpiryStatus expiryStatus);
    List<Batch> findByExpiryDateBefore(LocalDate date);
    List<Batch> findByExpiryDateBetween(LocalDate from, LocalDate to);
    List<Batch> findByExpiryStatusOrderByExpiryDateAsc(ExpiryStatus expiryStatus);
}

