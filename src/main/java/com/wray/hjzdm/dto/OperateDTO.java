package com.wray.hjzdm.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OperateDTO {

    /**
     * 操作类型:
     * 0-点赞
     * 1-取消点赞
     * 2-收藏
     * 3-取消收藏
     */
    private String operateType;

    /** 用户id */
    private Long userId;

    /** 商品id */
    private Long goodsId;

    /** 爆料id */
    private Long disclosureId;

    /** 评论id */
    private Long commentId;

}
