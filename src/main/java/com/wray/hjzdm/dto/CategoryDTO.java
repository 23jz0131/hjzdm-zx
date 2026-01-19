package com.wray.hjzdm.dto;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDTO {

    /** 分类id */
    private Long catId;

    /**
     * 分类名称
     */
    private String catName;
    /**
     * 分类父id
     */
    private Long catPid;
    /**
     * 分类图标地址
     */
    private String catIcon;
    /**
     * 分类等级
     */
    private Integer catLevel;

    private List<CategoryDTO> children;
}
