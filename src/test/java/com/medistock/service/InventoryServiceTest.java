package com.medistock.service;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private StockLogService stockLogService;

    @Mock
    private LowStockAlertService lowStockAlertService;

    @InjectMocks
    private InventoryService inventoryService;


    // ---------------------------------------------------------
    // ADD STOCK TESTS
    // ---------------------------------------------------------

    @Test
    void addStock_shouldAddNewInventory() {

        Integer medicineId = 1;
        Integer quantity = 10;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(0);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.empty());

        Inventory savedInventory = new Inventory();
        savedInventory.setMedicine(medicine);
        savedInventory.setQuantity(quantity);

        when(inventoryRepository.save(any(Inventory.class)))
                .thenReturn(savedInventory);

        Inventory result = inventoryService.addStock(medicineId, quantity);

        assertNotNull(result);
        assertEquals(10, result.getQuantity());
        assertEquals(10, medicine.getQuantity());

        verify(medicineRepository).save(medicine);
        verify(stockLogService).createLog(medicineId, "ADD", quantity);
        verify(lowStockAlertService).checkLowStock(medicine);
        verify(inventoryRepository).save(any(Inventory.class));
    }


    @Test
    void addStock_shouldIncreaseExistingInventory() {

        Integer medicineId = 1;
        Integer quantity = 10;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(20);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(20);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        Inventory result = inventoryService.addStock(medicineId, quantity);

        assertEquals(30, result.getQuantity());
        assertEquals(30, medicine.getQuantity());

        verify(medicineRepository).save(medicine);
        verify(stockLogService).createLog(medicineId, "ADD", quantity);
        verify(lowStockAlertService).checkLowStock(medicine);
        verify(inventoryRepository).save(inventory);
    }


    @Test
    void addStock_shouldRejectZeroQuantity() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.addStock(1, 0)
        );

        assertEquals(
                "Stock quantity must be greater than 0",
                exception.getMessage()
        );

        verifyNoInteractions(
                medicineRepository,
                inventoryRepository,
                stockLogService,
                lowStockAlertService
        );
    }


    @Test
    void addStock_shouldRejectNegativeQuantity() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.addStock(1, -5)
        );

        assertEquals(
                "Stock quantity must be greater than 0",
                exception.getMessage()
        );

        verifyNoInteractions(
                medicineRepository,
                inventoryRepository,
                stockLogService,
                lowStockAlertService
        );
    }


    @Test
    void addStock_shouldRejectNullQuantity() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.addStock(1, null)
        );

        assertEquals(
                "Stock quantity must be greater than 0",
                exception.getMessage()
        );
    }


    @Test
    void addStock_shouldThrowExceptionWhenMedicineNotFound() {

        Integer medicineId = 99;

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.addStock(medicineId, 10)
        );

        assertEquals(
                "Medicine not found with id: 99",
                exception.getMessage()
        );

        verify(medicineRepository).findById(medicineId);
        verifyNoInteractions(
                inventoryRepository,
                stockLogService,
                lowStockAlertService
        );
    }


    // ---------------------------------------------------------
    // UPDATE STOCK TESTS
    // ---------------------------------------------------------

    @Test
    void updateStock_shouldUpdateQuantity() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(20);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(20);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        Inventory result = inventoryService.updateStock(medicineId, 50);

        assertEquals(50, result.getQuantity());
        assertEquals(50, medicine.getQuantity());

        verify(medicineRepository).save(medicine);
        verify(stockLogService)
                .createLog(medicineId, "ADD", 30);

        verify(lowStockAlertService).checkLowStock(medicine);
        verify(inventoryRepository).save(inventory);
    }


    @Test
    void updateStock_shouldCreateReduceLogWhenQuantityDecreases() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(50);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(50);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        Inventory result = inventoryService.updateStock(medicineId, 30);

        assertEquals(30, result.getQuantity());
        assertEquals(30, medicine.getQuantity());

        verify(stockLogService)
                .createLog(medicineId, "REDUCE", -20);

        verify(lowStockAlertService).checkLowStock(medicine);
        verify(inventoryRepository).save(inventory);
    }


    @Test
    void updateStock_shouldAllowZeroQuantity() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(10);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(10);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        Inventory result = inventoryService.updateStock(medicineId, 0);

        assertEquals(0, result.getQuantity());
        assertEquals(0, medicine.getQuantity());

        verify(stockLogService)
                .createLog(medicineId, "REDUCE", -10);

        verify(lowStockAlertService).checkLowStock(medicine);
    }


    @Test
    void updateStock_shouldRejectNegativeQuantity() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.updateStock(1, -1)
        );

        assertEquals(
                "Stock quantity cannot be negative",
                exception.getMessage()
        );
    }


    @Test
    void updateStock_shouldRejectNullQuantity() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.updateStock(1, null)
        );

        assertEquals(
                "Stock quantity cannot be negative",
                exception.getMessage()
        );
    }


    @Test
    void updateStock_shouldThrowExceptionWhenMedicineNotFound() {

        Integer medicineId = 99;

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.updateStock(medicineId, 20)
        );

        assertEquals(
                "Medicine not found with id: 99",
                exception.getMessage()
        );
    }


    @Test
    void updateStock_shouldThrowExceptionWhenInventoryNotFound() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.updateStock(medicineId, 20)
        );

        assertEquals(
                "Inventory not found for medicine id: 1",
                exception.getMessage()
        );
    }


    @Test
    void updateStock_shouldNotCreateLogWhenQuantityIsSame() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);
        medicine.setQuantity(20);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(20);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        inventoryService.updateStock(medicineId, 20);

        verify(stockLogService, never())
                .createLog(anyInt(), anyString(), anyInt());

        verify(lowStockAlertService)
                .checkLowStock(medicine);
    }


    // ---------------------------------------------------------
    // GET ALL INVENTORY TESTS
    // ---------------------------------------------------------

    @Test
    void getAllInventory_shouldReturnInventoryList() {

        Inventory inventory1 = new Inventory();
        Inventory inventory2 = new Inventory();

        when(inventoryRepository.findAll())
                .thenReturn(Arrays.asList(inventory1, inventory2));

        var result = inventoryService.getAllInventory();

        assertNotNull(result);
        assertEquals(2, result.size());

        verify(inventoryRepository).findAll();
    }


    @Test
    void getAllInventory_shouldReturnEmptyListWhenInventoryIsEmpty() {

        when(inventoryRepository.findAll())
                .thenReturn(Collections.emptyList());

        var result = inventoryService.getAllInventory();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(inventoryRepository).findAll();
    }


    // ---------------------------------------------------------
    // GET INVENTORY BY MEDICINE ID TESTS
    // ---------------------------------------------------------

    @Test
    void getInventoryByMedicineId_shouldReturnInventory() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        Inventory inventory = new Inventory();
        inventory.setMedicine(medicine);
        inventory.setQuantity(25);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.of(inventory));

        Inventory result =
                inventoryService.getInventoryByMedicineId(medicineId);

        assertNotNull(result);
        assertEquals(25, result.getQuantity());
        assertEquals(medicine, result.getMedicine());

        verify(medicineRepository).findById(medicineId);
        verify(inventoryRepository).findByMedicine(medicine);
    }


    @Test
    void getInventoryByMedicineId_shouldThrowExceptionWhenMedicineNotFound() {

        Integer medicineId = 99;

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.getInventoryByMedicineId(medicineId)
        );

        assertEquals(
                "Medicine not found for medicine id: 99",
                exception.getMessage()
        );
    }


    @Test
    void getInventoryByMedicineId_shouldThrowExceptionWhenInventoryNotFound() {

        Integer medicineId = 1;

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        when(medicineRepository.findById(medicineId))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository.findByMedicine(medicine))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> inventoryService.getInventoryByMedicineId(medicineId)
        );

        assertEquals(
                "Inventory not found for medicine id: 1",
                exception.getMessage()
        );
    }
}