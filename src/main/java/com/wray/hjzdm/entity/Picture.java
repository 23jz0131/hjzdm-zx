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
 * <b>[pictures]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-25 20:24:17
 */
@Entity
@Table(name = "PICTURE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Picture implements Serializable {
    private static final long serialVersionUID = -70992691959683415L;

    @Id
    @Column(name = "GOODS_ID")
    @TableId(value = "GOODS_ID", type = IdType.AUTO)
    private Long goodsId;

    @Column(name = "PICS_URL")
    private String picsUrl;

}



