package com.wray.hjzdm.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "`NOTIFICATION`")
@TableName("NOTIFICATION")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "ID", type = IdType.AUTO)
    private Long id;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "CONTENT")
    private String content;

    // 0: 未读, 1: 已读
    @Column(name = "IS_READ")
    private Integer isRead;

    @Column(name = "CREATE_TIME")
    private Date createTime;
}
