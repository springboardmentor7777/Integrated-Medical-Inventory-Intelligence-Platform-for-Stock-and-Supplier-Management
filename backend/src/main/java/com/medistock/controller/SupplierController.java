package com.medistock.controller;

import com.medistock.dto.common.ApiResponse;
import com.medistock.dto.purchase.PurchaseOrderResponse;
import com.medistock.dto.supplier.SupplierRequest;
import com.medistock.dto.supplier.SupplierResponse;
import com.medistock.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    /** GET /api/v1/suppliers?search=&status= */
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(supplierService.getAllSuppliers(search, status));
    }

    /** GET /api/v1/suppliers/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    /** POST /api/v1/suppliers — ADMIN or INVENTORY_MANAGER only */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** PUT /api/v1/suppliers/{id} — ADMIN or INVENTORY_MANAGER only */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    /** DELETE /api/v1/suppliers/{id} — ADMIN only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted successfully", null));
    }

    /** GET /api/v1/suppliers/{id}/purchases — purchase history for this supplier */
    @GetMapping("/{id}/purchases")
    public ResponseEntity<List<PurchaseOrderResponse>> getSupplierPurchases(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierPurchases(id));
    }
}
