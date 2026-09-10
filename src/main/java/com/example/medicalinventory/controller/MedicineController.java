package com.example.medicalinventory.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.medicalinventory.model.Medicine;
import com.example.medicalinventory.service.MedicineService;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public Medicine addMedicine(
            @RequestBody Medicine medicine) {

        return medicineService.addMedicine(medicine);
    }

    @GetMapping
    public List<Medicine> getAllMedicines() {

        return medicineService.getAllMedicines();
    }

    @GetMapping("/search")
    public List<Medicine> searchMedicines(
            @RequestParam String name) {

        return medicineService.searchMedicines(name);
    }


    @GetMapping("/category/{category}")
    public List<Medicine> getMedicinesByCategory(
            @PathVariable String category) {

        return medicineService
                .getMedicinesByCategory(category);
    }

    // =========================================================
    // 5. Get low-stock medicines
    // GET /api/medicines/low-stock
    // =========================================================
    @GetMapping("/low-stock")
    public List<Medicine> getLowStockMedicines() {

        return medicineService.getLowStockMedicines();
    }

    // =========================================================
    // 6. Get out-of-stock medicines
    // GET /api/medicines/out-of-stock
    // =========================================================
    @GetMapping("/out-of-stock")
    public List<Medicine> getOutOfStockMedicines() {

        return medicineService.getOutOfStockMedicines();
    }


    @GetMapping("/expired")
    public List<Medicine> getExpiredMedicines() {

        return medicineService.getExpiredMedicines();
    }

    @GetMapping("/expiring-soon")
    public List<Medicine> getExpiringSoonMedicines() {

        return medicineService
                .getExpiringSoonMedicines();
    }


    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id) {

        Optional<Medicine> medicine =
                medicineService.getMedicineById(id);

        if (medicine.isPresent()) {
            return ResponseEntity.ok(medicine.get());
        }

        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public Medicine updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine) {

        return medicineService.updateMedicine(
                id,
                medicine);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicine(
            @PathVariable Long id) {

        medicineService.deleteMedicine(id);

        return ResponseEntity.ok(
                "Medicine deleted successfully");
    }
}