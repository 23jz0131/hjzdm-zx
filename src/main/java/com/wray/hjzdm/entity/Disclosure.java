package com.wray.hjzdm.entity;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

;

/**
 * <b>[disclosure]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-23 21:28:44
 */
@Entity
@Table(name = "DISCLOSURE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Disclosure implements Serializable {
    private static final long serialVersionUID = -34413042789873059L;

    /**
     * 爆料id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DISCLOSURE_ID")
    @TableId(value = "DISCLOSURE_ID", type = IdType.AUTO)
    private Long disclosureId;

    /**
     * 商品id
     */
    @Column(name = "GOODS_ID")
    private Long goodsId;
    /**
     * 作者id
     */
    @Column(name = "AUTHOR")
    private Long author;
    /**
     * 创建时间
     */
    @Column(name = "CREATE_TIME")
    private Date createTime;
    /**
     * 内容
     */
    @Column(name = "CONTENT")
    private String content;
    /**
     * 爆料价格
     */
    @Column(name = "DISCLOSURE_PRICE")
    private Double disclosurePrice;

    /**
     * 订单截图
     */
    @Column(name = "IMG_URL")
    private String imgUrl;

    /**
     * 标题/商品名
     */
    @Column(name = "TITLE")
    private String title;

    /**
     * 链接
     */
    @Column(name = "LINK")
    private String link;

    /**
     * 状态 0:审核中 1:通过 2:拒绝
     */
    @Column(name = "STATUS")
    private Integer status;

}



