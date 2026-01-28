package com.wray.hjzdm.common;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.wray.hjzdm.entity.GoodsLike;
import com.wray.hjzdm.mapper.GoodsLikeMapper;

@Configuration
@EnableScheduling
public class CronUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(CronUtil.class);

    @Scheduled(cron = "0 0 * * * ?")
    private void saveLike() {
        LOGGER.info("saveLike start - (Redis disabled)");
        // Redis removed
    }

}
