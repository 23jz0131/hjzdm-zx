package com.wray.hjzdm.common;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;

@Data
public class Result<T> implements Serializable {

    private Integer code; //编码
    private T data; //数据
    private String msg; //错误信息
    //    private Map map = new HashMap(); //动态数据
    private Map<String, Object> map = new HashMap<>(); //动态数据

    //成功信息
    public static <T> Result<T> success(T object) {
        Result<T> result = new Result<>();
        result.code = 200;
        result.data = object;
        return result;
    }

    //成功信息
    public static <T> Result<T> success(String msg, T object) {
        Result<T> result = new Result<>();
        result.code = 200;
        result.data = object;
        result.msg = msg;
        return result;
    }

    //失败信息
    public static <T> Result<T> error(String msg) {
        Result<T> result = new Result<>();
        result.code = 0;
        result.msg = msg;
        return result;
    }

    //失败信息
    public static <T> Result<T> error(Integer code, String msg) {
        Result<T> result = new Result<>();
        result.code = code;
        result.msg = msg;
        return result;
    }

    //添加动态数据
    public Result<T> add(String key, Object value) {
        this.map.put(key, value);
        return this;
    }

}
