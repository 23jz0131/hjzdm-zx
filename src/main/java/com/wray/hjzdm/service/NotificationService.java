package com.wray.hjzdm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.entity.Notification;

import java.util.List;

public interface NotificationService extends IService<Notification> {
    void sendNotification(Long userId, String title, String content);
    List<Notification> getMyNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId);
}
