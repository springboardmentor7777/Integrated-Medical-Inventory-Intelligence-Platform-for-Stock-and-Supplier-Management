package com.medistock.service;

import com.medistock.entity.LowStockAlert;
import com.medistock.entity.Medicine;
import com.medistock.repository.LowStockAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LowStockAlertServiceTest {

    @Mock
    private LowStockAlertRepository lowStockAlertRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LowStockAlertService lowStockAlertService;

    private Medicine medicine;

    @BeforeEach
    void setUp() {
        medicine = new Medicine();
        medicine.setId(1);
        medicine.setMedicineName("Paracetamol");
        medicine.setQuantity(10);
        medicine.setLowStockThreshold(20);
    }

    @Test
    void shouldCreateAlertAndNotificationWhenStockIsLow() {

        lowStockAlertService.checkLowStock(medicine);

        verify(lowStockAlertRepository, times(1))
                .save(any(LowStockAlert.class));

        verify(notificationService, times(1))
                .createLowStockNotification(
                        medicine,
                        10,
                        20
                );
    }

    @Test
    void shouldNotCreateAlertWhenStockIsAboveThreshold() {

        medicine.setQuantity(25);

        lowStockAlertService.checkLowStock(medicine);

        verify(lowStockAlertRepository, never())
                .save(any(LowStockAlert.class));

        verify(notificationService, never())
                .createLowStockNotification(
                        any(Medicine.class),
                        anyInt(),
                        anyInt()
                );
    }

    @Test
    void shouldCreateAlertWhenStockEqualsThreshold() {

        medicine.setQuantity(20);

        lowStockAlertService.checkLowStock(medicine);

        verify(lowStockAlertRepository, times(1))
                .save(any(LowStockAlert.class));

        verify(notificationService, times(1))
                .createLowStockNotification(
                        medicine,
                        20,
                        20
                );
    }

    @Test
    void shouldSetCorrectAlertValues() {

        lowStockAlertService.checkLowStock(medicine);

        var alertCaptor =
                org.mockito.ArgumentCaptor.forClass(LowStockAlert.class);

        verify(lowStockAlertRepository)
                .save(alertCaptor.capture());

        LowStockAlert alert = alertCaptor.getValue();

        assertEquals(medicine, alert.getMedicine());
        assertEquals(10, alert.getCurrentQuantity());
        assertEquals(20, alert.getThreshold());
        assertEquals("ACTIVE", alert.getStatus());
    }
    @Test
    void shouldNotCreateDuplicateActiveAlertForSameMedicine() {

        LowStockAlert existingAlert = new LowStockAlert();
        existingAlert.setMedicine(medicine);
        existingAlert.setCurrentQuantity(15);
        existingAlert.setThreshold(20);
        existingAlert.setStatus("ACTIVE");

        when(lowStockAlertRepository.findByMedicine(medicine))
                .thenReturn(java.util.List.of(existingAlert));

        lowStockAlertService.checkLowStock(medicine);

        verify(lowStockAlertRepository, never())
                .save(any(LowStockAlert.class));

        verify(notificationService, never())
                .createLowStockNotification(
                        any(Medicine.class),
                        anyInt(),
                        anyInt()
                );
    }
}