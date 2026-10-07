package com.lostfound.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "found_items")
public class FoundItem {

    @Id
    private String id;

    private String title;

    private String description;

    private String categoryId;

    private String locationFound;

    private LocalDateTime dateFound;

    private List<String> imageUrls;

    private String userId;

    private ItemStatus status = ItemStatus.OPEN;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
