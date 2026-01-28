package com.wray.hjzdm.entity;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

;

/**
 * <b>[goods]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-18 21:20:43
 */
@Entity
@Table(name = "`GOODS`")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Goods implements Serializable {
    private static final long serialVersionUID = -36905264842288481L;

    /**
     * 商品id
     */
    @Id
    @Column(name = "GOODS_ID")
    @TableId(value = "goods_id", type = IdType.AUTO)
    private Long goodsId;

    /**
     * 商品名称
     */
    @Column(name = "GOODS_NAME")
    private String goodsName;
    /**
     * 数量
     */
    @Column(name = "GOODS_NUMBER")
    private Integer goodsNumber;
    /**
     * 价格
     */
    @Column(name = "GOODS_PRICE")
    private Double goodsPrice;
    /**
     * 创建时间
     */
    @Column(name = "CREATE_TIME")
    private Date createTime;
    /**
     * 最后更新时间
     */
    @Column(name = "UPDATE_TIME")
    private Date updateTime;
    /**
     * 分类id
     */
    @Column(name = "CAT_ID")
    @TableField("CAT_ID")
    private Long catId;
    /**
     * 作者id
     */
    @Column(name = "`AUTHOR`")
    @TableField("`AUTHOR`")
    private Long author;
    /**
     * 商城分类: 1.京东 2.淘宝 3.拼多多
     */
    @Column(name = "MALL_TYPE")
    @TableField(value = "MALL_TYPE", insertStrategy = FieldStrategy.NOT_NULL)
    private Integer mallType;
    /**
     * 品牌
     */
    @Column(name = "BRAND")
    @TableField("BRAND")
    private String brand;

    /**
     * 商品跳转链接
     */
    @Column(name = "GOODS_LINK", length = 2048)
    private String goodsLink;

    /**
     * 商品示例图链接
     */
    @Column(name = "IMG_URL", length = 2048)
    private String imgUrl;

    /**
     * 商品状态
     */
    @Column(name = "STATUS")
    private Integer status;

    /**
     * 商品轮播图链接
     */
    @Transient
    @TableField(exist = false)
    private List<String> picsUrl;

    /**
     * 是否点赞
     */
    @TableField(exist = false)
    private boolean isLike;

    /**
     * 是否收藏
     */
    @TableField(exist = false)
    private boolean isCollect;

    /**
     * 点赞数
     */
    @TableField(exist = false)
    private Long likeCount = 0L;

    /**
     * 收藏数量
     */
    @TableField(exist = false)
    private Long collectCount = 0L;

}



