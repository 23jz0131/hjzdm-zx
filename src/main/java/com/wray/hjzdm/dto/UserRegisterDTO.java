package com.wray.hjzdm.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserRegisterDTO implements Serializable {

    // 用户名
    private String username;

    // 邮箱
    private String email;

    // 密码
    private String password;

    // 确认密码
    private String confirmPassword;
}