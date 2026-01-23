package com.wray.hjzdm.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.CompareGroupDTO;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.service.GoodsService;
import com.wray.hjzdm.service.UserBrowseHistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.alibaba.fastjson2.JSON;

import java.util.List;
import java.util.Set;
import java.util.Collections;

@RestController
@RequestMapping("/goods")
@Slf4j
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private UserBrowseHistoryService historyService;

    /* ================= 基础功能 ================= */

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Goods goods) {
        return Result.success(goodsService.add(goods));
    }

    @PostMapping("/addAndReturn")
    public Result<Goods> addAndReturn(@RequestBody Goods goods) {
        log.info("Received addAndReturn request: {}", JSON.toJSONString(goods));
        boolean ok = goodsService.add(goods);
        if (!ok) {
            return Result.error("新增失败");
        }
        return Result.success(goods);
    }

    /**
     * 新增商品并自动记录浏览历史 (Atomic operation for better UX)
     */
    @PostMapping("/addAndHistory")
    public Result<Boolean> addAndHistory(@RequestBody Goods goods) {
        log.info("Received addAndHistory request: {}", JSON.toJSONString(goods));
        
        // 1. Add or Get Goods
        boolean ok = goodsService.add(goods);
        if (!ok || goods.getGoodsId() == null) {
            log.error("addAndHistory failed: goodsService.add returned {}, goodsId={}", ok, goods.getGoodsId());
            return Result.error("商品保存失败");
        }
        
        // 2. Record History
        Long userId = BaseContext.getCurrentId();
        log.info("DEBUG: BaseContext.getCurrentId() = {}", userId);

        if (userId != null) {
            try {
                OperateDTO operateDto = new OperateDTO();
                operateDto.setUserId(userId);
                operateDto.setGoodsId(goods.getGoodsId());
                historyService.addHistory(operateDto);
                log.info("History recorded for user {} goods {}", userId, goods.getGoodsId());
            } catch (Exception e) {
                log.error("Failed to record history asynchronously", e);
                // Don't fail the request just because history failed
            }
        } else {
            log.warn("DEBUG: User ID is null, skipping history. Is the user logged in?");
        }
        
        return Result.success(true);
    }

    @PostMapping("/search")
    public Result<List<Goods>> search(@RequestBody QueryDTO queryDto) {
        return Result.success(goodsService.queryGoods(queryDto));
    }

    @GetMapping("/detail")
    public Result<Goods> detail(@RequestParam Long goodsId) {
        Long userId = BaseContext.getCurrentId();
        if (userId != null) {
            OperateDTO operateDto = new OperateDTO();
            operateDto.setUserId(userId);
            operateDto.setGoodsId(goodsId);
            historyService.addHistory(operateDto);
        }
        return Result.success(goodsService.queryGoodsDetail(goodsId));
    }

    @GetMapping("/searchByName")
    public Result<List<Goods>> searchByName(@RequestParam String query) {
        return Result.success(goodsService.queryGoodsByName(query));
    }

    @GetMapping("/likeUsers")
    public Result<Set<Long>> likeUsers(@RequestParam Long goodsId) {
        return Result.success(goodsService.queryGoodsLike(goodsId));
    }

    /* ================= 点赞 / 收藏 ================= */

    @PostMapping("/like")
    public Result<Boolean> like(@RequestBody OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        goodsService.like(dto);
        return Result.success(true);
    }

    @PostMapping("/dislike")
    public Result<Boolean> dislike(@RequestBody OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        goodsService.dislike(dto);
        return Result.success(true);
    }

    @PostMapping("/collect")
    public Result<Boolean> collect(@RequestBody OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        goodsService.collect(dto);
        return Result.success(true);
    }

    @PostMapping("/cancelCollect")
    public Result<Boolean> cancelCollect(@RequestBody OperateDTO dto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        dto.setUserId(userId);
        goodsService.cancelCollect(dto);
        return Result.success(true);
    }

    /* ================= 我的 ================= */

    @PostMapping("/myGoods")
    public Result<List<Goods>> myGoods(@RequestBody QueryDTO dto) {
        return Result.success(goodsService.queryMyGoods(dto));
    }

    @PostMapping("/myCollect")
    public Result<List<Goods>> myCollect(@RequestBody QueryDTO dto) {
        return Result.success(goodsService.queryMyCollect(dto));
    }

    @DeleteMapping("/delete")
    public Result<Boolean> delete(@RequestParam Long goodsId) {
        return Result.success(goodsService.delete(goodsId));
    }

    /* ================= 审核 ================= */

    @PostMapping("/audit/pass")
    public Result<Boolean> auditPass(@RequestParam Long goodsId) {
        return Result.success(goodsService.auditPass(goodsId));
    }

    @PostMapping("/audit/reject")
    public Result<Boolean> auditReject(@RequestParam Long goodsId) {
        return Result.success(goodsService.auditReject(goodsId));
    }

    /* ================= 分页查询 ================= */

    @PostMapping("/page")
    public Result<Page<Goods>> page(@RequestBody QueryDTO dto) {
        return Result.success(goodsService.queryByCondition(dto));
    }

    @PostMapping("/pageAll")
    public Result<Page<Goods>> pageAll(@RequestBody QueryDTO dto) {
        return Result.success(goodsService.queryAllGoods(dto));
    }

    /* ================= 🔥 比价核心接口 ================= */

    /**
     * 🔥 商品比价搜索（Rakuten + Yahoo）
     */
    @PostMapping("/compare")
    public Result<List<CompareGroupDTO>> compare(@RequestBody QueryDTO queryDto) {
        try {
            List<CompareGroupDTO> list = goodsService.compareGoods(queryDto);
            return Result.success(list);
        } catch (Exception e) {
            log.error("Compare search failed", e);
            return Result.success(Collections.emptyList());
        }
    }
}
