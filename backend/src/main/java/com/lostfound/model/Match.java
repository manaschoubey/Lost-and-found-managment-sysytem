package com.lostfound.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "matches")
public class Match {

    @Id
    private String id;

    private String lostItemId;
    private String foundItemId;
    private String lostUserId;
    private String foundUserId;

    private double score;   // 0.0 – 1.0
    private MatchStatus status = MatchStatus.SUGGESTED;

    private LocalDateTime createdAt = LocalDateTime.now();
}