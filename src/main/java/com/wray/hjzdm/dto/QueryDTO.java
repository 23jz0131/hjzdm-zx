package com.wray.hjzdm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QueryDTO {

    private String query;

    private Long catId;

    private Long goodsId;

    private Long userId;

    private Long disclosureId;

    private Long commentId;

    private Integer status;

    private Integer mallType;   // ⭐ 必须新增，否则 GoodsServiceImpl 报错

    private java.util.List<Integer> mallTypes;

    private Double minPrice;

    private Double maxPrice;

    /**
     * Attribute filters: key = attrId, value = attrValue
     */
    private java.util.Map<Long, String> attrFilters;

    private int pageNum = 1;

    private int pageSize = 10;
}
