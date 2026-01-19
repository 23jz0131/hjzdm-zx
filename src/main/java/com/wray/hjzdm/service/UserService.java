package com.wray.hjzdm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.LocalLoginDTO;
import com.wray.hjzdm.dto.UserLoginDTO;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.entity.User;

public interface UserService extends IService<User> {

    /**
     * 本地手机号登录
     */
    User localLogin(LocalLoginDTO dto);
    
    /**
     * 用户名或邮箱登录
     */
    User login(UserLoginDTO dto);
    
    /**
     * 用户注册
     */
    User register(UserRegisterDTO dto);
}
