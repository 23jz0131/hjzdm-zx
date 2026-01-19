package com.wray.hjzdm.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserLoginDTO implements Serializable {

    // 用户名或邮箱
    private String username;

    // 密码
    private String password;
}