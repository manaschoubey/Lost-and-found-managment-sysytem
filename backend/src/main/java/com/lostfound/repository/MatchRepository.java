package com.lostfound.repository;

import com.lostfound.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MatchRepository extends MongoRepository<Match, String> {
    List<Match> findByLostUserIdOrFoundUserId(String lostUserId, String foundUserId);
    List<Match> findByLostItemId(String lostItemId);
    List<Match> findByFoundItemId(String foundItemId);
}