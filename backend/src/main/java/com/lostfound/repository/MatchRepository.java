package com.lostfound.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lostfound.model.Match;

public interface MatchRepository extends MongoRepository<Match, String> {
    List<Match> findByLostUserIdOrFoundUserId(String lostUserId, String foundUserId);
    List<Match> findByLostItemId(String lostItemId);
    List<Match> findByFoundItemId(String foundItemId);
}
