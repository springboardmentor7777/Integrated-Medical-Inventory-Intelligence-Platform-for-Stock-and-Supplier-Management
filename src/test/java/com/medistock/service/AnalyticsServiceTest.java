package com.medistock.service;

import com.medistock.dto.CategoryInventoryDTO;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private AnalyticsService analyticsService;


    // ---------------------------------------------------------
    // TOTAL MEDICINES
    // ---------------------------------------------------------

    @Test
    void getTotalMedicines_shouldReturnMedicineCount() {

        when(medicineRepository.count()).thenReturn(50L);

        long result = analyticsService.getTotalMedicines();

        assertEquals(50L, result);

        verify(medicineRepository).count();
    }


    @Test
    void getTotalMedicines_shouldReturnZeroWhenNoMedicinesExist() {

        when(medicineRepository.count()).thenReturn(0L);

        long result = analyticsService.getTotalMedicines();

        assertEquals(0L, result);

        verify(medicineRepository).count();
    }


    // ---------------------------------------------------------
    // TOTAL STOCK
    // ---------------------------------------------------------

    @Test
    void getTotalStock_shouldReturnTotalStock() {

        when(inventoryRepository.getTotalStock()).thenReturn(500L);

        long result = analyticsService.getTotalStock();

        assertEquals(500L, result);

        verify(inventoryRepository).getTotalStock();
    }


    @Test
    void getTotalStock_shouldReturnZeroWhenInventoryIsEmpty() {

        when(inventoryRepository.getTotalStock()).thenReturn(0L);

        long result = analyticsService.getTotalStock();

        assertEquals(0L, result);

        verify(inventoryRepository).getTotalStock();
    }


    // ---------------------------------------------------------
    // LOW STOCK
    // ---------------------------------------------------------

    @Test
    void getLowStockCount_shouldReturnLowStockCount() {

        when(inventoryRepository.countLowStockMedicines())
                .thenReturn(5L);

        long result = analyticsService.getLowStockCount();

        assertEquals(5L, result);

        verify(inventoryRepository).countLowStockMedicines();
    }


    @Test
    void getLowStockCount_shouldReturnZeroWhenNoLowStockMedicines() {

        when(inventoryRepository.countLowStockMedicines())
                .thenReturn(0L);

        long result = analyticsService.getLowStockCount();

        assertEquals(0L, result);

        verify(inventoryRepository).countLowStockMedicines();
    }


    // ---------------------------------------------------------
    // EXPIRED MEDICINES
    // ---------------------------------------------------------

    @Test
    void getExpiredCount_shouldReturnNumberOfExpiredMedicines() {

        when(medicineRepository.findExpiredMedicines(any(LocalDate.class)))
                .thenReturn(Arrays.asList(
                        new com.medistock.entity.Medicine(),
                        new com.medistock.entity.Medicine(),
                        new com.medistock.entity.Medicine()
                ));

        long result = analyticsService.getExpiredCount();

        assertEquals(3L, result);

        verify(medicineRepository)
                .findExpiredMedicines(any(LocalDate.class));
    }


    @Test
    void getExpiredCount_shouldReturnZeroWhenNoMedicinesAreExpired() {

        when(medicineRepository.findExpiredMedicines(any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        long result = analyticsService.getExpiredCount();

        assertEquals(0L, result);

        verify(medicineRepository)
                .findExpiredMedicines(any(LocalDate.class));
    }


    // ---------------------------------------------------------
    // EXPIRING SOON
    // ---------------------------------------------------------

    @Test
    void getExpiringSoonCount_shouldReturnNumberOfMedicinesExpiringSoon() {

        when(medicineRepository.findMedicinesExpiringBetween(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(Arrays.asList(
                new com.medistock.entity.Medicine(),
                new com.medistock.entity.Medicine()
        ));

        long result = analyticsService.getExpiringSoonCount();

        assertEquals(2L, result);

        verify(medicineRepository)
                .findMedicinesExpiringBetween(
                        any(LocalDate.class),
                        any(LocalDate.class)
                );
    }


    @Test
    void getExpiringSoonCount_shouldReturnZeroWhenNoMedicinesExpireSoon() {

        when(medicineRepository.findMedicinesExpiringBetween(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(Collections.emptyList());

        long result = analyticsService.getExpiringSoonCount();

        assertEquals(0L, result);

        verify(medicineRepository)
                .findMedicinesExpiringBetween(
                        any(LocalDate.class),
                        any(LocalDate.class)
                );
    }


    // ---------------------------------------------------------
    // CATEGORY-WISE INVENTORY
    // ---------------------------------------------------------

    @Test
    void getCategoryWiseInventory_shouldReturnCategoryData() {

        CategoryInventoryDTO category1 =
                new CategoryInventoryDTO("Tablet", 10L, 100L);

        CategoryInventoryDTO category2 =
                new CategoryInventoryDTO("Syrup", 5L, 50L);

        List<CategoryInventoryDTO> categories =
                Arrays.asList(category1, category2);

        when(medicineRepository.getCategoryWiseInventory())
                .thenReturn(categories);

        List<CategoryInventoryDTO> result =
                analyticsService.getCategoryWiseInventory();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(categories, result);

        verify(medicineRepository).getCategoryWiseInventory();
    }


    @Test
    void getCategoryWiseInventory_shouldReturnEmptyListWhenNoCategoriesExist() {

        when(medicineRepository.getCategoryWiseInventory())
                .thenReturn(Collections.emptyList());

        List<CategoryInventoryDTO> result =
                analyticsService.getCategoryWiseInventory();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(medicineRepository).getCategoryWiseInventory();
    }


    // ---------------------------------------------------------
    // COMPLETE ANALYTICS SUMMARY
    // ---------------------------------------------------------

    @Test
    void getAnalyticsSummary_shouldReturnCompleteSummary() {

        when(medicineRepository.count()).thenReturn(50L);

        when(inventoryRepository.getTotalStock())
                .thenReturn(500L);

        when(inventoryRepository.countLowStockMedicines())
                .thenReturn(5L);

        when(medicineRepository.findExpiredMedicines(any(LocalDate.class)))
                .thenReturn(Arrays.asList(
                        new com.medistock.entity.Medicine(),
                        new com.medistock.entity.Medicine()
                ));

        when(medicineRepository.findMedicinesExpiringBetween(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(Collections.singletonList(
                new com.medistock.entity.Medicine()
        ));

        Map<String, Long> result =
                analyticsService.getAnalyticsSummary();

        assertNotNull(result);

        assertEquals(50L, result.get("totalMedicines"));
        assertEquals(500L, result.get("totalStock"));
        assertEquals(5L, result.get("lowStock"));
        assertEquals(2L, result.get("expired"));
        assertEquals(1L, result.get("expiringSoon"));

        verify(medicineRepository).count();
        verify(inventoryRepository).getTotalStock();
        verify(inventoryRepository).countLowStockMedicines();
        verify(medicineRepository)
                .findExpiredMedicines(any(LocalDate.class));
        verify(medicineRepository)
                .findMedicinesExpiringBetween(
                        any(LocalDate.class),
                        any(LocalDate.class)
                );
    }


    @Test
    void getAnalyticsSummary_shouldHandleEmptyInventory() {

        when(medicineRepository.count()).thenReturn(0L);

        when(inventoryRepository.getTotalStock())
                .thenReturn(0L);

        when(inventoryRepository.countLowStockMedicines())
                .thenReturn(0L);

        when(medicineRepository.findExpiredMedicines(any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        when(medicineRepository.findMedicinesExpiringBetween(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(Collections.emptyList());

        Map<String, Long> result =
                analyticsService.getAnalyticsSummary();

        assertNotNull(result);

        assertEquals(0L, result.get("totalMedicines"));
        assertEquals(0L, result.get("totalStock"));
        assertEquals(0L, result.get("lowStock"));
        assertEquals(0L, result.get("expired"));
        assertEquals(0L, result.get("expiringSoon"));
    }
}