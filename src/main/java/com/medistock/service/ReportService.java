
        package com.medistock.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.IOException;

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


    public byte[] generateMedicineReport(
            String reportType,
            String fromDate,
            String toDate,
            String category
    ) {
        // Get all medicines from database
        List<Medicine> medicines;
        LocalDate from = fromDate != null && !fromDate.isEmpty()
                ? LocalDate.parse(fromDate)
                : null;

        LocalDate to = toDate != null && !toDate.isEmpty()
                ? LocalDate.parse(toDate)
                : null;

        if (reportType.equals("Low Stock Report")) {

            List<Inventory> lowStockInventory =
                    inventoryRepository.findLowStockMedicines();

            medicines = lowStockInventory.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        } else if (reportType.equals("Stock Report")) {

            List<Inventory> inventoryList =
                    inventoryRepository.findAll();

            medicines = inventoryList.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        } else if (reportType.equals("Expiry Report")) {

            medicines = medicineRepository.findAll()
                    .stream()
                    .filter(medicine -> medicine.getExpiryDate() != null)
                    .filter(medicine -> from == null ||
                            !medicine.getExpiryDate().isBefore(from))
                    .filter(medicine -> to == null ||
                            !medicine.getExpiryDate().isAfter(to))
                    .toList();

        } else if (reportType.equals("Category Report")) {

            medicines = medicineRepository.findAll()
                    .stream()
                    .filter(medicine ->
                            category == null ||
                                    category.isEmpty() ||
                                    category.equals("All Categories") ||
                                    medicine.getCategory().equalsIgnoreCase(category)
                    )
                    .toList();

        } else {

            medicines = medicineRepository.findAll();
        }

        // Create PDF in memory
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument, PageSize.A4.rotate());

        // Report title
        Paragraph title = new Paragraph("MediStock - " + reportType)
                .setBold()
                .setFontSize(18);

        document.add(title);

        // Report generation date
        Paragraph date = new Paragraph(
                "Generated on: " + LocalDate.now()
        );

        document.add(date);

        // Add some space
        document.add(new Paragraph(" "));

        // Create table with 10 columns
        float[] columnWidths = {
                35, 90, 65, 70, 90,
                45, 60, 90, 75, 60
        };

        Table table = new Table(columnWidths);

        // Table headers
        table.addHeaderCell(new Cell().add(new Paragraph("ID")));
        table.addHeaderCell(new Cell().add(new Paragraph("Medicine")));
        table.addHeaderCell(new Cell().add(new Paragraph("Batch")));
        table.addHeaderCell(new Cell().add(new Paragraph("Category")));
        table.addHeaderCell(new Cell().add(new Paragraph("Supplier")));
        table.addHeaderCell(new Cell().add(new Paragraph("Qty")));
        table.addHeaderCell(new Cell().add(new Paragraph("Low Stock")));
        table.addHeaderCell(new Cell().add(new Paragraph("Manufacturing")));
        table.addHeaderCell(new Cell().add(new Paragraph("Expiry")));
        table.addHeaderCell(new Cell().add(new Paragraph("Price")));

        // Add medicine data
        for (Medicine medicine : medicines) {

            Integer quantity = medicine.getQuantity();

            table.addCell(String.valueOf(medicine.getId()));

            table.addCell(
                    medicine.getMedicineName() != null
                            ? medicine.getMedicineName()
                            : ""
            );

            table.addCell(
                    medicine.getBatchNumber() != null
                            ? medicine.getBatchNumber()
                            : ""
            );

            table.addCell(
                    medicine.getCategory() != null
                            ? medicine.getCategory()
                            : ""
            );

            // Supplier name
            String supplierName = "";

            if (medicine.getSupplier() != null) {
                supplierName = medicine.getSupplier().getName();
            }

            table.addCell(supplierName);

            table.addCell(
                    quantity != null
                            ? String.valueOf(quantity)
                            : "0"
            );

            // Low stock threshold
            table.addCell("20");

            table.addCell(
                    medicine.getManufacturingDate() != null
                            ? medicine.getManufacturingDate().toString()
                            : ""
            );

            table.addCell(
                    medicine.getExpiryDate() != null
                            ? medicine.getExpiryDate().toString()
                            : ""
            );

            table.addCell(
                    medicine.getPrice() != null
                            ? medicine.getPrice().toString()
                            : ""
            );
        }

        document.add(table);

        // Close PDF
        document.close();

        // Return PDF as byte array
        return outputStream.toByteArray();
    }
    public byte[] generateMedicineExcelReport(
            String reportType,
            String fromDate,
            String toDate,
            String category
    ) throws IOException {

        List<Medicine> medicines;

        LocalDate from = fromDate != null && !fromDate.isEmpty()
                ? LocalDate.parse(fromDate)
                : null;

        LocalDate to = toDate != null && !toDate.isEmpty()
                ? LocalDate.parse(toDate)
                : null;

        if (reportType.equals("Low Stock Report")) {

            List<Inventory> lowStockInventory =
                    inventoryRepository.findLowStockMedicines();

            medicines = lowStockInventory.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        } else if (reportType.equals("Stock Report")) {

            List<Inventory> inventoryList =
                    inventoryRepository.findAll();

            medicines = inventoryList.stream()
                    .map(Inventory::getMedicine)
                    .toList();

        } else if (reportType.equals("Expiry Report")) {

            medicines = medicineRepository.findAll()
                    .stream()
                    .filter(medicine -> medicine.getExpiryDate() != null)
                    .filter(medicine -> from == null ||
                            !medicine.getExpiryDate().isBefore(from))
                    .filter(medicine -> to == null ||
                            !medicine.getExpiryDate().isAfter(to))
                    .toList();

        } else if (reportType.equals("Category Report")) {

            medicines = medicineRepository.findAll()
                    .stream()
                    .filter(medicine ->
                            category == null ||
                                    category.isEmpty() ||
                                    category.equals("All Categories") ||
                                    (medicine.getCategory() != null &&
                                            medicine.getCategory().equalsIgnoreCase(category))
                    )
                    .toList();

        } else {

            medicines = medicineRepository.findAll();
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("MediStock Report");

        Row headerRow = sheet.createRow(0);

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

        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }

        int rowNumber = 1;

        for (Medicine medicine : medicines) {

            Row row = sheet.createRow(rowNumber++);

            row.createCell(0).setCellValue(
                    medicine.getId() != null ? medicine.getId() : 0
            );

            row.createCell(1).setCellValue(
                    medicine.getMedicineName() != null
                            ? medicine.getMedicineName()
                            : ""
            );

            row.createCell(2).setCellValue(
                    medicine.getBatchNumber() != null
                            ? medicine.getBatchNumber()
                            : ""
            );

            row.createCell(3).setCellValue(
                    medicine.getCategory() != null
                            ? medicine.getCategory()
                            : ""
            );

            String supplierName = "";

            if (medicine.getSupplier() != null) {
                supplierName = medicine.getSupplier().getName();
            }

            row.createCell(4).setCellValue(supplierName);

            row.createCell(5).setCellValue(
                    medicine.getQuantity() != null
                            ? medicine.getQuantity()
                            : 0
            );

            row.createCell(6).setCellValue(20);

            row.createCell(7).setCellValue(
                    medicine.getManufacturingDate() != null
                            ? medicine.getManufacturingDate().toString()
                            : ""
            );

            row.createCell(8).setCellValue(
                    medicine.getExpiryDate() != null
                            ? medicine.getExpiryDate().toString()
                            : ""
            );

            row.createCell(9).setCellValue(
                    medicine.getPrice() != null
                            ? medicine.getPrice().doubleValue()
                            : 0
            );
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }
}

