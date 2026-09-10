package com.example.medicalinventory.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.medicalinventory.model.Medicine;
import com.example.medicalinventory.repository.MedicineRepository;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }


    public Medicine addMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }


    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }


    public Medicine updateMedicine(Long id, Medicine medicine) {

        Medicine existingMedicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        existingMedicine.setMedicineName(
                medicine.getMedicineName());

        existingMedicine.setCategory(
                medicine.getCategory());

        existingMedicine.setManufacturer(
                medicine.getManufacturer());

        existingMedicine.setQuantity(
                medicine.getQuantity());

        existingMedicine.setPrice(
                medicine.getPrice());

        existingMedicine.setExpiryDate(
                medicine.getExpiryDate());

        existingMedicine.setReorderLevel(
                medicine.getReorderLevel());

        return medicineRepository.save(existingMedicine);
    }

    // =========================================================
    // 5. Delete medicine
    // =========================================================
    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }
    public List<Medicine> getLowStockMedicines() {

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getQuantity() <=
                                medicine.getReorderLevel())
                .toList();
    }


    public List<Medicine> getOutOfStockMedicines() {

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getQuantity() == 0)
                .toList();
    }


    public List<Medicine> getExpiredMedicines() {

        LocalDate today = LocalDate.now();

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getExpiryDate() != null)
                .filter(medicine -> {

                    LocalDate expiryDate =
                            LocalDate.parse(
                                    medicine.getExpiryDate());

                    return expiryDate.isBefore(today);
                })
                .toList();
    }


    public List<Medicine> getExpiringSoonMedicines() {

        LocalDate today = LocalDate.now();
        LocalDate next30Days = today.plusDays(30);

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getExpiryDate() != null)
                .filter(medicine -> {

                    LocalDate expiryDate =
                            LocalDate.parse(
                                    medicine.getExpiryDate());

                    return !expiryDate.isBefore(today)
                            && !expiryDate.isAfter(next30Days);
                })
                .toList();
    }


    public List<Medicine> getMedicinesByCategory(
            String category) {

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getCategory() != null &&
                                medicine.getCategory()
                                        .equalsIgnoreCase(category))
                .toList();
    }

    public List<Medicine> searchMedicines(String name) {

        return medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getMedicineName() != null &&
                                medicine.getMedicineName()
                                        .toLowerCase()
                                        .contains(name.toLowerCase()))
                .toList();
    }
}