package com.lostfound.repository;

import com.lostfound.model.Match;
import com.lostfound.model.MatchStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {

    List<Match> findByLostItemId(String lostItemId);

    List<Match> findByFoundItemId(String foundItemId);

    List<Match> findByStatus(MatchStatus status);

    boolean existsByLostItemIdAndFoundItemId(String lostItemId, String foundItemId);

    List<Match> findByLostItemIdOrFoundItemId(String lostItemId, String foundItemId);
}
