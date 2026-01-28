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
 * Category Attribute Definition
 * Defines available attributes for a specific category (e.g., "Screen Size" for "Monitors")
 */
@Entity
@Table(name = "`CATEGORY_ATTRIBUTE`")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryAttribute implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ATTR_ID")
    @TableId(value = "ATTR_ID", type = IdType.AUTO)
    private Long attrId;

    @Column(name = "CAT_ID")
    private Long catId;

    @Column(name = "ATTR_NAME")
    private String attrName;

    /**
     * Type of attribute: "text", "select", "number", etc.
     */
    @Column(name = "ATTR_TYPE")
    private String attrType;
}
