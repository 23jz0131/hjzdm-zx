package com.wray.hjzdm.common;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
@ControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 如果抛出的的是ServiceException，则调用该方法
     *
     * @param se 业务异常
     * @return Result
     */
    @ExceptionHandler(BizException.class)
    @ResponseBody
    public Result handle(BizException se) {
        return Result.error(se.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public Result handleAllException(Exception e) {
        return Result.error(409, "[未知异常]" + e.getMessage());
    }

}
