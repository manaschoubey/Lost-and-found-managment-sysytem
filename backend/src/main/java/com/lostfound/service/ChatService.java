package com.lostfound.service;

import com.lostfound.model.*;
import com.lostfound.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired private ChatRoomRepository roomRepo;
    @Autowired private MessageRepository msgRepo;
    @Autowired private ClaimRepository claimRepo;
    @Autowired private FoundItemRepository foundRepo;
    @Autowired private UserRepository userRepo;

    public ChatRoom createRoomForClaim(Claim claim) {
        List<ChatRoom> existing = roomRepo.findByClaimId(claim.getId());
        if (!existing.isEmpty()) return existing.get(0);

        FoundItem item = foundRepo.findById(claim.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        ChatRoom room = new ChatRoom();
        room.setClaimId(claim.getId());
        room.setItemId(item.getId());
        room.setItemName(item.getItemName());
        room.setFinderUserId(item.getUserId());
        room.setClaimantUserId(claim.getClaimantUserId());
        room.setStatus("OPEN");
        roomRepo.save(room);

        Message sys = new Message();
        sys.setRoomId(room.getId());
        sys.setSenderUserId("system");
        sys.setSenderName("System");
        sys.setText("🎉 Your claim for \"" + item.getItemName() + "\" was approved!\n" +
                "Coordinate the handover here. Never share bank details or pay any money.");
        msgRepo.save(sys);

        return room;
    }

    public List<ChatRoom> myRooms(String userId) {
        return roomRepo.findByFinderUserIdOrClaimantUserIdOrderByCreatedAtDesc(userId, userId);
    }

    public ChatRoom getRoom(String roomId, String userId) {
        ChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (!userId.equals(room.getFinderUserId()) && !userId.equals(room.getClaimantUserId())) {
            throw new RuntimeException("Not allowed");
        }
        return room;
    }

    public List<Message> messages(String roomId, String userId) {
        getRoom(roomId, userId);
        return msgRepo.findByRoomIdOrderByCreatedAtAsc(roomId);
    }

    public Message send(String roomId, String userId, String text) {
        getRoom(roomId, userId);

        User u = userRepo.findByEmail(userId).orElse(null);

        Message m = new Message();
        m.setRoomId(roomId);
        m.setSenderUserId(userId);
        m.setSenderName(u != null ? u.getName() : "User");
        m.setText(text);
        return msgRepo.save(m);
    }
}