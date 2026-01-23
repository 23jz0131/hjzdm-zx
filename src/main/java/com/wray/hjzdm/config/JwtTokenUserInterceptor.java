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
        System.out.println(">>> [INTERCEPTOR] REQUEST: " + uri + " [" + request.getMethod() + "]");

        // Handle OPTIONS request for CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println(">>> [INTERCEPTOR] Allowing OPTIONS request");
            return true;
        }

        // 1️⃣ 非 Controller 请求直接放行
        if (!(handler instanceof HandlerMethod)) {
            System.out.println(">>> [INTERCEPTOR] Skipping non-controller handler: " + handler.getClass().getName());
            return true;
        }

        // 2️⃣ 登录接口放行
        if (uri.contains("/user/localLogin") || uri.contains("/user/login")) {
            return true;
        }

        // 3️⃣ 从 header 中获取 token
        String token = request.getHeader(jwtProperties.getUserTokenName());
        System.out.println(">>> Token header (" + jwtProperties.getUserTokenName() + "): " + (token == null ? "null" : (token.isEmpty() ? "empty" : "present")));

        // ⭐⭐⭐ 关键修复：没有 token = 游客，直接放行
        if (token == null || token.trim().isEmpty()) {
            LOGGER.info("游客访问：{}", uri);
            return true;
        }

        try {
            LOGGER.info("jwt校验: {}", token);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
            Long userId = Long.valueOf(claims.get(Constants.USER_ID).toString());
            BaseContext.setCurrentId(userId);
            LOGGER.info("当前用户id：{}", userId);
            return true;
        } catch (ExpiredJwtException ex) {
            // 策略调整：如果是 GET 请求，允许降级为游客；如果是 POST/PUT/DELETE 等修改操作，严格拒绝
            if ("GET".equalsIgnoreCase(request.getMethod())) {
                LOGGER.warn("JWT 已过期, GET请求降级为游客访问: {}", uri);
                return true;
            } else {
                LOGGER.warn("JWT 已过期, 非GET请求拒绝访问: {}", uri);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }
        } catch (Exception ex) {
            LOGGER.warn("JWT 校验失败", ex);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }
}

