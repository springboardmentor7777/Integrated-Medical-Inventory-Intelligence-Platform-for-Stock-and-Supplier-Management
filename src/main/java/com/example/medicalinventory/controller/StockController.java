package com.example.medicalinventory.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.medicalinventory.model.Medicine;
import com.example.medicalinventory.model.Stock;
import com.example.medicalinventory.model.StockRequest;
import com.example.medicalinventory.service.StockService;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }


    @PostMapping("/in")
    public Medicine stockIn(
            @RequestBody StockRequest request) {

        return stockService.stockIn(request);
    }


    @PostMapping("/out")
    public Medicine stockOut(
            @RequestBody StockRequest request) {

        return stockService.stockOut(request);
    }


    @GetMapping("/history")
    public List<Stock> getStockHistory() {

        return stockService.getStockHistory();
    }


    @GetMapping("/{medicineId}")
    public Integer getCurrentStock(
            @PathVariable Long medicineId) {

        return stockService.getCurrentStock(
                medicineId
        );
    }
}