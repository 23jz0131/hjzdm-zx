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
 * <b>[user]数据持久化对象</b>
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
     * 用户id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 微信用户唯一标识
     */
    @Column(name = "OPENID")
    private String openid;
    /**
     * 昵称
     */
    @Column(name = "NICKNAME")
    private String nickname;
    
    /**
     * 名称（账号名）
     */
    @Column(name = "NAME")
    private String name;
    /**
     * 电话
     */
    @Column(name = "PHONE")
    private String phone;

    @JsonIgnore
    @Column(name = "PASSWORD")
    private String password;
    
    // /**
    //  * 邮箱
    //  */
    // @Column(name = "EMAIL")
    // private String email;
    /**
     * 头像url
     */
    @Column(name = "AVATAR")
    private String avatar;
    /**
     * 注册时间
     */
    @Column(name = "create_time")
    private Date createTime;
    
    /**
     * 性别
     */
    @Column(name = "GENDER")
    private Integer gender;
    
    /**
     * 年龄
     */
    @Column(name = "AGE")
    private Integer age;
    
    /**
     * 生日
     */
    @Column(name = "BIRTH_DATE")
    private Date birthDate;

}

