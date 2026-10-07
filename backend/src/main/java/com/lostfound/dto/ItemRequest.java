package com.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String categoryId;

    @NotBlank(message = "Location is required")
    private String location;

    /** ISO date-time string, e.g. "2026-10-01T14:30:00" */
    private String date;
}
