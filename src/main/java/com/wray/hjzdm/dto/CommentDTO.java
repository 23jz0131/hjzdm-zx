package com.wray.hjzdm.dto;

import java.io.Serializable;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO implements Serializable {
    private static final long serialVersionUID = 1340134495619369405L;
    /**
     * 评论id
     */
    private Long id;

    /**
     * 父级id
     */
    private Long parentId;

    /**
     * 爆料id
     */
    private Long disclosureId;
    /**
     * 内容
     */
    private String content;
    /**
     * 创建时间
     */
    private Date createTime;

    /** 是否创建者 */
    private Boolean owner = false;

    /** 头像url */
    private String avatarUrl;

    /** 昵称 */
    private String nickName;

    /** 是否喜欢 */
    private Boolean hasLike;

    /** 是否为投稿者评论 */
    private Boolean publisher = false;

    /**
     * 作者
     */
    private Long author;

    /**
     * 状态，1-展现，2-已删除
     */
    private Integer status;
}
