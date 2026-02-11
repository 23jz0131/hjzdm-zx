package com.wray.hjzdm.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.CompareGroupDTO;
import com.wray.hjzdm.dto.OperateDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;

import java.util.List;
import java.util.Set;

public interface GoodsService extends IService<Goods> {

    /* ========= 原有功能（不要动） ========= */

    boolean add(Goods goods);

    /**
     * 单平台搜索（当前：Rakuten）
     */
    List<Goods> queryGoods(QueryDTO queryDto);

    Goods queryGoodsDetail(Long goodsId);

    Set<Long> queryGoodsLike(Long goodsId);

    List<Goods> queryGoodsByName(String query);

    void like(OperateDTO operateDto);

    void dislike(OperateDTO operateDto);

    void collect(OperateDTO operateDto);

    void cancelCollect(OperateDTO operateDto);

    void pullLikedGoods(Long id);

    List<Goods> queryLikedGoods();

    List<Goods> queryMyGoods(QueryDTO queryDto);

    boolean delete(Long goodsId);

    List<Goods> queryMyCollect(QueryDTO queryDto);

    Page<Goods> queryByCondition(QueryDTO queryDto);

    Page<Goods> queryAllGoods(QueryDTO queryDto);

    boolean auditPass(Long goodsId);

    boolean auditReject(Long goodsId);


    /* ========= 🔥 比价核心功能 ========= */

    /**
     * 商品比价搜索
     * <p>
     * - 自动聚合同名商品
     * - 返回最低价
     * - 支持多平台（Rakuten / Yahoo / Amazon）
     */
    List<CompareGroupDTO> compareGoods(QueryDTO queryDto);

}
