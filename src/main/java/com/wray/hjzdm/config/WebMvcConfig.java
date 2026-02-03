package com.wray.hjzdm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置上传文件的静态资源映射
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
        
        // 配置其他静态资源
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}