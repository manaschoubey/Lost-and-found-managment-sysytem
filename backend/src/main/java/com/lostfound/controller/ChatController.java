package com.lostfound.controller;

import com.lostfound.dto.ApiResponse;
import com.lostfound.model.ChatRoom;
import com.lostfound.model.Message;
import com.lostfound.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired private ChatService chatService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatRoom>>> myRooms(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", chatService.myRooms(auth.getName())));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<ChatRoom>> room(@PathVariable String roomId,
                                                     Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK", chatService.getRoom(roomId, auth.getName())));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<Message>>> messages(@PathVariable String roomId,
                                                              Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
                chatService.messages(roomId, auth.getName())));
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<Message>> send(@PathVariable String roomId,
                                                     @RequestBody Map<String, String> body,
                                                     Authentication auth) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Message text required");
        }
        return ResponseEntity.ok(ApiResponse.ok("Sent",
                chatService.send(roomId, auth.getName(), text)));
    }
}