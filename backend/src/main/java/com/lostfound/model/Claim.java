package com.lostfound.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;

    private String foundItemId;
    private String claimantUserId;
    private String proofDescription;
    private List<String> proofImages = new ArrayList<>();

    private ClaimStatus status = ClaimStatus.PENDING;
    private String adminRemarks;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}