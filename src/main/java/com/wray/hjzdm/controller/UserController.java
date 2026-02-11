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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户管理控制器
 * 处理用户相关的所有RESTful API请求
 * 包括登录、注册、个人信息管理、浏览历史等功能
 */
@Api(tags = "用户接口")
@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    /** 用户服务接口 */
    @Autowired
    private UserService userService;

    /** JWT配置属性 */
    @Autowired
    private JwtProperties jwtProperties;

    /** 用户浏览历史服务 */
    @Autowired
    private UserBrowseHistoryService userBrowseHistoryService;

    /**
     * 用户名或邮箱登录接口
     * 支持用户名和手机号两种方式登录
     * @param dto 登录数据传输对象，包含用户名/手机号和密码
     * @return Result 返回登录结果，包含用户信息和JWT令牌
     */
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

    /**
     * 用户注册接口
     * 新用户注册功能，验证用户名唯一性和密码强度
     * @param dto 注册数据传输对象，包含用户名、密码等信息
     * @return Result 返回注册结果，包含新创建的用户信息
     */
    @PostMapping("/register")
    @ApiOperation("用户注册")
    public Result<?> register(@RequestBody UserRegisterDTO dto) {
        User user = userService.register(dto);
        return Result.success(user);
    }

    /**
     * 获取当前登录用户信息接口
     * 通过JWT令牌解析获取当前用户的完整信息
     * @param request HTTP请求对象，用于获取JWT上下文
     * @return Result 返回当前用户信息
     */
    @PostMapping("/me")
    @ApiOperation("获取当前用户信息")
    public Result<?> getMe(HttpServletRequest request) {
        // 从BaseContext获取用户ID
        Long userId = BaseContext.getCurrentId();
        
        log.info("获取用户信息请求，用户ID: {}", userId);
        
        if (userId == null) {
            log.warn("用户未登录或JWT验证失败");
            return Result.error("未登录");
        }

        User user = userService.getUserProfile(userId);
        if (user == null) {
            log.warn("用户不存在，用户ID: {}", userId);
            return Result.error("用户不存在");
        }
        
        log.info("成功获取用户信息，用户ID: {}, 用户名: {}", userId, user.getName());

        return Result.success(user);
    }

    /**
     * 移除更新用户个人资料接口
     * 个人信息编辑功能已被删除
     */

    /**
     * 查询用户浏览历史接口
     * 分页查询当前用户的商品浏览记录
     * @param queryDto 查询参数对象，包含分页信息
     * @return Result 返回浏览历史商品列表
     */
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

    /**
     * 获取用户浏览历史接口（GET方式）
     * 提供RESTful风格的浏览历史查询接口
     * @param pageNum 页码，默认第1页
     * @param pageSize 每页大小，默认10条
     * @return Result 返回浏览历史商品列表
     */
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

    /**
     * 添加浏览历史记录接口
     * 记录用户浏览商品的行为
     * @param operateDto 操作数据传输对象，包含商品ID等信息
     * @return Result 操作结果
     */
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

    /**
     * 清空用户浏览历史接口
     * 删除当前用户的所有浏览历史记录
     * @return Result 操作结果
     */
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

    /**
     * 删除特定商品的浏览历史接口
     * 从浏览历史中删除指定商品的记录
     * @param goodsId 要删除的商品ID
     * @return Result 操作结果
     */
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