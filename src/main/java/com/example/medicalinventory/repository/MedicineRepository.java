package com.example.medicalinventory.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.medicalinventory.model.Medicine;

public interface MedicineRepository  extends JpaRepository<Medicine, Long> {
}
