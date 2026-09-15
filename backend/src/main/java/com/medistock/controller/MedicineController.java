package com.medistock.controller;

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
@RequestMapping("/api/v1")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/medicines")
    public ResponseEntity<List<MedicineResponse>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String expiryStatus) {
        return ResponseEntity.ok(medicineService.getAllMedicines(search, categoryId, stockStatus, expiryStatus));
    }

    @GetMapping("/medicines/search")
    public ResponseEntity<List<MedicineResponse>> searchMedicines(@RequestParam String query) {
        return ResponseEntity.ok(medicineService.searchMedicines(query));
    }

    @GetMapping("/medicines/category/{categoryName}")
    public ResponseEntity<List<MedicineResponse>> getMedicinesByCategory(@PathVariable String categoryName) {
        return ResponseEntity.ok(medicineService.getAllMedicines(categoryName, null, null, null));
    }

    @GetMapping("/medicines/low-stock")
    public ResponseEntity<List<MedicineResponse>> getLowStockMedicines() {
        return ResponseEntity.ok(medicineService.getLowStockMedicines());
    }

    @GetMapping("/medicines/out-of-stock")
    public ResponseEntity<List<MedicineResponse>> getOutOfStockMedicines() {
        return ResponseEntity.ok(medicineService.getOutOfStockMedicines());
    }

    @GetMapping("/medicines/expired")
    public ResponseEntity<List<MedicineResponse>> getExpiredMedicines() {
        return ResponseEntity.ok(medicineService.getExpiredMedicines());
    }

    @GetMapping("/medicines/expiring-soon")
    public ResponseEntity<List<MedicineResponse>> getExpiringSoonMedicines() {
        return ResponseEntity.ok(medicineService.getExpiringSoonMedicines());
    }

    @GetMapping("/medicines/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.createMedicine(request));
    }

    @PutMapping("/medicines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','PHARMACIST')")
    public ResponseEntity<MedicineResponse> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, request));
    }

    @DeleteMapping("/medicines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}