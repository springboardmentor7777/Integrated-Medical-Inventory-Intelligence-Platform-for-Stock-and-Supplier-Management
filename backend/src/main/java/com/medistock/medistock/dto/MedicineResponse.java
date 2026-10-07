package com.medistock.medistock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {

    private Long id;
    private String name;
    private String category;
    private String manufacturer;
    private String description;
    private BigDecimal price;
    private Integer reorderLevel;
    private String batchNumber;
    private LocalDate expiryDate;
}