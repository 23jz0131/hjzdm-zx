package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.entity.User;
import com.wray.hjzdm.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * 健康检查和调试端点
 */
@Api(tags = "健康检查接口")
@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired
    private UserService userService;

    @GetMapping("/status")
    @ApiOperation("健康检查")
    public Result<String> health() {
        return Result.success("服务正常运行");
    }

    @GetMapping("/auth")
    @ApiOperation("认证状态检查")
    public Result<Object> authStatus(HttpServletRequest request) {
        Long userId = BaseContext.getCurrentId();
        User user = null;
        if (userId != null) {
            user = userService.getById(userId);
        }
        
        // 将变量设为final以供匿名内部类使用
        final Long finalUserId = userId;
        final String finalUserName = user != null ? user.getName() : null;
        final String finalTokenHeader = request.getHeader("Authorization");
        final String finalUserAgent = request.getHeader("User-Agent");

        return Result.success("认证状态检查", new Object() {
            public final Long currentUserId = finalUserId;
            public final Boolean isAuthenticated = finalUserId != null;
            public final String userName = finalUserName;
            public final String tokenHeader = finalTokenHeader;
            public final String userAgent = finalUserAgent;
        });
    }
}