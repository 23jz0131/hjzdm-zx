package com.wray.hjzdm.entity;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * <b>[goods_collect]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-25 22:08:09
 */
@Entity
@Table(name = "GOODS_COLLECT")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GoodsCollect implements Serializable {
    private static final long serialVersionUID = -89232980217577980L;

    /**
     * 收藏id
     */
    @Id
    @Column(name = "ID")
    private Long id;

    /**
     * 商品id
     */
    @Column(name = "GOODS_ID")
    private Long goodsId;
    /**
     * 用户id
     */
    @Column(name = "USER_ID")
    private Long userId;
    /**
     * 更新时间
     */
    @Column(name = "UPDATE_TIME")
    private Date updateTime;

}



