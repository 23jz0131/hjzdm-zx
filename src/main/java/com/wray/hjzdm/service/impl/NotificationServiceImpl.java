package com.wray.hjzdm.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.config.WebSocketServer;
import com.wray.hjzdm.entity.Notification;
import com.wray.hjzdm.mapper.NotificationMapper;
import com.wray.hjzdm.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    @Autowired
    private WebSocketServer webSocketServer;

    @Override
    public void sendNotification(Long userId, String title, String content) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .isRead(0)
                .createTime(new Date())
                .build();
        this.save(notification);
        
        // 通过WebSocket发送实时通知
        try {
            WebSocketServer.MessageResponse wsMsg = new WebSocketServer.MessageResponse();
            wsMsg.setType("notification");
            wsMsg.setMessage("您收到了一条新通知");
            wsMsg.setSuccess(true);
            
            // 添加通知详细信息
            NotificationInfo notificationInfo = new NotificationInfo();
            notificationInfo.setId(notification.getId());
            notificationInfo.setTitle(title);
            notificationInfo.setContent(content);
            notificationInfo.setCreateTime(notification.getCreateTime());
            wsMsg.setMessage(JSON.toJSONString(notificationInfo));
            
            WebSocketServer.sendToUser(userId, JSON.toJSONString(wsMsg));
        } catch (Exception e) {
            // 如果WebSocket发送失败，不影响主要业务流程
            System.err.println("发送WebSocket通知失败: " + e.getMessage());
        }
    }

    @Override
    public List<Notification> getMyNotifications(Long userId) {
        return this.list(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getCreateTime));
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = this.getById(notificationId);
        if (notification != null) {
            notification.setIsRead(1);
            this.updateById(notification);
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        // 使用 updateWrapper 批量更新
        // 由于 MP 的 update(entity, wrapper) 逻辑，这里需要构造一个只有 isRead=1 的 entity
        Notification updateEntity = new Notification();
        updateEntity.setIsRead(1);
        
        this.update(updateEntity, new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0));
    }
    
    @Override
    public void deleteNotification(Long notificationId) {
        this.removeById(notificationId);
    }
    
    /**
     * 通知信息封装类
     */
    public static class NotificationInfo {
        private Long id;
        private String title;
        private String content;
        private Date createTime;
        
        // Getters and setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
        
        public Date getCreateTime() {
            return createTime;
        }
        
        public void setCreateTime(Date createTime) {
            this.createTime = createTime;
        }
    }
}