package com.wray.hjzdm.entity;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

;

/**
 * <b>[category]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-15 14:52:54
 */
@Entity
@Table(name = "`CATEGORY`")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Category implements Serializable {
    private static final long serialVersionUID = -44388528954878500L;

    /**
     * 分类id
     */
    @Id
    @Column(name = "CAT_ID")
    @TableId(value = "CAT_ID", type = IdType.AUTO)
    private Long catId;

    /**
     * 分类名称
     */
    @Column(name = "CAT_NAME")
    private String catName;
    /**
     * 分类父id
     */
    @Column(name = "CAT_PID")
    private Long catPid;
    /**
     * 分类图标地址
     */
    @Column(name = "CAT_ICON")
    private String catIcon;
    /**
     * 分类等级
     */
    @Column(name = "CAT_LEVEL")
    private Integer catLevel;

}



