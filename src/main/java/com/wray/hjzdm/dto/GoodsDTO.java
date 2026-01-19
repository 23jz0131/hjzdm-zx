package com.wray.hjzdm.dto;

import lombok.Data;

@Data
public class GoodsDTO {

    /**
     * 本地商品才有，乐天商品为 null
     */
    private Long goodsId;

    /**
     * 商品名称
     */
    private String goodsName;

    /**
     * 商品价格
     */
    private Double goodsPrice;

    /**
     * 商品跳转链接（乐天 / 外链）
     */
    private String goodsLink;

    /**
     * 商品图片
     */
    private String imgUrl;

    /**
     * 平台类型
     * 10 = 乐天
     * 20 = Yahoo
     * 30 = Amazon / Keepa
     */
    private Integer mallType;
}
