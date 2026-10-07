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
@Document(collection = "matches")
public class Match {

    @Id
    private String id;

    private String lostItemId;

    private String foundItemId;

    /** Similarity score between 0.0 and 1.0 */
    private double score;

    private MatchStatus status = MatchStatus.POTENTIAL;

    private LocalDateTime createdAt = LocalDateTime.now();
}
