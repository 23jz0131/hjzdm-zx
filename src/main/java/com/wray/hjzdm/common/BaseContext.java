package com.wray.hjzdm.common;

/**
 * 基于threadLocal封装工具类，用户保存和获取当前用户登录的id
 */
public class BaseContext {
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    /**
     * 设置当前id
     */
    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    public static Long getCurrentId() {
        return threadLocal.get();
    }
}
