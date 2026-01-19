package com.wray.hjzdm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

@Mapper
public interface GoodsMapper extends BaseMapper<Goods> {

    // 查询商品（已有）
    List<Goods> queryGoods(QueryDTO dto);

    // 商品审核：更新状态（⭐ 新增，Service 正在调用）
    int updateStatus(@Param("goodsId") Long goodsId,
                     @Param("status") Integer status);

    List<Goods> queryMyCollect(@Param("userId") Long userId);

    List<Goods> queryBrowseHistory(@Param("userId") Long userId);

    /**
     * Search goods with dynamic attribute filtering
     */
    Page<Goods> queryGoodsWithAttrs(Page<Goods> page, @Param("dto") QueryDTO dto);
}
