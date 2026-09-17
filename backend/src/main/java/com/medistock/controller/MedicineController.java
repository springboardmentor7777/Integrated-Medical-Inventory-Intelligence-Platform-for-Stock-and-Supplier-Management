package com.medistock.controller;

import com.medistock.dto.common.ApiResponse;
import com.medistock.dto.medicine.BatchRequest;
import com.medistock.dto.medicine.MedicineRequest;
import com.medistock.dto.medicine.MedicineResponse;
import com.medistock.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    /**
     * GET /api/v1/medicines
     * Optional filter params: search, categoryId, stockStatus, expiryStatus
     */
    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String expiryStatus) {
        return ResponseEntity.ok(medicineService.getAllMedicines(search, categoryId, stockStatus, expiryStatus));
    }

    /**
     * GET /api/v1/medicines/search?query=
     */
    @GetMapping("/search")
    public ResponseEntity<List<MedicineResponse>> searchMedicines(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String expiryStatus) {
        String searchTerm = query != null ? query : search;
        return ResponseEntity.ok(medicineService.getAllMedicines(searchTerm, categoryId, stockStatus, expiryStatus));
    }

    /**
     * GET /api/v1/medicines/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    /**
     * POST /api/v1/medicines
     * ADMIN, INVENTORY_MANAGER, PHARMACIST
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.createMedicine(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/medicines/{id}
     * ADMIN, INVENTORY_MANAGER, PHARMACIST
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, request));
    }

    /**
     * DELETE /api/v1/medicines/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully", null));
    }

    /**
     * POST /api/v1/medicines/{id}/batches
     * Add a batch to an existing medicine
     */
    @PostMapping("/{id}/batches")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<MedicineResponse> addBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchRequest batchRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.addBatch(id, batchRequest));
    }
}
