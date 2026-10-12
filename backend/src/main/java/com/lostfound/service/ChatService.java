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
    @Autowired private LostItemRepository lostRepo;
    @Autowired private UserRepository userRepo;

    public ChatRoom createRoomForClaim(Claim claim) {
        List<ChatRoom> existing = roomRepo.findByClaimId(claim.getId());
        if (!existing.isEmpty()) return existing.get(0);

        FoundItem item = foundRepo.findById(claim.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        User finder = userRepo.findByEmail(item.getUserId()).orElse(null);
        User claimant = userRepo.findByEmail(claim.getClaimantUserId()).orElse(null);

        ChatRoom room = new ChatRoom();
        room.setClaimId(claim.getId());
        room.setItemId(item.getId());
        room.setItemName(item.getItemName());
        room.setFinderUserId(item.getUserId());
        room.setFinderName(finder != null ? finder.getName() : item.getUserId());
        room.setClaimantUserId(claim.getClaimantUserId());
        room.setClaimantName(claimant != null ? claimant.getName() : claim.getClaimantUserId());
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

    public ChatRoom connectForItem(String type, String itemId, String currentUserId) {
        String ownerUserId;
        String itemName;

        if ("lost".equalsIgnoreCase(type)) {
            LostItem item = lostRepo.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Lost item not found"));
            ownerUserId = item.getUserId();
            itemName = item.getItemName();
        } else {
            FoundItem item = foundRepo.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Found item not found"));
            ownerUserId = item.getUserId();
            itemName = item.getItemName();
        }

        if (currentUserId.equalsIgnoreCase(ownerUserId)) {
            throw new RuntimeException("You cannot start a chat with yourself.");
        }

        // Check if a room already exists between these two users for this item
        List<ChatRoom> existing = roomRepo.findByItemId(itemId);
        for (ChatRoom r : existing) {
            if ((currentUserId.equalsIgnoreCase(r.getClaimantUserId()) && ownerUserId.equalsIgnoreCase(r.getFinderUserId())) ||
                (currentUserId.equalsIgnoreCase(r.getFinderUserId()) && ownerUserId.equalsIgnoreCase(r.getClaimantUserId()))) {
                return r;
            }
        }

        User owner = userRepo.findByEmail(ownerUserId).orElse(null);
        User current = userRepo.findByEmail(currentUserId).orElse(null);

        ChatRoom room = new ChatRoom();
        room.setItemId(itemId);
        room.setItemName(itemName);
        room.setFinderUserId(ownerUserId);
        room.setFinderName(owner != null ? owner.getName() : ownerUserId);
        room.setClaimantUserId(currentUserId);
        room.setClaimantName(current != null ? current.getName() : currentUserId);
        room.setStatus("OPEN");
        roomRepo.save(room);

        Message sys = new Message();
        sys.setRoomId(room.getId());
        sys.setSenderUserId("system");
        sys.setSenderName("System");
        sys.setText("💬 Chat started regarding \"" + itemName + "\". Please discuss verification and handover safely.");
        msgRepo.save(sys);

        return room;
    }

    public List<ChatRoom> myRooms(String userId) {
        return roomRepo.findByFinderUserIdOrClaimantUserIdOrderByCreatedAtDesc(userId, userId);
    }

    public ChatRoom getRoom(String roomId, String userId) {
        ChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (!userId.equalsIgnoreCase(room.getFinderUserId()) && !userId.equalsIgnoreCase(room.getClaimantUserId())) {
            throw new RuntimeException("Not allowed to access this chat room");
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