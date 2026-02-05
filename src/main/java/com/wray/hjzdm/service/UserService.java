package com.wray.hjzdm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.LocalLoginDTO;
import com.wray.hjzdm.dto.UserLoginDTO;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.entity.User;

public interface UserService extends IService<User> {

    /**
     * 用户名或邮箱登录
     */
    User login(UserLoginDTO dto);
    
    /**
     * 用户注册
     */
    User register(UserRegisterDTO dto);
    
    /**
     * 根据ID获取用户完整信息
     */
    User getUserProfile(Long userId);
    
    /**
     * 移除更新用户资料方法
     * 个人信息编辑功能已被删除
     */
    
    /**
     * 重置用户密码
     */
    void resetPassword(Long userId, String newPassword);
}