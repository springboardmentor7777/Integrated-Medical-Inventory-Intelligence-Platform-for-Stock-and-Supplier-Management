package com.example.medicalinventory.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.medicalinventory.model.Medicine;
import com.example.medicalinventory.model.Stock;
import com.example.medicalinventory.model.StockRequest;
import com.example.medicalinventory.repository.MedicineRepository;
import com.example.medicalinventory.repository.StockRepository;

@Service
public class StockService {

    private final MedicineRepository medicineRepository;
    private final StockRepository stockRepository;

    public StockService(
            MedicineRepository medicineRepository,
            StockRepository stockRepository) {

        this.medicineRepository = medicineRepository;
        this.stockRepository = stockRepository;
    }

    // =====================================================
    // STOCK IN
    // =====================================================
    public Medicine stockIn(StockRequest request) {

        if (request.getMedicineId() == null) {
            throw new RuntimeException(
                    "Medicine ID is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Stock quantity must be greater than 0"
            );
        }

        Medicine medicine =
                medicineRepository.findById(
                        request.getMedicineId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found"
                        )
                );

        medicine.setQuantity(
                medicine.getQuantity()
                        + request.getQuantity()
        );

        Medicine updatedMedicine =
                medicineRepository.save(medicine);

        Stock stock = new Stock();

        stock.setMedicineId(
                medicine.getId()
        );

        stock.setType("IN");

        stock.setQuantity(
                request.getQuantity()
        );

        stock.setDate(
                LocalDateTime.now()
        );

        stockRepository.save(stock);

        return updatedMedicine;
    }

    // =====================================================
    // STOCK OUT
    // =====================================================
    public Medicine stockOut(StockRequest request) {

        if (request.getMedicineId() == null) {
            throw new RuntimeException(
                    "Medicine ID is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Stock quantity must be greater than 0"
            );
        }

        Medicine medicine =
                medicineRepository.findById(
                        request.getMedicineId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found"
                        )
                );

        if (medicine.getQuantity()
                < request.getQuantity()) {

            throw new RuntimeException(
                    "Insufficient stock"
            );
        }

        medicine.setQuantity(
                medicine.getQuantity()
                        - request.getQuantity()
        );

        Medicine updatedMedicine =
                medicineRepository.save(medicine);

        Stock stock = new Stock();

        stock.setMedicineId(
                medicine.getId()
        );

        stock.setType("OUT");

        stock.setQuantity(
                request.getQuantity()
        );

        stock.setDate(
                LocalDateTime.now()
        );

        stockRepository.save(stock);

        return updatedMedicine;
    }

    // =====================================================
    // STOCK HISTORY
    // =====================================================
    public List<Stock> getStockHistory() {

        return stockRepository.findAll();
    }
    public Integer getCurrentStock(Long medicineId) {

        Medicine medicine =
                medicineRepository.findById(medicineId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Medicine not found"
                                )
                        );

        return medicine.getQuantity();
    }
}