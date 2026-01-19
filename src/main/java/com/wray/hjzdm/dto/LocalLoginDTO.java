package com.wray.hjzdm.dto;

import lombok.Data;

@Data
public class LocalLoginDTO {

    private String phone;

    private String password;   // 现在后端先不校验密码，只预留字段
}
