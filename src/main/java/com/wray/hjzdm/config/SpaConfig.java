package com.wray.hjzdm.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA 配置
 * 处理前端路由刷新 404 问题
 */
@Controller
public class SpaConfig implements ErrorController {

    @RequestMapping("/error")
    public String handleError() {
        // Forward to index.html for any error (which usually means 404 in SPA context)
        // Ideally we should check status code, but for simple SPA fallback this works
        return "forward:/index.html";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}
