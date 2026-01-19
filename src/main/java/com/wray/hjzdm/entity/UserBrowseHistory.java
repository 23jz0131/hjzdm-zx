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
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "USER_BROWSE_HISTORY")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserBrowseHistory implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "ID", type = IdType.AUTO)
    private Long id;

    @Column(name = "GOODS_ID")
    private Long goodsId;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "BROWSE_TIME")
    private Date browseTime;
}
