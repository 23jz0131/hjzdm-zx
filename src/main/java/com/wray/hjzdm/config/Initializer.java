package com.wray.hjzdm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Set;

@Slf4j
@Component
public class Initializer implements ApplicationListener<ContextRefreshedEvent> {

    @Resource
    private RedisTemplate redisTemplate;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        log.info("程序启动...bean已加载完成");
        clearCache();
    }

    /**
     * 清除 Redis 缓存（Redis 不可用时不影响启动）
     */
    public void clearCache() {
        try {
            log.info("清除缓存...");
            Set<String> keys = redisTemplate.keys("*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
            log.info("缓存清理完成");
        } catch (Exception e) {
            // ⭐ 核心修复点：吞掉异常，不让程序退出
            log.warn("Redis 未连接或不可用，跳过缓存清理");
        }
    }
}
