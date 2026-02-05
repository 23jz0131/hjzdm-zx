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
 * ユーザー管理コントローラー
 * ユーザー関連のすべてのRESTful APIリクエストを処理
 * ログイン、登録、個人情報管理、閲覧履歴などの機能を含む
 */
@Api(tags = "用户接口")
@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    /** ユーザーサービスインターフェース */
    @Autowired
    private UserService userService;

    /** JWT設定プロパティ */
    @Autowired
    private JwtProperties jwtProperties;

    /** ユーザー閲覧履歴サービス */
    @Autowired
    private UserBrowseHistoryService userBrowseHistoryService;

    /**
     * ユーザー名またはメールアドレスログインインターフェース
     * ユーザー名と電話番号の2つのログイン方式をサポート
     * @param dto ログインデータ転送オブジェクト、ユーザー名/電話番号とパスワードを含む
     * @return Result ログイン結果を返し、ユーザー情報とJWTトークンを含む
     */
    @PostMapping("/login")
    @ApiOperation("用户名或邮箱登录")
    public Result<?> login(@RequestBody UserLoginDTO dto) {
        User user = userService.login(dto);

        // JWTトークンを生成
        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.USER_ID, user.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getUserSecretKey(),
                jwtProperties.getUserTtl(),
                claims);

        // 戻りオブジェクトを構築
        UserLoginVO loginVO = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();

        return Result.success(loginVO);
    }

    /**
     * ユーザー登録インターフェース
     * 新規ユーザー登録機能、ユーザー名の一意性とパスワード強度を検証
     * @param dto 登録データ転送オブジェクト、ユーザー名、パスワードなどの情報を含む
     * @return Result 登録結果を返し、新しく作成されたユーザー情報を含む
     */
    @PostMapping("/register")
    @ApiOperation("用户注册")
    public Result<?> register(@RequestBody UserRegisterDTO dto) {
        User user = userService.register(dto);
        return Result.success(user);
    }

    /**
     * 現在ログイン中のユーザー情報を取得するインターフェース
     * JWTトークンを解析して現在のユーザーの完全情報を取得
     * @param request HTTPリクエストオブジェクト、JWTコンテキストを取得するために使用
     * @return Result 現在のユーザー情報を返す
     */
    @PostMapping("/me")
    @ApiOperation("获取当前用户信息")
    public Result<?> getMe(HttpServletRequest request) {
        // BaseContextからユーザーIDを取得
        Long userId = BaseContext.getCurrentId();
        
        log.info("ユーザー情報取得リクエスト、ユーザーID: {}", userId);
        
        if (userId == null) {
            log.warn("ユーザーがログインしていないかJWT検証に失敗");
            return Result.error("未ログイン");
        }

        User user = userService.getUserProfile(userId);
        if (user == null) {
            log.warn("ユーザーが存在しない、ユーザーID: {}", userId);
            return Result.error("ユーザーが存在しない");
        }
        
        log.info("ユーザー情報の取得に成功、ユーザーID: {}, ユーザー名: {}", userId, user.getName());

        return Result.success(user);
    }

    /**
     * ユーザー個人プロファイル更新インターフェースを削除
     * 個人情報編集機能は削除済み
     */

    /**
     * ユーザー閲覧履歴クエリインターフェース
     * 現在のユーザーの商品閲覧記録をページ分割でクエリ
     * @param queryDto クエリパラメータオブジェクト、ページ分割情報を含む
     * @return Result 閲覧履歴商品リストを返す
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
     * ユーザー閲覧履歴取得インターフェース（GET方式）
     * RESTfulスタイルの閲覧履歴クエリインターフェースを提供
     * @param pageNum ページ番号、デフォルト第1ページ
     * @param pageSize 1ページのサイズ、デフォルト10件
     * @return Result 閲覧履歴商品リストを返す
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
     * 閲覧履歴記録追加インターフェース
     * ユーザーが商品を閲覧した行動を記録
     * @param operateDto 操作データ転送オブジェクト、商品IDなどの情報を含む
     * @return Result 操作結果
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
     * ユーザー閲覧履歴クリアインターフェース
     * 現在のユーザーのすべての閲覧履歴記録を削除
     * @return Result 操作結果
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
     * 特定商品の閲覧履歴削除インターフェース
     * 閲覧履歴から指定商品の記録を削除
     * @param goodsId 削除する商品ID
     * @return Result 操作結果
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