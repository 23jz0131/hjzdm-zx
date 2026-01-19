package com.wray.hjzdm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.entity.Goods;
import io.swagger.annotations.Api;
@RestController
@RequestMapping("/test")
@Api(value = "测试相关接口", tags = {"测试相关接口"})
public class TestController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TestController.class);
    @RequestMapping("/hello")
    public String hello(@RequestBody Goods goods) {
        Long currentId = BaseContext.getCurrentId();
        LOGGER.info("user:{}", currentId);
        return "Hello World";
    }
}
