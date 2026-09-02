package com.medistock.repository;

import com.medistock.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Supplier> findByStatus(String status);
    List<Supplier> findByNameContainingIgnoreCase(String name);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status)")
    List<Supplier> searchSuppliers(@Param("search") String search, @Param("status") String status);
}
