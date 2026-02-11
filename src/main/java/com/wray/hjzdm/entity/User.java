package com.wray.hjzdm.entity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户实体类
 * 映射数据库中的USER表，表示系统用户的基本信息
 * 包含用户的身份信息、联系方式、个人资料等字段
 * 
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-04-04 21:59:27
 */
@Entity
@Table(name = "USER")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User implements Serializable {
    private static final long serialVersionUID = 979107219508044875L;

    /**
     * 用户唯一标识符
     * 主键，自增策略
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;


    /**
     * 用户昵称
     * 用户自定义的显示名称，用于界面展示
     */
    @Column(name = "NICKNAME")
    private String nickname;
    
    /**
     * 用户开放ID
     * 第三方平台用户的唯一标识符
     */
    @Column(name = "OPENID")
    private String openid;
    
    /**
     * 用户手机号
     * 用户的联系电话号码
     */
    @Column(name = "PHONE")
    private String phone;
    
    /**
     * 用户名称（账号名）
     * 用户登录时使用的用户名，具有唯一性
     */
    @Column(name = "NAME")
    private String name;

    /**
     * 用户密码
     * 使用BCrypt加密存储，@JsonIgnore防止序列化到前端
     */
    @JsonIgnore
    @Column(name = "PASSWORD")
    private String password;
    
    // /**
    //  * 邮箱
    //  */
    // @Column(name = "EMAIL")
    // private String email;
    /**
     * 用户头像URL
     * 存储用户上传的头像图片地址
     */
    @Column(name = "AVATAR")
    private String avatar;
    /**
     * 用户注册时间
     * 记录用户账户创建的时间戳
     */
    @Column(name = "create_time")
    private Date createTime;
    
    /**
     * 信息更新时间
     * 记录用户资料最后一次修改的时间
     */
    @Column(name = "UPDATE_TIME")
    private Date updateTime;

}


