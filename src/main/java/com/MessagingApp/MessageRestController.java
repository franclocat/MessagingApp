package com.MessagingApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class MessageRestController {
    @Autowired
    MessageService messageService;

    @PostMapping("/message/save")
    public ResponseEntity<?> saveMessage(@RequestBody Message message) {
        Optional<Message> savedMessage = messageService.saveMessage(message);
        if (savedMessage.isEmpty()) {
            return ResponseEntity.badRequest().build();
        } else {
            return ResponseEntity.ok().body("Message successfully saved: " + savedMessage.get());
        }
    }

    @GetMapping("/message/getAllPublicMessages")
    public ResponseEntity<List<Message>> getMessages() {
        return ResponseEntity.ok(messageService.getPublicChat());
    }

    @DeleteMapping("message/deleteAll")
    public ResponseEntity<?> deleteAllMessages() {
        messageService.deleteAllMessages();
        return ResponseEntity.ok().body("All the messages have been deleted from the database");
    }

    @GetMapping("/chat-history")
    public ResponseEntity<?> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
        return ResponseEntity.ok().body(messageService.getMessageHistory(user1, user2));
    }
}
