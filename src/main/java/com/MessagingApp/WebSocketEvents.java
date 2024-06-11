package com.MessagingApp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEvents {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEvents.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<String, String> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, String> orderedOnlineUsers = Collections.synchronizedMap(new LinkedHashMap<>());

    public WebSocketEvents(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionSubscribeEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            String sessionID = accessor.getSessionId();
            String username = accessor.getFirstNativeHeader("username");

            logger.info("Received a new connection with sessionID: {} and username {}", sessionID, username);

            if (username != null) {
                onlineUsers.put(sessionID, username);

                synchronized (orderedOnlineUsers) {
                    orderedOnlineUsers.put(sessionID, username);
                }

                logger.info("Online user saved in the maps with key {} and value {}", sessionID, username);
                logger.info("Ordered online users before sending: {}", orderedOnlineUsers);

                // Send the updated ordered online users list to all clients
                messagingTemplate.convertAndSend("/topic/onlineUsers", orderedOnlineUsers);

                logger.info("Ordered online users sent: {}", orderedOnlineUsers);
            } else {
                logger.warn("Username is null for sessionID: {}", sessionID);
            }
        } catch (Exception e) {
            logger.error("Error when saving the online user: ", e);
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            String sessionID = accessor.getSessionId();

            logger.info("User disconnected with sessionID: {}", sessionID);

            onlineUsers.remove(sessionID);

            synchronized (orderedOnlineUsers) {
                orderedOnlineUsers.remove(sessionID);
            }

            logger.info("Ordered online users before sending: {}", orderedOnlineUsers);

            // Send the updated ordered online users list to all clients
            messagingTemplate.convertAndSend("/topic/onlineUsers", orderedOnlineUsers);

            logger.info("Ordered online users sent: {}", orderedOnlineUsers);
        } catch (Exception e) {
            logger.error("Error when disconnecting: ", e);
        }
    }
}

