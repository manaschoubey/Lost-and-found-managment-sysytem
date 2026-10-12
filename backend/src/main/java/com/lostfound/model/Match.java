package com.lostfound.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "matches")
public class Match {

    @Id private String id;
    private String lostItemId;
    private String foundItemId;
    private String lostUserId;
    private String foundUserId;
    private double score;
    private MatchStatus status = MatchStatus.SUGGESTED;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLostItemId() { return lostItemId; }
    public void setLostItemId(String lostItemId) { this.lostItemId = lostItemId; }

    public String getFoundItemId() { return foundItemId; }
    public void setFoundItemId(String foundItemId) { this.foundItemId = foundItemId; }

    public String getLostUserId() { return lostUserId; }
    public void setLostUserId(String lostUserId) { this.lostUserId = lostUserId; }

    public String getFoundUserId() { return foundUserId; }
    public void setFoundUserId(String foundUserId) { this.foundUserId = foundUserId; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}