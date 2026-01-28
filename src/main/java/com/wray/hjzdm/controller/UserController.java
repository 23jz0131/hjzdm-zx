package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.Constants;
import com.wray.hjzdm.common.JwtUtil;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.config.JwtProperties;
import com.wray.hjzdm.dto.LocalLoginDTO;
import com.wray.hjzdm.dto.UserLoginDTO;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.entity.User;
import com.wray.hjzdm.service.UserService;
import com.wray.hjzdm.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Api(tags = "用户接口")
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProperties jwtProperties;

    @PostMapping("/localLogin")
    @ApiOperation("本地手机号登录")
    public Result<?> localLogin(@RequestBody LocalLoginDTO dto) {
        User user = userService.localLogin(dto);

        // 生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.USER_ID, user.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getUserSecretKey(),
                jwtProperties.getUserTtl(),
                claims);

        // 构建返回对象
        UserLoginVO loginVO = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();

        return Result.success(loginVO);
    }

    @PostMapping("/login")
    @ApiOperation("用户名或邮箱登录")
    public Result<?> login(@RequestBody UserLoginDTO dto) {
        User user = userService.login(dto);

        // 生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.USER_ID, user.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getUserSecretKey(),
                jwtProperties.getUserTtl(),
                claims);

        // 构建返回对象
        UserLoginVO loginVO = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();

        return Result.success(loginVO);
    }

    @PostMapping("/register")
    @ApiOperation("用户注册")
    public Result<?> register(@RequestBody UserRegisterDTO dto) {
        User user = userService.register(dto);
        return Result.success(user);
    }

    @PostMapping("/me")
    @ApiOperation("获取当前用户信息")
    public Result<?> getMe(HttpServletRequest request) {
        // 从BaseContext获取用户ID
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }

        User user = userService.getUserProfile(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        return Result.success(user);
    }

    @PostMapping("/updateProfile")
    @ApiOperation("更新用户资料")
    public Result<?> updateProfile(
            HttpServletRequest request,
            @RequestParam(required = false) String avatar,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer gender,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String birthDate) {

        // 从BaseContext获取用户ID
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }

        Date parsedBirthDate = null;
        if (birthDate != null && !birthDate.isEmpty()) {
            try {
                parsedBirthDate = new Date(Long.parseLong(birthDate)); // 假设前端传递的是毫秒时间戳
            } catch (NumberFormatException e) {
                return Result.error("生日日期格式错误");
            }
        }

        User user = userService.updateUserProfile(userId, avatar, nickname, name, gender, age, parsedBirthDate);
        return Result.success(user);
    }

    @Autowired
    private com.wray.hjzdm.service.UserBrowseHistoryService historyService;

    @PostMapping("/queryHistory")
    @ApiOperation("查询浏览历史")
    public Result<java.util.List<com.wray.hjzdm.entity.Goods>> queryHistory(
            @RequestBody com.wray.hjzdm.dto.QueryDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        return Result.success(historyService.queryHistory(dto));
    }

    @PostMapping("/addHistory")
    @ApiOperation("添加浏览历史")
    public Result<Boolean> addHistory(@RequestBody com.wray.hjzdm.dto.OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        historyService.addHistory(dto);
        return Result.success(true);
    }

    @PostMapping("/clearHistory")
    @ApiOperation("清空浏览历史")
    public Result<Boolean> clearHistory() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        historyService.clearHistory(userId);
        return Result.success(true);
    }

    @PostMapping("/deleteHistory")
    @ApiOperation("删除单条浏览历史")
    public Result<Boolean> deleteHistory(@RequestBody com.wray.hjzdm.dto.OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        if (dto.getGoodsId() == null) {
            return Result.error("商品ID不能为空");
        }
        historyService.deleteHistory(userId, dto.getGoodsId());
        return Result.success(true);
    }
}
