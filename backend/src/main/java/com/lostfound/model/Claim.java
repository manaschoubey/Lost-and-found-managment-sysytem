package com.lostfound.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;

    /** ID of the found item being claimed */
    private String foundItemId;

    /** ID of the user submitting the claim (the person who lost it) */
    private String claimantId;

    /** Proof / description of why this item belongs to the claimant */
    private String proofDescription;

    private String proofImageUrl;

    private ClaimStatus status = ClaimStatus.PENDING;

    /** Admin notes on approval / rejection */
    private String adminNotes;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
