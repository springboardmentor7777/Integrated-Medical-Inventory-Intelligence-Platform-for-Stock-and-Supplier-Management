package com.medistock.controller;

import com.medistock.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/medicines")
    public ResponseEntity<byte[]> downloadMedicineReport(
            @RequestParam(defaultValue = "Inventory Report") String reportType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String category
    ) {

        byte[] pdf = reportService.generateMedicineReport(
                reportType,
                fromDate,
                toDate,
                category
        );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=MediStock_" +
                                reportType.replace(" ", "_") +
                                ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/medicines/excel")
    public ResponseEntity<byte[]> downloadMedicineExcel(
            @RequestParam(defaultValue = "Inventory Report") String reportType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String category
    ) throws Exception {

        byte[] excel = reportService.generateMedicineExcelReport(
                reportType,
                fromDate,
                toDate,
                category
        );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=MediStock_" +
                                reportType.replace(" ", "_") +
                                ".xlsx"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(excel);
    }
}