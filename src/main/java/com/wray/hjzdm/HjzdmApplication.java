package com.wray.hjzdm;

import com.wray.hjzdm.mapper.GoodsMapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@MapperScan("com.wray.hjzdm.mapper")
// @EnableCaching // Redis removed
public class HjzdmApplication {

    public static void main(String[] args) {
        SpringApplication.run(HjzdmApplication.class, args);
    }

    @Bean
    public CommandLineRunner cleanup(GoodsMapper goodsMapper) {
        return args -> {
            // Clean up invalid goods (price 0 or default name) created during testing
            goodsMapper.delete(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.wray.hjzdm.entity.Goods>()
                            .eq("GOODS_PRICE", 0)
                            .or()
                            .eq("GOODS_NAME", "未命名商品")
                            .or()
                            .isNull("GOODS_LINK")
                            .or()
                            .eq("GOODS_LINK", ""));
            // Log cleaned up invalid goods data
        };
    }

}
