package com.wray.hjzdm.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Goods Attribute Value
 * Stores the specific value of an attribute for a specific good
 */
@Entity
@Table(name = "GOODS_ATTRIBUTE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GoodsAttribute implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "ID", type = IdType.AUTO)
    private Long id;

    @Column(name = "GOODS_ID")
    private Long goodsId;

    @Column(name = "ATTR_ID")
    private Long attrId;

    @Column(name = "ATTR_VALUE")
    private String attrValue;
}
