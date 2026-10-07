package com.lostfound.service;

import java.time.temporal.ChronoUnit;
import java.util.List;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lostfound.model.FoundItem;
import com.lostfound.model.ItemStatus;
import com.lostfound.model.LostItem;
import com.lostfound.model.Match;
import com.lostfound.model.MatchStatus;
import com.lostfound.model.Notification;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.MatchRepository;
import com.lostfound.repository.NotificationRepository;

@Service
public class MatchingService {

    @Autowired private LostItemRepository lostRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private MatchRepository matchRepo;
    @Autowired private NotificationRepository notificationRepo;

    private static final double THRESHOLD = 0.5; // only save matches above 50%

    // Weights
    private static final double W_NAME = 0.30;
    private static final double W_CATEGORY = 0.20;
    private static final double W_LOCATION = 0.30;
    private static final double W_DATE = 0.20;

    /** Called after new LostItem is saved. */
    public void matchForLostItem(LostItem lost) {
        List<FoundItem> candidates = foundRepo.findByStatus(ItemStatus.FOUND);
        for (FoundItem f : candidates) {
            double score = computeScore(
                    lost.getItemName(), f.getItemName(),
                    lost.getCategoryId(), f.getCategoryId(),
                    lost.getLocation(), f.getLocation(),
                    lost.getLostDate(), f.getFoundDate()
            );
            if (score >= THRESHOLD) {
                saveMatch(lost.getId(), f.getId(), lost.getUserId(), f.getUserId(), score);
            }
        }
    }

    /** Called after new FoundItem is saved. */
    public void matchForFoundItem(FoundItem found) {
        List<LostItem> candidates = lostRepo.findByStatus(ItemStatus.LOST);
        for (LostItem l : candidates) {
            double score = computeScore(
                    l.getItemName(), found.getItemName(),
                    l.getCategoryId(), found.getCategoryId(),
                    l.getLocation(), found.getLocation(),
                    l.getLostDate(), found.getFoundDate()
            );
            if (score >= THRESHOLD) {
                saveMatch(l.getId(), found.getId(), l.getUserId(), found.getUserId(), score);
            }
        }
    }

    private double computeScore(String name1, String name2,
                                String cat1, String cat2,
                                String loc1, String loc2,
                                java.time.LocalDate d1, java.time.LocalDate d2) {

        double nameScore = stringSimilarity(name1, name2);
        double catScore = (cat1 != null && cat1.equals(cat2)) ? 1.0 : 0.0;
        double locScore = stringSimilarity(loc1, loc2);

        double dateScore = 0.0;
        if (d1 != null && d2 != null) {
            long days = Math.abs(ChronoUnit.DAYS.between(d1, d2));
            if (days <= 1) dateScore = 1.0;
            else if (days <= 7) dateScore = 0.75;
            else if (days <= 30) dateScore = 0.4;
            else dateScore = 0.1;
        }

        return W_NAME * nameScore
             + W_CATEGORY * catScore
             + W_LOCATION * locScore
             + W_DATE * dateScore;
    }

    private double stringSimilarity(String a, String b) {
        if (a == null || b == null) return 0.0;
        a = a.toLowerCase().trim();
        b = b.toLowerCase().trim();
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return 1.0;
        int dist = LevenshteinDistance.getDefaultInstance().apply(a, b);
        return 1.0 - ((double) dist / maxLen);
    }

    private void saveMatch(String lostId, String foundId,
                           String lostUser, String foundUser, double score) {

        Match m = new Match();
        m.setLostItemId(lostId);
        m.setFoundItemId(foundId);
        m.setLostUserId(lostUser);
        m.setFoundUserId(foundUser);
        m.setScore(score);
        m.setStatus(MatchStatus.SUGGESTED);
        matchRepo.save(m);

        // Notify both users
        notify(lostUser, "Possible match found!",
                "A found item may match your lost report.", m.getId());
        if (!lostUser.equals(foundUser)) {
            notify(foundUser, "Possible match found!",
                    "A lost report may match the item you found.", m.getId());
        }
    }

    private void notify(String userId, String title, String message, String refId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType("MATCH");
        n.setRefId(refId);
        notificationRepo.save(n);
    }

    public List<Match> getMatchesForUser(String userId) {
        return matchRepo.findByLostUserIdOrFoundUserId(userId, userId);
    }
}