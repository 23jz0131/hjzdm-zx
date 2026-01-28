package com.wray.hjzdm.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 处理所有未匹配的路径，转发到 index.html (React Router)
 * 实现 SPA (Single Page Application) 的路由支持
 */
@Controller
public class ViewController implements ErrorController {

    private static final String PATH = "/error";

    @RequestMapping(value = PATH)
    public String error() {
        return "forward:/index.html";
    }

    @Override
    public String getErrorPath() {
        return PATH;
    }
    
    /**
     * 捕获所有非API路径
     * 注意：不要与 @RestController 的路径冲突
     */
    @RequestMapping(value = {
        "/login",
        "/register",
        "/profile",
        "/compare",
        "/my-collection",
        "/my-tip",
        "/notifications",
        "/admin/**",
        "/disclosure/detail/**" // 详情页
    })
    public String forward() {
        return "forward:/index.html";
    }
}
