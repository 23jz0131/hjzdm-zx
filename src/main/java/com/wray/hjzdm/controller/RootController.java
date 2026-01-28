package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Api(tags = "根路径兼容接口")
public class RootController {

    @Autowired
    private UserController userController;

    /**
     * 兼容 /register 路径的注册请求
     * 解决前端可能发送错误的 /register 请求的问题
     */
    @PostMapping("/register")
    @ApiOperation("用户注册(兼容根路径)")
    public Result<?> register(@RequestBody UserRegisterDTO registerDTO) {
        return userController.register(registerDTO);
    }
}