package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.entity.Notification;
import com.wray.hjzdm.service.NotificationService;
import io.swagger.annotations.Api;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
@Api(value = "消息通知接口", tags = {"消息通知接口"})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/my")
    public Result getMyNotifications() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        List<Notification> list = notificationService.getMyNotifications(userId);
        return Result.success(list);
    }

    @PostMapping("/read")
    public Result markAsRead(@RequestBody Notification notification) {
        notificationService.markAsRead(notification.getId());
        return Result.success("ok");
    }

    @PostMapping("/readAll")
    public Result markAllAsRead() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        notificationService.markAllAsRead(userId);
        return Result.success("ok");
    }
}
