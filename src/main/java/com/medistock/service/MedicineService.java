package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;

    public MedicineService(MedicineRepository medicineRepository, SupplierRepository supplierRepository) {
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
    }

    public Medicine addMedicine(MedicineRequest request) {
        Medicine medicine = new Medicine();
        mapRequestToEntity(request, medicine);
        return medicineRepository.save(medicine);
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Integer id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    public Medicine updateMedicine(Integer id, MedicineRequest request) {
        Medicine medicine = getMedicineById(id);
        mapRequestToEntity(request, medicine);
        return medicineRepository.save(medicine);
    }

    public void deleteMedicine(Integer id) {
        Medicine medicine = getMedicineById(id);
        medicineRepository.delete(medicine);
    }

    private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
        medicine.setMedicineName(request.getMedicineName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setCategory(request.getCategory());
        medicine.setQuantity(request.getQuantity());
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + request.getSupplierId()));
            medicine.setSupplier(supplier);
        }
    }
}