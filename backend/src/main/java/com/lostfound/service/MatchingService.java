package com.lostfound.service;

import com.lostfound.model.*;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.similarity.CosineSimilarity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final MatchRepository matchRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final NotificationService notificationService;

    @Value("${matching.similarity-threshold}")
    private double similarityThreshold;

    /**
     * When a new lost item is reported, compare it against all open found items.
     */
    public void findMatchesForLostItem(LostItem lostItem) {
        List<FoundItem> openFoundItems = foundItemRepository.findByStatus(ItemStatus.OPEN);

        for (FoundItem foundItem : openFoundItems) {
            if (matchRepository.existsByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())) {
                continue; // already matched
            }

            double score = calculateSimilarity(
                    lostItem.getTitle(), lostItem.getDescription(), lostItem.getCategoryId(),
                    foundItem.getTitle(), foundItem.getDescription(), foundItem.getCategoryId()
            );

            if (score >= similarityThreshold) {
                Match match = new Match();
                match.setLostItemId(lostItem.getId());
                match.setFoundItemId(foundItem.getId());
                match.setScore(score);
                match.setStatus(MatchStatus.POTENTIAL);
                matchRepository.save(match);

                // Notify both users
                notificationService.sendNotification(
                        lostItem.getUserId(),
                        "Potential Match Found!",
                        "Your lost item \"" + lostItem.getTitle() + "\" may match a found item. Score: "
                                + String.format("%.0f%%", score * 100)
                );
                notificationService.sendNotification(
                        foundItem.getUserId(),
                        "Potential Match Found!",
                        "A lost item may match the item you found: \"" + foundItem.getTitle() + "\". Score: "
                                + String.format("%.0f%%", score * 100)
                );
            }
        }
    }

    /**
     * When a new found item is reported, compare it against all open lost items.
     */
    public void findMatchesForFoundItem(FoundItem foundItem) {
        List<LostItem> openLostItems = lostItemRepository.findByStatus(ItemStatus.OPEN);

        for (LostItem lostItem : openLostItems) {
            if (matchRepository.existsByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())) {
                continue;
            }

            double score = calculateSimilarity(
                    lostItem.getTitle(), lostItem.getDescription(), lostItem.getCategoryId(),
                    foundItem.getTitle(), foundItem.getDescription(), foundItem.getCategoryId()
            );

            if (score >= similarityThreshold) {
                Match match = new Match();
                match.setLostItemId(lostItem.getId());
                match.setFoundItemId(foundItem.getId());
                match.setScore(score);
                match.setStatus(MatchStatus.POTENTIAL);
                matchRepository.save(match);

                notificationService.sendNotification(
                        lostItem.getUserId(),
                        "Potential Match Found!",
                        "Your lost item \"" + lostItem.getTitle() + "\" may match a found item. Score: "
                                + String.format("%.0f%%", score * 100)
                );
                notificationService.sendNotification(
                        foundItem.getUserId(),
                        "Potential Match Found!",
                        "A lost item may match the item you found: \"" + foundItem.getTitle() + "\". Score: "
                                + String.format("%.0f%%", score * 100)
                );
            }
        }
    }

    /**
     * Calculates similarity using cosine similarity on term-frequency vectors
     * built from the title + description, with a category bonus.
     */
    private double calculateSimilarity(String title1, String desc1, String cat1,
                                       String title2, String desc2, String cat2) {
        String text1 = (title1 + " " + desc1).toLowerCase();
        String text2 = (title2 + " " + desc2).toLowerCase();

        Map<CharSequence, Integer> vector1 = buildTermFrequencyVector(text1);
        Map<CharSequence, Integer> vector2 = buildTermFrequencyVector(text2);

        CosineSimilarity cosineSimilarity = new CosineSimilarity();
        double score = cosineSimilarity.cosineSimilarity(vector1, vector2);

        // Boost score if categories match
        if (cat1 != null && cat2 != null && cat1.equals(cat2)) {
            score = Math.min(1.0, score + 0.15);
        }

        return score;
    }

    private Map<CharSequence, Integer> buildTermFrequencyVector(String text) {
        Map<CharSequence, Integer> vector = new HashMap<>();
        String[] words = text.split("\\W+");
        for (String word : words) {
            if (word.length() > 2) { // skip very short words
                vector.merge(word, 1, Integer::sum);
            }
        }
        return vector;
    }

    public List<Match> getMatchesForLostItem(String lostItemId) {
        return matchRepository.findByLostItemId(lostItemId);
    }

    public List<Match> getMatchesForFoundItem(String foundItemId) {
        return matchRepository.findByFoundItemId(foundItemId);
    }

    public Match confirmMatch(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setStatus(MatchStatus.CONFIRMED);
        return matchRepository.save(match);
    }

    public Match rejectMatch(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setStatus(MatchStatus.REJECTED);
        return matchRepository.save(match);
    }
}
