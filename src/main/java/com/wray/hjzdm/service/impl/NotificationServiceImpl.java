package com.wray.hjzdm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.entity.Notification;
import com.wray.hjzdm.mapper.NotificationMapper;
import com.wray.hjzdm.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

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
}
