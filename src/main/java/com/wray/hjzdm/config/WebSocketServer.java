package com.wray.hjzdm.config;

import com.alibaba.fastjson2.JSON;
import com.wray.hjzdm.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * WebSocket服务端点
 */
@Slf4j
@Component
@ServerEndpoint("/ws")
public class WebSocketServer {

    /**
     * 静态变量，用来记录当前在线连接数
     */
    private static AtomicInteger onlineCount = new AtomicInteger(0);

    /**
     * concurrent包的线程安全Set，用来存放每个客户端对应的WebSocketServer对象
     */
    private static ConcurrentHashMap<String, WebSocketServer> webSocketSet = new ConcurrentHashMap<>();
    
    /**
     * 存储用户ID与Session ID的映射关系
     */
    private static ConcurrentHashMap<Long, String> userSessionMap = new ConcurrentHashMap<>();

    /**
     * 与某个客户端的连接会话，需要通过它来给客户端发送数据
     */
    private Session session;
    
    /**
     * 当前连接的用户ID
     */
    private Long userId;

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        String sessionId = session.getId();
        webSocketSet.put(sessionId, this); // 加入set中
        onlineCount.incrementAndGet(); // 在线数加1
        log.info("有新连接加入，当前在线人数为：" + onlineCount.get());
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        String sessionId = this.session.getId();
        // 从用户会话映射中移除（如果存在）
        if (userId != null) {
            userSessionMap.remove(userId);
        }
        webSocketSet.remove(sessionId); // 从set中删除
        onlineCount.decrementAndGet(); // 在线数减1
        log.info("有一连接关闭，当前在线人数为：" + onlineCount.get());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("来自客户端的消息:" + message);
        
        try {
            // 解析客户端发送的消息
            MessageRequest msgReq = JSON.parseObject(message, MessageRequest.class);
            
            // 如果是注册用户ID的消息
            if ("register".equals(msgReq.getType())) {
                Long receivedUserId = msgReq.getUserId();
                if (receivedUserId != null) {
                    this.userId = receivedUserId;
                    String sessionId = session.getId();
                    userSessionMap.put(receivedUserId, sessionId);
                    log.info("用户ID {} 已注册到WebSocket会话 {}", receivedUserId, sessionId);
                    
                    // 发送确认响应
                    MessageResponse response = new MessageResponse();
                    response.setType("register_response");
                    response.setMessage("用户注册成功");
                    response.setSuccess(true);
                    sendMessage(JSON.toJSONString(response));
                }
            } else {
                // 其他类型的消息则群发
                broadcast(message);
            }
        } catch (Exception e) {
            log.error("解析客户端消息失败:", e);
            // 发送错误响应
            MessageResponse response = new MessageResponse();
            response.setType("error");
            response.setMessage("消息解析失败: " + e.getMessage());
            response.setSuccess(false);
            try {
                sendMessage(JSON.toJSONString(response));
            } catch (IOException ioException) {
                log.error("发送错误响应失败:", ioException);
            }
        }
    }

    /**
     * 发生错误时调用
     *
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("websocket连接发生错误：", error);
    }

    /**
     * 群发消息
     *
     * @param message
     */
    public void broadcast(String message) {
        for (String sessionId : webSocketSet.keySet()) {
            try {
                webSocketSet.get(sessionId).sendMessage(message);
            } catch (IOException e) {
                log.error("推送消息失败，sessionId：" + sessionId, e);
            }
        }
    }

    /**
     * 发送消息
     *
     * @param message
     * @throws IOException
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    /**
     * 发送消息给指定用户
     *
     * @param userId
     * @param message
     */
    public static void sendToUser(Long userId, String message) {
        String sessionId = userSessionMap.get(userId);
        if (sessionId != null) {
            WebSocketServer webSocketServer = webSocketSet.get(sessionId);
            if (webSocketServer != null) {
                try {
                    webSocketServer.sendMessage(message);
                    log.info("发送WebSocket消息给用户 {}: {}", userId, message);
                } catch (IOException e) {
                    log.error("发送消息给用户失败，userId：" + userId, e);
                }
            } else {
                log.warn("用户 {} 对应的WebSocket会话不存在", userId);
            }
        } else {
            log.warn("用户 {} 没有活跃的WebSocket连接", userId);
        }
    }

    /**
     * 获取当前在线人数
     *
     * @return
     */
    public static Integer getOnlineCount() {
        return onlineCount.get();
    }
    
    /**
     * 消息请求封装类
     */
    public static class MessageRequest {
        private String type;
        private Long userId;
        private String message;
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    /**
     * 消息响应封装类
     */
    public static class MessageResponse {
        private String type;
        private String message;
        private Boolean success;
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public Boolean getSuccess() {
            return success;
        }
        
        public void setSuccess(Boolean success) {
            this.success = success;
        }
    }
}