package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.entity.User;
import com.wray.hjzdm.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据库连接测试端点
 */
@Api(tags = "数据库测试接口")
@RestController
@RequestMapping("/db-test")
public class DatabaseTestController {

    @Autowired
    private UserService userService;

    @GetMapping("/test-connection")
    @ApiOperation("测试数据库连接")
    public Result<Object> testConnection() {
        try {
            // 尝试查询一条用户记录来测试连接
            User user = userService.getById(1L);
            return Result.success("数据库连接正常", new Object() {
                public final Boolean connectionOk = user != null || true; // 如果能执行到这里，连接就是正常的
                public final String message = "数据库连接成功";
                public final String testQueryResult = user != null ? user.getName() : "No user with id 1";
            });
        } catch (Exception e) {
            return Result.error("数据库连接失败: " + e.getMessage());
        }
    }

    @GetMapping("/user-count")
    @ApiOperation("获取用户总数")
    public Result<Object> getUserCount() {
        try {
            long count = userService.count();
            return Result.success("用户总数", new Object() {
                public final long totalCount = count;
                public final String message = "获取用户总数成功";
            });
        } catch (Exception e) {
            return Result.error("获取用户总数失败: " + e.getMessage());
        }
    }

    @GetMapping("/find-user")
    @ApiOperation("查找指定用户")
    public Result<Object> findUser(@RequestParam Long userId) {
        try {
            User user = userService.getById(userId);
            if (user != null) {
                return Result.success("用户信息", user);
            } else {
                // 尝试查询所有用户以诊断问题
                List<User> allUsers = userService.list();
                final Long finalUserId = userId;
                return Result.success("未找到指定用户，但数据库连接正常", new Object() {
                    public final String message = "未找到ID为 " + finalUserId + " のユーザー";
                    public final int totalUsersInDb = allUsers.size();
                    public final List<String> sampleUserNames = allUsers.size() > 0 ? 
                        allUsers.subList(0, Math.min(5, allUsers.size())).stream()
                            .map(u -> u.getName() + "(id:" + u.getId() + ")").collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList();
                });
            }
        } catch (Exception e) {
            return Result.error("查询用户失败: " + e.getMessage());
        }
    }
}