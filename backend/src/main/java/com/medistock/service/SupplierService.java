package com.medistock.service;

import com.medistock.dto.supplier.SupplierRequest;
import com.medistock.dto.supplier.SupplierResponse;
import com.medistock.dto.purchase.PurchaseOrderResponse;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.PurchaseOrderRepository;
import com.medistock.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // ── GET ALL (with optional search & status filter) ──────────────────────
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers(String search, String status) {
        List<Supplier> suppliers;
        if ((search == null || search.isBlank()) && (status == null || status.isBlank())) {
            suppliers = supplierRepository.findAll();
        } else {
            String s = (search == null || search.isBlank()) ? null : search.trim();
            String st = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();
            suppliers = supplierRepository.searchSuppliers(s, st);
        }
        return suppliers.stream()
                .map(SupplierResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return SupplierResponse.fromEntity(supplier);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException(
                    "A supplier with the name '" + request.getName() + "' already exists");
        }

        Supplier supplier = new Supplier(
                request.getName().trim(),
                request.getContactPerson() != null ? request.getContactPerson().trim() : null,
                request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null,
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null
        );

        if (request.getTaxId() != null) supplier.setTaxId(request.getTaxId().trim());
        if (request.getPaymentTerms() != null) supplier.setPaymentTerms(request.getPaymentTerms().trim());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            supplier.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getRating() != null) supplier.setRating(request.getRating());
        if (request.getLeadTimeDays() != null) supplier.setLeadTimeDays(request.getLeadTimeDays());

        return SupplierResponse.fromEntity(supplierRepository.save(supplier));
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        // Check name uniqueness only if name changed
        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equalsIgnoreCase(supplier.getName())
                    && supplierRepository.existsByNameIgnoreCase(newName)) {
                throw new DuplicateResourceException(
                        "A supplier with the name '" + newName + "' already exists");
            }
            supplier.setName(newName);
        }
        if (request.getContactPerson() != null) supplier.setContactPerson(request.getContactPerson().trim());
        if (request.getEmail() != null) supplier.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) supplier.setAddress(request.getAddress().trim());
        if (request.getTaxId() != null) supplier.setTaxId(request.getTaxId().trim());
        if (request.getPaymentTerms() != null) supplier.setPaymentTerms(request.getPaymentTerms().trim());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            supplier.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getRating() != null) supplier.setRating(request.getRating());
        if (request.getLeadTimeDays() != null) supplier.setLeadTimeDays(request.getLeadTimeDays());

        return SupplierResponse.fromEntity(supplierRepository.save(supplier));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        // Guard: do not delete if supplier has purchase orders
        if (!purchaseOrderRepository.findBySupplierId(id).isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete supplier '" + supplier.getName() +
                    "' because they have existing purchase orders. Deactivate them instead.");
        }
        supplierRepository.delete(supplier);
    }

    // ── SUPPLIER PURCHASE HISTORY ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getSupplierPurchases(Long supplierId) {
        supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
        return purchaseOrderRepository.findBySupplierId(supplierId)
                .stream()
                .map(PurchaseOrderResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
