package com.lostfound.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ItemRequest {

    @NotBlank private String itemName;
    private String description;
    private String categoryId;
    private String location;
    private LocalDate date;   // lost or found date
    private String contactInfo;
}