package com.medistock.repository;

import com.medistock.entity.PurchaseOrder;
import com.medistock.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    boolean existsByPoNumber(String poNumber);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByStatus(OrderStatus status);
    List<PurchaseOrder> findBySupplierIdAndStatus(Long supplierId, OrderStatus status);
    List<PurchaseOrder> findByOrderDateBetween(LocalDate from, LocalDate to);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:search IS NULL OR LOWER(po.poNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<PurchaseOrder> searchOrders(@Param("supplierId") Long supplierId,
                                     @Param("status") OrderStatus status,
                                     @Param("search") String search);
}
