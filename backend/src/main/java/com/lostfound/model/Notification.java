package com.lostfound.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;
    private String title;
    private String message;
    private String type;      // MATCH, CLAIM, SYSTEM
    private String refId;     // matchId or claimId
    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}