package com.MessagingApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {
    @Autowired
    MessageRepository messageRepository;

    @MessageMapping("/public")
    @SendTo("/topic/public")
    public Message sendPublic(Message message) {
        messageRepository.save(message);
        return message;
    }
}
