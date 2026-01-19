package com.wray.hjzdm.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Disclosure;
import com.wray.hjzdm.service.DisclosureService;
import com.wray.hjzdm.common.BaseContext;
import io.swagger.annotations.Api;
@RestController
@RequestMapping("/disclosure")
@Api(value = "爆料相关接口", tags = {"爆料相关接口"})
public class DisclosureController {

    private static final String ADMIN_ONLY_MSG = "无权限";

    @Autowired
    private DisclosureService disclosureService;

    /**
     * 查询单个爆料
     */
    @PostMapping("/getDisclosure")
    public Result getDisclosure(@RequestBody QueryDTO queryDto) {
        Disclosure disclosure = disclosureService.getDisclosure(queryDto.getDisclosureId());
        if (disclosure == null) {
            return Result.error("爆料不存在");
        }
        return Result.success(disclosure);
    }

    /**
     * 查询爆料
     */
    @PostMapping("/queryDisclosure")
    public Result queryDisclosure(@RequestBody QueryDTO queryDto) {
        List<Disclosure> disclosureList = disclosureService.queryDisclosure(queryDto.getGoodsId());
        return Result.success(disclosureList);
    }

    //查看我的爆料
    @PostMapping("/queryMyDisclosure")
    public Result queryMyDisclosure(@RequestBody QueryDTO queryDto) {
        List<Disclosure> disclosureList = disclosureService.queryMyDisclosure(queryDto);
        return Result.success(disclosureList);
    }

    /**
     * 新增爆料
     */
    @PostMapping("/add")
    public Result addDisclosure(@RequestBody Disclosure disclosure) {
        boolean result = disclosureService.addDisclosure(disclosure);
        if (!result) {
            return Result.error("新增爆料失败");
        }
        return Result.success("新增爆料成功");
    }

    /**
     * 删除爆料
     */
    @PostMapping("/delete")
    public Result deleteDisclosure(@RequestBody QueryDTO queryDto) {
        boolean result = disclosureService.delete(queryDto.getDisclosureId());
        if (!result) {
            return Result.error("删除爆料失败");
        }
        return Result.success("删除爆料成功");
    }

    /**
     * 审核爆料
     */
    @PostMapping("/audit")
    public Result auditDisclosure(@RequestBody Disclosure disclosure) {
        if (disclosure.getDisclosureId() == null || disclosure.getStatus() == null) {
            return Result.error("参数错误");
        }
        boolean result = disclosureService.auditDisclosure(disclosure.getDisclosureId(), disclosure.getStatus());
        if (!result) {
            return Result.error(ADMIN_ONLY_MSG);
        }
        return Result.success("审核成功");
    }

    @PostMapping("/queryPendingList")
    public Result queryPendingDisclosure(@RequestBody QueryDTO queryDto) {
        List<Disclosure> disclosureList = disclosureService.queryPendingDisclosure(queryDto);
        return Result.success(disclosureList);
    }

    /**
     * 查询公开爆料
     */
    @PostMapping("/queryPublicList")
    public Result queryPublicDisclosure(@RequestBody QueryDTO queryDto) {
        List<Disclosure> disclosureList = disclosureService.queryPublicDisclosure(queryDto);
        return Result.success(disclosureList);
    }

    @PostMapping("/like")
    public Result like(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        disclosureService.like(userId, queryDto.getDisclosureId());
        return Result.success("ok", null);
    }

    @PostMapping("/unlike")
    public Result unlike(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        disclosureService.unlike(userId, queryDto.getDisclosureId());
        return Result.success("ok", null);
    }

    @PostMapping("/collect")
    public Result collect(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        disclosureService.collect(userId, queryDto.getDisclosureId());
        return Result.success("ok", null);
    }

    @PostMapping("/uncollect")
    public Result uncollect(@RequestBody QueryDTO queryDto) {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            return Result.error("未登录");
        }
        disclosureService.uncollect(userId, queryDto.getDisclosureId());
        return Result.success("ok", null);
    }
}
