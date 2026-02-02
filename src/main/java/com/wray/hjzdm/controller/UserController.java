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
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.service.UserBrowseHistoryService;
import com.wray.hjzdm.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Api(tags = "用户接口")
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private UserBrowseHistoryService userBrowseHistoryService;

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
            @RequestBody Map<String, Object> profileData) {
        
        // 从BaseContext获取用户ID
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        // 从Map中提取参数
        String avatar = (String) profileData.get("avatar");
        String nickname = (String) profileData.get("nickname");
        String name = (String) profileData.get("name");
        Integer gender = (Integer) profileData.get("gender");
        String birthDateStr = (String) profileData.get("birthDate");
        
        Date parsedBirthDate = null;
        if (birthDateStr != null && !birthDateStr.isEmpty()) {
            try {
                // 前端传递的是YYYY-MM-DD格式的字符串
                // 验证日期格式
                if (!birthDateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                    return Result.error("生日日期格式错误，请使用YYYY-MM-DD格式");
                }
                
                parsedBirthDate = java.sql.Date.valueOf(birthDateStr);
                
                // 验证年份合理性（1900-2020）
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(parsedBirthDate);
                int year = cal.get(java.util.Calendar.YEAR);
                if (year < 1900 || year > 2020) {
                    return Result.error("年份必须在1900-2020之间");
                }
                
            } catch (IllegalArgumentException e) {
                return Result.error("生日日期格式错误，请使用YYYY-MM-DD格式: " + e.getMessage());
            }
        }

        User user = userService.updateUserProfile(userId, avatar, nickname, name, gender, parsedBirthDate);
        return Result.success(user);
    }

    @PostMapping("/queryHistory")
    @ApiOperation("查询浏览历史")
    public Result<List<Goods>> queryHistory(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        queryDto.setUserId(userId);
        List<Goods> history = userBrowseHistoryService.queryHistory(queryDto);
        return Result.success(history);
    }

    @GetMapping("/browse-history")
    @ApiOperation("获取浏览历史（GET方式）")
    public Result<List<Goods>> getBrowseHistory(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        QueryDTO queryDto = new QueryDTO();
        queryDto.setUserId(userId);
        queryDto.setPageNum(pageNum);
        queryDto.setPageSize(pageSize);
        
        List<Goods> history = userBrowseHistoryService.queryHistory(queryDto);
        return Result.success(history);
    }

    @PostMapping("/addHistory")
    @ApiOperation("添加浏览历史")
    public Result<Void> addHistory(@RequestBody OperateDTO operateDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        operateDto.setUserId(userId);
        userBrowseHistoryService.addHistory(operateDto);
        return Result.success(null);
    }

    @PostMapping("/clearHistory")
    @ApiOperation("清空浏览历史")
    public Result<Void> clearHistory() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        userBrowseHistoryService.clearHistory(userId);
        return Result.success(null);
    }

    @PostMapping("/deleteHistory")
    @ApiOperation("删除浏览历史")
    public Result<Void> deleteHistory(@RequestParam Long goodsId) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        
        userBrowseHistoryService.deleteHistory(userId, goodsId);
        return Result.success(null);
    }

}