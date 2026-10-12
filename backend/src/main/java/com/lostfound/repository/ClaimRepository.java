package com.lostfound.repository;

import com.lostfound.model.Claim;
import com.lostfound.model.ClaimStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClaimRepository extends MongoRepository<Claim, String> {
    List<Claim> findByClaimantUserId(String userId);
    List<Claim> findByStatus(ClaimStatus status);
    List<Claim> findByFoundItemId(String foundItemId);
}