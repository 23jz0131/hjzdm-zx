package com.wray.hjzdm.controller;
// 导入必要的Java工具类
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 导入Spring框架相关注解
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// 导入项目自定义类
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Disclosure;
import com.wray.hjzdm.service.DisclosureService;
import com.wray.hjzdm.common.BaseContext;

// 导入Swagger API文档注解
import io.swagger.annotations.Api;

/**
 * 披露内容控制器
 * 处理所有与披露内容相关的HTTP请求
 * 包括披露的增删改查、点赞、收藏等社交功能
 */
@RestController
@RequestMapping("/disclosure")
@Api(value = "爆料相关接口", tags = {"爆料相关接口"})
public class DisclosureController {

    // 定义管理员权限错误消息常量
    private static final String ADMIN_ONLY_MSG = "无权限";

    // 自动注入披露服务层
    @Autowired
    private DisclosureService disclosureService;

    /**
     * 根据ID查询单个披露内容
     * @param queryDto 查询参数对象，包含disclosureId
     * @return Result 包含披露内容的响应结果
     */
    @PostMapping("/getDisclosure")
    public Result getDisclosure(@RequestBody QueryDTO queryDto) {
        // 调用服务层获取披露内容
        Disclosure disclosure = disclosureService.getDisclosure(queryDto.getDisclosureId());
        
        // 检查披露内容是否存在
        if (disclosure == null) {
            return Result.error("爆料不存在");
        }
        
        // 返回成功结果
        return Result.success(disclosure);
    }

    /**
     * 根据商品ID查询相关披露内容
     * @param queryDto 查询参数对象，包含goodsId
     * @return Result 包含披露内容列表的响应结果
     */
    @PostMapping("/queryDisclosure")
    public Result queryDisclosure(@RequestBody QueryDTO queryDto) {
        // 调用服务层查询披露内容
        List<Disclosure> disclosureList = disclosureService.queryDisclosure(queryDto.getGoodsId());
        
        // 返回成功结果
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

    /**
     * 查询待审核的披露内容列表（管理员功能）
     * @param queryDto 查询参数对象
     * @return Result 包含待审核披露内容列表的响应结果
     */
    @PostMapping("/queryPendingList")
    public Result queryPendingDisclosure(@RequestBody QueryDTO queryDto) {
        // 调用服务层查询待审核披露内容
        List<Disclosure> disclosureList = disclosureService.queryPendingDisclosure(queryDto);
        
        // 返回成功结果
        return Result.success(disclosureList);
    }

    /**
     * 查询公开的披露内容列表（供用户浏览）
     * @param queryDto 查询参数对象，包含分页信息
     * @return Result 包含公开披露内容列表的响应结果
     */
    @PostMapping("/queryPublicList")
    public Result queryPublicDisclosure(@RequestBody QueryDTO queryDto) {
        // 调用服务层查询公开披露内容
        List<Disclosure> disclosureList = disclosureService.queryPublicDisclosure(queryDto);
        
        // 返回成功结果
        return Result.success(disclosureList);
    }

    /**
     * GET方法 - 查询待审核的披露内容列表（管理员功能）
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return Result 包含待审核披露内容列表的响应结果
     */
    @GetMapping("/pending")
    public Result getPendingDisclosure(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "200") int pageSize) {
        QueryDTO queryDto = new QueryDTO();
        queryDto.setPageNum(pageNum);
        queryDto.setPageSize(pageSize);
        
        // 调用服务层查询待审核披露内容
        List<Disclosure> disclosureList = disclosureService.queryPendingDisclosure(queryDto);
        
        // 返回成功结果
        return Result.success(disclosureList);
    }

    /**
     * GET方法 - 查询公开的披露内容列表
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return Result 包含公开披露内容列表的响应结果
     */
    @GetMapping("/public")
    public Result getPublicDisclosure(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "200") int pageSize) {
        QueryDTO queryDto = new QueryDTO();
        queryDto.setPageNum(pageNum);
        queryDto.setPageSize(pageSize);
        
        // 调用服务层查询公开披露内容
        List<Disclosure> disclosureList = disclosureService.queryPublicDisclosure(queryDto);
        
        // 返回成功结果
        return Result.success(disclosureList);
    }

    /**
     * 点赞功能已删除
     * 原like接口方法已被移除
     */

    /**
     * 取消点赞功能已删除
     * 原unlike接口方法已被移除
     */

    /**
     * 收藏功能已删除
     * 原collect接口方法已被移除
     */

    /**
     * 取消收藏功能已删除
     * 原uncollect接口方法已被移除
     */

    /**
     * 查询我的收藏功能已删除
     * 原myCollect接口方法已被移除
     */
}
