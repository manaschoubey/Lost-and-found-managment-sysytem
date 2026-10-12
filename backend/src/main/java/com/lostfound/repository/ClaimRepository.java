package com.lostfound.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.lostfound.model.Claim;
import com.lostfound.model.ClaimStatus;

@Repository
public interface ClaimRepository extends MongoRepository<Claim, String> {
    List<Claim> findByClaimantUserId(String userId);
    List<Claim> findByStatus(ClaimStatus status);
    List<Claim> findByFoundItemId(String foundItemId);
}