package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.Constants;
import com.wray.hjzdm.common.JwtUtil;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.config.JwtProperties;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.dto.LocalLoginDTO;
import com.wray.hjzdm.dto.UserLoginDTO;
import com.wray.hjzdm.dto.UserRegisterDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.entity.User;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.service.DisclosureService;
import com.wray.hjzdm.service.GoodsService;
import com.wray.hjzdm.service.UserService;
import com.wray.hjzdm.service.UserBrowseHistoryService;
import com.wray.hjzdm.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@Api(value = "用户登录相关接口", tags = {"用户登录相关接口"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private UserBrowseHistoryService historyService;

    @Autowired
    private DisclosureService disclosureService;

    /**
     * 本地手机号登录
     */
    @PostMapping("/localLogin")
    @ApiOperation("本地手机号登录")
    public Result<UserLoginVO> localLogin(@RequestBody LocalLoginDTO loginDTO) {

        // 业务：查或创建用户
        User user = userService.localLogin(loginDTO);

        // 生成 JWT token
        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.USER_ID, user.getId());

        String token = JwtUtil.createJWT(
                jwtProperties.getUserSecretKey(),
                jwtProperties.getUserTtl(),
                claims
        );

        UserLoginVO vo = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();

        goodsService.pullLikedGoods(user.getId());

        return Result.success(vo);
    }
    
    /**
     * 用户名或邮箱登录
     */
    @PostMapping("/login")
    @ApiOperation("用户名或邮箱登录")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO loginDTO) {
        try {
            // 业务：用户名或邮箱登录
            User user = userService.login(loginDTO);

            // 生成 JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put(Constants.USER_ID, user.getId());
            claims.put("username", user.getName()); // Add username to token

            String token = JwtUtil.createJWT(
                    jwtProperties.getUserSecretKey(),
                    jwtProperties.getUserTtl(),
                    claims
            );

            UserLoginVO vo = UserLoginVO.builder()
                    .id(user.getId())
                    .openid(user.getOpenid())
                    .token(token)
                    .build();

            goodsService.pullLikedGoods(user.getId());

            return Result.success(vo);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    @ApiOperation("用户注册")
    public Result<UserLoginVO> register(@RequestBody UserRegisterDTO registerDTO) {
        try {
            // 业务：创建新用户
            User user = userService.register(registerDTO);

            // 生成 JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put(Constants.USER_ID, user.getId());
            claims.put("username", user.getName()); // Add username to token

            String token = JwtUtil.createJWT(
                    jwtProperties.getUserSecretKey(),
                    jwtProperties.getUserTtl(),
                    claims
            );

            UserLoginVO vo = UserLoginVO.builder()
                    .id(user.getId())
                    .openid(user.getOpenid())
                    .token(token)
                    .build();

            goodsService.pullLikedGoods(user.getId());

            return Result.success(vo);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/addHistory")
    public Result addHistory(@RequestBody OperateDTO operateDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        operateDto.setUserId(userId);
        historyService.addHistory(operateDto);
        return Result.success("ok", null);
    }

    @PostMapping("/queryHistory")
    public Result<List<Goods>> queryHistory(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        queryDto.setUserId(userId);
        return Result.success(historyService.queryHistory(queryDto));
    }

    @PostMapping("/clearHistory")
    public Result clearHistory() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        historyService.clearHistory(userId);
        return Result.success("ok", null);
    }

    @PostMapping("/deleteHistory")
    public Result deleteHistory(@RequestBody OperateDTO operateDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        if (operateDto.getGoodsId() == null) {
            return Result.error("参数错误");
        }
        historyService.deleteHistory(userId, operateDto.getGoodsId());
        return Result.success("ok", null);
    }

    @PostMapping("/me")
    public Result<User> me() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        User user = userService.getById(userId);
        return Result.success(user);
    }

    @PostMapping("/metrics")
    public Result<Map<String, Integer>> metrics() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        QueryDTO dto = new QueryDTO();
        dto.setUserId(userId);
        dto.setPageNum(1);
        dto.setPageSize(1000);
        List<Goods> collects = goodsService.queryMyCollect(dto);
        List<Goods> history = historyService.queryHistory(dto);
        List<com.wray.hjzdm.entity.Disclosure> disclosures = disclosureService.queryMyDisclosure(dto);
        Map<String, Integer> m = new HashMap<>();
        m.put("collectCount", collects != null ? collects.size() : 0);
        m.put("historyCount", history != null ? history.size() : 0);
        m.put("disclosureCount", disclosures != null ? disclosures.size() : 0);
        return Result.success(m);
    }
}
