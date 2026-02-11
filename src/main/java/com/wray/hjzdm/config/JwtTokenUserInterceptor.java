package com.wray.hjzdm.config;

import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.Constants;
import com.wray.hjzdm.common.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class JwtTokenUserInterceptor implements HandlerInterceptor {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtTokenUserInterceptor.class);

    @Autowired
    private JwtProperties jwtProperties;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        
        String uri = request.getRequestURI();
        // Debug log removed

        // Handle OPTIONS request for CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            // Debug log removed
            return true;
        }

        // 1️⃣ 非 Controller 请求直接放行
        if (!(handler instanceof HandlerMethod)) {
            // Debug log removed
            return true;
        }

        // 2️⃣ 登录接口放行
        if (uri.contains("/user/localLogin") || uri.contains("/user/login")) {
            return true;
        }

        // 3️⃣ 从 header 中获取 token
        String authHeader = request.getHeader(jwtProperties.getUserTokenName());
        String token = null;
        
        // 处理 Bearer token 格式
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // 移除 "Bearer " 前缀
        } else {
            token = authHeader;
        }
        
        LOGGER.info("请求URI: {}, Token: {}", uri, token != null ? "[存在]" : "[不存在]");

        // ⭐⭐⭐ 关键修复：没有 token = 游客，直接放行
        if (token == null || token.trim().isEmpty()) {
            LOGGER.info("游客访问：{}", uri);
            BaseContext.removeCurrentId(); // 确保清除用户上下文
            return true;
        }

        try {
            LOGGER.info("jwt校验开始: {}", uri);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
            Long userId = Long.valueOf(claims.get(Constants.USER_ID).toString());
            BaseContext.setCurrentId(userId);
            LOGGER.info("JWT校验成功，当前用户id：{}", userId);
            
            // 将userId添加到请求属性中，供后续处理器使用
            request.setAttribute("userId", userId);
            
            return true;
        } catch (ExpiredJwtException ex) {
            LOGGER.warn("JWT 已过期: {}", ex.getMessage());
            BaseContext.removeCurrentId();
            request.removeAttribute("userId");
            // 过期的令牌也当作游客处理
            return true;
        } catch (Exception ex) {
            LOGGER.warn("JWT 校验失败: {}", ex.getMessage(), ex);
            // 简化处理：校验失败时作为游客访问
            LOGGER.info("JWT校验失败，降级为游客访问: {}", uri);
            // 清除可能存在的用户上下文
            BaseContext.removeCurrentId();
            request.removeAttribute("userId");
            return true;
        }
    }
}

