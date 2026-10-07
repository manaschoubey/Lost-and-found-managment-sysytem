package com.lostfound.repository;

import com.lostfound.model.Claim;
import com.lostfound.model.ClaimStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends MongoRepository<Claim, String> {

    List<Claim> findByClaimantId(String claimantId);

    List<Claim> findByFoundItemId(String foundItemId);

    List<Claim> findByStatus(ClaimStatus status);

    boolean existsByFoundItemIdAndClaimantId(String foundItemId, String claimantId);

    long countByStatus(ClaimStatus status);
}
