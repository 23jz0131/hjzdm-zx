package com.wray.hjzdm.common;

import lombok.Getter;
@Getter
public class BizException extends RuntimeException {

    private Integer code = 400;

    public BizException(String message) {
        super(message);
    }
}
