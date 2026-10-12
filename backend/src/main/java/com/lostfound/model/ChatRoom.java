package com.lostfound.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_rooms")
public class ChatRoom {

    @Id private String id;
    private String claimId;
    private String itemId;
    private String itemName;
    private String finderUserId;
    private String claimantUserId;
    private String status = "OPEN";
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClaimId() { return claimId; }
    public void setClaimId(String claimId) { this.claimId = claimId; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getFinderUserId() { return finderUserId; }
    public void setFinderUserId(String finderUserId) { this.finderUserId = finderUserId; }

    public String getClaimantUserId() { return claimantUserId; }
    public void setClaimantUserId(String claimantUserId) { this.claimantUserId = claimantUserId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}