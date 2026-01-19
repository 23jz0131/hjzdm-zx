package com.wray.hjzdm.common;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.wray.hjzdm.entity.GoodsLike;
import com.wray.hjzdm.mapper.GoodsLikeMapper;
@Configuration
@EnableScheduling
public class CronUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(CronUtil.class);

    @Autowired
    private RedisTemplate redisTemplate;

    @Autowired
    private GoodsLikeMapper goodsLikeMapper;

    @Scheduled(cron = "0 0 * * * ?")
    private void saveLike() {
        LOGGER.info("saveLike start");
        Map like = redisTemplate.opsForHash()
                .entries(RedisConstant.GOODS_LIKE_KEY);
        if (like == null || like.isEmpty()) {
            LOGGER.info("like is empty");
            return;
        }
        for (Object k : like.keySet()) {
            Object v = like.get(k);
            Set<Long> userIds = (Set<Long>) v;
            Long goodsId = Long.parseLong((String) k);
            LambdaQueryWrapper<GoodsLike> queryWrapper = new LambdaQueryWrapper<>();
            goodsLikeMapper.delete(queryWrapper.eq(GoodsLike::getGoodsId, goodsId));
            List<GoodsLike> goodsLikes = new ArrayList<>();
            userIds.forEach(userId -> {
                GoodsLike goodsLike = new GoodsLike();
                goodsLike.setUserId(userId);
                goodsLike.setGoodsId(Long.parseLong((String) k));
                goodsLikes.add(goodsLike);
            });
            goodsLikeMapper.insertBatchSomeColumn(goodsLikes);
        }
    }

}


