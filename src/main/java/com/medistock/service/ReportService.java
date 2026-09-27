
        package com.medistock.service;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;

    public ReportService(
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // ============================================================
    // GET MEDICINES FOR REPORT
    // ============================================================

    private List<Medicine> getMedicinesForReport(
            String reportType,
            String fromDate,
            String toDate,
            String category
    ) {

        LocalDate from = fromDate != null && !fromDate.isEmpty()
                ? LocalDate.parse(fromDate)
                : null;

        LocalDate to = toDate != null && !toDate.isEmpty()
                ? LocalDate.parse(toDate)
                : null;

        List<Medicine> medicines;

        // --------------------------------------------------------
        // LOW STOCK REPORT
        // --------------------------------------------------------

        if ("Low Stock Report".equals(reportType)) {

            List<Inventory> lowStockInventory =
                    inventoryRepository.findLowStockMedicines();

            medicines = lowStockInventory.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        }

        // --------------------------------------------------------
        // STOCK REPORT
        // --------------------------------------------------------

        else if ("Stock Report".equals(reportType)) {

            List<Inventory> inventoryList =
                    inventoryRepository.findAll();

            medicines = inventoryList.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        }

        // --------------------------------------------------------
        // EXPIRY REPORT
        // --------------------------------------------------------

        else if ("Expiry Report".equals(reportType)) {

            medicines = medicineRepository.findAll()
                    .stream()

                    // Only medicines having an expiry date
                    .filter(medicine ->
                            medicine.getExpiryDate() != null
                    )

                    // From date filter
                    .filter(medicine ->
                            from == null ||
                                    !medicine.getExpiryDate().isBefore(from)
                    )

                    // To date filter
                    .filter(medicine ->
                            to == null ||
                                    !medicine.getExpiryDate().isAfter(to)
                    )

                    .toList();

        }

        // --------------------------------------------------------
        // CATEGORY REPORT
        // --------------------------------------------------------

        else {

            medicines = medicineRepository.findAll();
        }

        // ========================================================
        // APPLY CATEGORY FILTER TO ALL REPORT TYPES
        // ========================================================

        if (category != null
                && !category.isEmpty()
                && !category.equalsIgnoreCase("All Categories")) {

            medicines = medicines.stream()
                    .filter(medicine ->
                            medicine.getCategory() != null
                                    && medicine.getCategory()
                                    .equalsIgnoreCase(category)
                    )
                    .toList();
        }

        return medicines;
    }


    // ============================================================
    // GENERATE PDF REPORT
    // ============================================================

    public byte[] generateMedicineReport(
            String reportType,
            String fromDate,
            String toDate,
            String category
    ) {

        // Get filtered medicines
        List<Medicine> medicines = getMedicinesForReport(
                reportType,
                fromDate,
                toDate,
                category
        );

        // Create PDF in memory
        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        PdfWriter writer =
                new PdfWriter(outputStream);

        PdfDocument pdfDocument =
                new PdfDocument(writer);

        Document document =
                new Document(
                        pdfDocument,
                        PageSize.A4.rotate()
                );

        // --------------------------------------------------------
        // REPORT TITLE
        // --------------------------------------------------------

        Paragraph title =
                new Paragraph(
                        "MediStock - " + reportType
                )
                        .setBold()
                        .setFontSize(18);

        document.add(title);

        // --------------------------------------------------------
        // REPORT DATE
        // --------------------------------------------------------

        Paragraph date =
                new Paragraph(
                        "Generated on: " + LocalDate.now()
                );

        document.add(date);

        // --------------------------------------------------------
        // SELECTED CATEGORY
        // --------------------------------------------------------

        if (category != null
                && !category.isEmpty()
                && !category.equalsIgnoreCase("All Categories")) {

            document.add(
                    new Paragraph(
                            "Category: " + category
                    )
            );
        }

        // Add space
        document.add(new Paragraph(" "));

        // --------------------------------------------------------
        // CREATE TABLE
        // --------------------------------------------------------

        float[] columnWidths = {
                35, 90, 65, 70, 90,
                45, 60, 90, 75, 60
        };

        Table table =
                new Table(columnWidths);

        // --------------------------------------------------------
        // TABLE HEADERS
        // --------------------------------------------------------

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("ID")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Medicine")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Batch")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Category")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Supplier")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Qty")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Low Stock")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Manufacturing")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Expiry")
                )
        );

        table.addHeaderCell(
                new Cell().add(
                        new Paragraph("Price")
                )
        );

        // --------------------------------------------------------
        // ADD MEDICINE DATA
        // --------------------------------------------------------

        for (Medicine medicine : medicines) {

            Integer quantity =
                    medicine.getQuantity();

            // ID
            table.addCell(
                    String.valueOf(
                            medicine.getId()
                    )
            );

            // Medicine name
            table.addCell(
                    medicine.getMedicineName() != null
                            ? medicine.getMedicineName()
                            : ""
            );

            // Batch
            table.addCell(
                    medicine.getBatchNumber() != null
                            ? medicine.getBatchNumber()
                            : ""
            );

            // Category
            table.addCell(
                    medicine.getCategory() != null
                            ? medicine.getCategory()
                            : ""
            );

            // Supplier
            String supplierName = "";

            if (medicine.getSupplier() != null) {
                supplierName =
                        medicine.getSupplier().getName();
            }

            table.addCell(supplierName);

            // Quantity
            table.addCell(
                    quantity != null
                            ? String.valueOf(quantity)
                            : "0"
            );

            // Low stock threshold
            table.addCell("20");

            // Manufacturing date
            table.addCell(
                    medicine.getManufacturingDate() != null
                            ? medicine.getManufacturingDate().toString()
                            : ""
            );

            // Expiry date
            table.addCell(
                    medicine.getExpiryDate() != null
                            ? medicine.getExpiryDate().toString()
                            : ""
            );

            // Price
            table.addCell(
                    medicine.getPrice() != null
                            ? medicine.getPrice().toString()
                            : ""
            );
        }

        // Add table to PDF
        document.add(table);

        // Close PDF
        document.close();

        return outputStream.toByteArray();
    }


    // ============================================================
    // GENERATE EXCEL REPORT
    // ============================================================

    public byte[] generateMedicineExcelReport(
            String reportType,
            String fromDate,
            String toDate,
            String category
    ) throws IOException {

        // Use EXACTLY the same filtering logic as PDF
        List<Medicine> medicines = getMedicinesForReport(
                reportType,
                fromDate,
                toDate,
                category
        );

        // --------------------------------------------------------
        // CREATE EXCEL WORKBOOK
        // --------------------------------------------------------

        Workbook workbook =
                new XSSFWorkbook();

        Sheet sheet =
                workbook.createSheet(
                        "MediStock Report"
                );

        // --------------------------------------------------------
        // HEADER ROW
        // --------------------------------------------------------

        Row headerRow =
                sheet.createRow(0);

        String[] headers = {
                "ID",
                "Medicine",
                "Batch",
                "Category",
                "Supplier",
                "Qty",
                "Low Stock",
                "Manufacturing",
                "Expiry",
                "Price"
        };

        for (int i = 0;
             i < headers.length;
             i++) {

            headerRow
                    .createCell(i)
                    .setCellValue(headers[i]);
        }

        // --------------------------------------------------------
        // MEDICINE DATA
        // --------------------------------------------------------

        int rowNumber = 1;

        for (Medicine medicine : medicines) {

            Row row =
                    sheet.createRow(rowNumber++);

            // ID
            row.createCell(0)
                    .setCellValue(
                            medicine.getId() != null
                                    ? medicine.getId()
                                    : 0
                    );

            // Medicine
            row.createCell(1)
                    .setCellValue(
                            medicine.getMedicineName() != null
                                    ? medicine.getMedicineName()
                                    : ""
                    );

            // Batch
            row.createCell(2)
                    .setCellValue(
                            medicine.getBatchNumber() != null
                                    ? medicine.getBatchNumber()
                                    : ""
                    );

            // Category
            row.createCell(3)
                    .setCellValue(
                            medicine.getCategory() != null
                                    ? medicine.getCategory()
                                    : ""
                    );

            // Supplier
            String supplierName = "";

            if (medicine.getSupplier() != null) {
                supplierName =
                        medicine.getSupplier().getName();
            }

            row.createCell(4)
                    .setCellValue(supplierName);

            // Quantity
            row.createCell(5)
                    .setCellValue(
                            medicine.getQuantity() != null
                                    ? medicine.getQuantity()
                                    : 0
                    );

            // Low stock threshold
            row.createCell(6)
                    .setCellValue(20);

            // Manufacturing
            row.createCell(7)
                    .setCellValue(
                            medicine.getManufacturingDate() != null
                                    ? medicine.getManufacturingDate().toString()
                                    : ""
                    );

            // Expiry
            row.createCell(8)
                    .setCellValue(
                            medicine.getExpiryDate() != null
                                    ? medicine.getExpiryDate().toString()
                                    : ""
                    );

            // Price
            row.createCell(9)
                    .setCellValue(
                            medicine.getPrice() != null
                                    ? medicine.getPrice().doubleValue()
                                    : 0
                    );
        }

        // --------------------------------------------------------
        // AUTO SIZE COLUMNS
        // --------------------------------------------------------

        for (int i = 0;
             i < headers.length;
             i++) {

            sheet.autoSizeColumn(i);
        }

        // --------------------------------------------------------
        // WRITE EXCEL TO MEMORY
        // --------------------------------------------------------

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        workbook.write(outputStream);

        workbook.close();

        return outputStream.toByteArray();
    }
}
