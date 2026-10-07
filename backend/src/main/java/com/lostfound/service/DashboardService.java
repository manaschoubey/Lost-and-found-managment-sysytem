package com.lostfound.service;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lostfound.model.ClaimStatus;
import com.lostfound.model.ItemStatus;
import com.lostfound.model.LostItem;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.MatchRepository;
import com.lostfound.repository.NotificationRepository;

@Service
public class DashboardService {

    @Autowired private LostItemRepository lostRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private ClaimRepository claimRepo;
    @Autowired private MatchRepository matchRepo;
    @Autowired private NotificationRepository notifRepo;

    public Map<String, Object> userStats(String userId) {
        Map<String, Object> m = new HashMap<>();
        m.put("lostReports", lostRepo.countByUserId(userId));
        m.put("foundReports", foundRepo.countByUserId(userId));
        m.put("activeClaims", claimRepo.findByClaimantUserId(userId).stream()
                .filter(c -> c.getStatus() == ClaimStatus.PENDING
                        || c.getStatus() == ClaimStatus.UNDER_REVIEW)
                .count());
        m.put("matches", matchRepo.findByLostUserIdOrFoundUserId(userId, userId).size());
        m.put("returned", foundRepo.findByStatus(ItemStatus.RETURNED).size());
        m.put("unreadNotifications", notifRepo.countByUserIdAndReadFalse(userId));
        return m;
    }

    public Map<String, Object> adminAnalytics() {
        Map<String, Object> m = new HashMap<>();

        // Items by category
        Map<String, Long> byCategory = lostRepo.findAll().stream()
                .filter(i -> i.getCategoryId() != null)
                .collect(Collectors.groupingBy(LostItem::getCategoryId, Collectors.counting()));
        m.put("itemsByCategory", byCategory);

        // Lost vs Found
        Map<String, Long> lf = new HashMap<>();
        lf.put("lost", lostRepo.count());
        lf.put("found", foundRepo.count());
        m.put("lostVsFound", lf);

        // Monthly reports
        Map<String, Long> monthly = lostRepo.findAll().stream()
                .filter(i -> i.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getCreatedAt().getYear() + "-" + i.getCreatedAt().getMonthValue(),
                        Collectors.counting()));
        m.put("monthlyReports", monthly);

        m.put("totalClaims", claimRepo.count());
        return m;
    }
}