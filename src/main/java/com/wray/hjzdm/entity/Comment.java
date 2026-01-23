package com.wray.hjzdm.entity;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

;

/**
 * <b>[comment]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-05-01 23:36:14
 */
@Entity
@Table(name = "COMMENT")
@TableName("\"COMMENT\"")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Comment implements Serializable {
    private static final long serialVersionUID = 610143903411806343L;

    /**
     * 评论id
     */
    @Id
    @Column(name = "ID")
    @TableId(value = "ID", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 父级id
     */
    @Column(name = "parent_id")
    @com.baomidou.mybatisplus.annotation.TableField("parent_id")
    private Long parentId;
    /**
     * 爆料id
     */
    @Column(name = "DISCLOSURE_ID")
    private Long disclosureId;
    /**
     * 内容
     */
    @Column(name = "CONTENT")
    private String content;
    /**
     * 创建时间
     */
    @Column(name = "CREATE_TIME")
    private Date createTime;
    /**
     * 作者
     */
    @Column(name = "AUTHOR")
    private Long author;
    /**
     * 状态，1-展现，2-已删除
     */
    @Column(name = "STATUS")
    private Integer status;

}



