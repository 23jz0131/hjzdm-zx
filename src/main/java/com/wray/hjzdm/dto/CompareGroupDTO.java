package com.wray.hjzdm.dto;

import com.wray.hjzdm.entity.Goods;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 🔥 商品比价聚合 DTO
 * 一个 CompareGroupDTO = 一个“同名商品”的比价结果
 */
@Data
public class CompareGroupDTO {

    /**
     * 统一后的商品名称
     */
    private String goodsName;

    /**
     * 所有平台的商品列表（Rakuten / Yahoo）
     */
    private List<Goods> goodsList = new ArrayList<>();

    /**
     * 最低价
     */
    private Double lowestPrice;

    /**
     * 最低价平台（Rakuten / Yahoo）
     */
    private String lowestPlatform;
}
