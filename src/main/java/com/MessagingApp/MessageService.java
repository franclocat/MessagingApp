package com.MessagingApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public Optional<Message> saveMessage(Message message) {
        return Optional.of(messageRepository.save(message));
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public void deleteAllMessages() {
        messageRepository.deleteAll();
    }

    public List<Message> getMessageHistory(String user1, String user2) {
        return messageRepository.findChatHistoryBetween(user1, user2);
    }

    public List<Message> getPublicChat() {
        return messageRepository.loadPublicChat();
    }
}