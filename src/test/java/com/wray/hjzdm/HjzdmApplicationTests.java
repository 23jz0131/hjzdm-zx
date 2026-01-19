package com.wray.hjzdm;

import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import com.wray.hjzdm.common.RedisConstant;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
class HjzdmApplicationTests {

    private static final Logger LOGGER = LoggerFactory.getLogger(HjzdmApplicationTests.class);
    @Autowired
    private RedisTemplate redisTemplate;

    @Test
    void contextLoads() {
        Cursor cursor = redisTemplate.opsForSet()
                .scan(RedisConstant.GOODS_LIKE_KEY, ScanOptions.NONE);
        while (cursor.hasNext()) {
            Object key = cursor.next();
            LOGGER.info("{}", key);
        }
    }

}
