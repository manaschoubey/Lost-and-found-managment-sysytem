package com.lostfound.service;

import com.lostfound.model.ClaimStatus;
import com.lostfound.model.ItemStatus;
import com.lostfound.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRepository claimRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total counts
        stats.put("totalLostItems", lostItemRepository.count());
        stats.put("totalFoundItems", foundItemRepository.count());
        stats.put("totalClaims", claimRepository.count());
        stats.put("totalMatches", matchRepository.count());
        stats.put("totalUsers", userRepository.count());

        // Status breakdowns
        stats.put("openLostItems", lostItemRepository.countByStatus(ItemStatus.OPEN));
        stats.put("openFoundItems", foundItemRepository.countByStatus(ItemStatus.OPEN));
        stats.put("returnedLostItems", lostItemRepository.countByStatus(ItemStatus.RETURNED));
        stats.put("returnedFoundItems", foundItemRepository.countByStatus(ItemStatus.RETURNED));

        // Claim stats
        stats.put("pendingClaims", claimRepository.countByStatus(ClaimStatus.PENDING));
        stats.put("approvedClaims", claimRepository.countByStatus(ClaimStatus.APPROVED));
        stats.put("rejectedClaims", claimRepository.countByStatus(ClaimStatus.REJECTED));

        return stats;
    }
}
