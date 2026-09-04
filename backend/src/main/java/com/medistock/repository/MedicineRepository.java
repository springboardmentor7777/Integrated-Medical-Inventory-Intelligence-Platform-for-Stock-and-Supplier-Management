package com.medistock.repository;

import com.medistock.entity.Medicine;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<Medicine> findByCategoryId(Long categoryId);
    List<Medicine> findByStockStatus(StockStatus stockStatus);
    List<Medicine> findByExpiryStatus(ExpiryStatus expiryStatus);

    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.code) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Medicine> searchMedicines(@Param("query") String query);
}
