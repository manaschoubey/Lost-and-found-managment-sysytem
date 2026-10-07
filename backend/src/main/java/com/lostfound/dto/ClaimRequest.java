package com.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {

    @NotBlank(message = "Found item ID is required")
    private String foundItemId;

    @NotBlank(message = "Proof description is required")
    private String proofDescription;
}
