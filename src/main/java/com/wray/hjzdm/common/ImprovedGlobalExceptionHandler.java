package com.wray.hjzdm.common;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import lombok.extern.slf4j.Slf4j;

/**
 * 全局异常处理器
 * 改进版本 - 提供更精确的错误处理和状态码
 */
@ControllerAdvice
@Slf4j
public class ImprovedGlobalExceptionHandler {
    
    /**
     * 处理业务异常
     * @param se 业务异常
     * @return Result 错误响应
     */
    @ExceptionHandler(BizException.class)
    @ResponseBody
    public Result handleBizException(BizException se) {
        log.warn("业务异常: {}", se.getMessage());
        return Result.error(se.getMessage());
    }
    
    /**
     * 处理登录相关的运行时异常
     * 专门为用户名或密码错误提供401状态码
     * @param e 运行时异常
     * @return Result 错误响应
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseBody
    public Result handleRuntimeException(RuntimeException e) {
        String message = e.getMessage();
        log.warn("运行时异常: {}", message);
        
        // 特殊处理登录相关的错误
        if (message != null) {
            if (message.contains("用户名或密码错误") || 
                message.contains("密码至少6位") || 
                message.contains("手机号不能为空")) {
                // 登录相关错误返回401 Unauthorized
                return Result.error(401, message);
            } else if (message.contains("用户名已存在")) {
                // 用户名重复返回409 Conflict
                return Result.error(409, message);
            }
        }
        
        // 其他运行时异常
        return Result.error(500, "[系统异常]" + message);
    }

    /**
     * 处理所有其他未捕获的异常
     * @param e 通用异常
     * @return Result 错误响应
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public Result handleAllException(Exception e) {
        log.error("未处理的异常: ", e);
        return Result.error(500, "[系统错误]" + e.getMessage());
    }

}