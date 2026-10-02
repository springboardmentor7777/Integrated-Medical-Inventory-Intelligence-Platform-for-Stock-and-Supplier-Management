package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private MedicineService medicineService;

    @Test
    void addMedicine_shouldRejectExpiryDateBeforeManufacturingDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(1);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(
                LocalDate.of(2026, 10, 10));

        request.setExpiryDate(
                LocalDate.of(2026, 10, 5));

        assertThrows(
                RuntimeException.class,
                () -> medicineService.addMedicine(request)
        );
    }

    @Test
    void addMedicine_shouldAcceptValidExpiryDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(
                LocalDate.of(2026, 10, 10));

        request.setExpiryDate(
                LocalDate.of(2027, 10, 10));

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
    @Test
    void addMedicine_shouldAcceptSameManufacturingAndExpiryDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        LocalDate date = LocalDate.of(2026, 10, 10);

        request.setManufacturingDate(date);
        request.setExpiryDate(date);

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
    @Test
    void addMedicine_shouldAcceptAlreadyExpiredMedicine() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Expired Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(
                LocalDate.of(2025, 1, 1));

        request.setExpiryDate(
                LocalDate.of(2026, 1, 1));

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
    @Test
    void addMedicine_shouldAcceptNullManufacturingAndExpiryDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(null);
        request.setExpiryDate(null);

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
    @Test
    void addMedicine_shouldAcceptNullManufacturingDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(null);
        request.setExpiryDate(
                LocalDate.of(2027, 10, 10));

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
    @Test
    void addMedicine_shouldAcceptNullExpiryDate() {

        MedicineRequest request = new MedicineRequest();

        request.setMedicineName("Paracetamol");
        request.setSupplierId(null);
        request.setQuantity(10);
        request.setPrice(new java.math.BigDecimal("50.00"));

        request.setManufacturingDate(
                LocalDate.of(2026, 10, 10));

        request.setExpiryDate(null);

        org.mockito.Mockito.when(medicineRepository.save(
                        org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> medicineService.addMedicine(request)
        );
    }
}