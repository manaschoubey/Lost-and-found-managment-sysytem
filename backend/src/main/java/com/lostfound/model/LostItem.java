package com.lostfound.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "lost_items")
public class LostItem {

    @Id
    private String id;

    private String userId;
    private String itemName;
    private String description;
    private String categoryId;
    private String location;
    private LocalDate lostDate;
    private String contactInfo;

    private List<String> imageUrls = new ArrayList<>();

    private ItemStatus status = ItemStatus.LOST;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}