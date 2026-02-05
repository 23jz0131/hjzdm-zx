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
 * ユーザーエンティティクラス
 * データベースのUSERテーブルをマッピングし、システムユーザーの基本情報を表す
 * ユーザーの身分情報、連絡先、個人プロファイルなどのフィールドを含む
 * 
 * <p>
 * 注意:このファイルはフレームワークによって自動生成されます-ユーザー定義は拡張関数方式で処理できます。
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
     * ユーザーの一意の識別子
     * 主キー、自動増分戦略
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * WeChatユーザーの一意の識別子
     * WeChat認証ログイン時にユーザー身元を識別するために使用
     */
    @Column(name = "OPENID")
    private String openid;
    /**
     * ユーザーのニックネーム
     * ユーザーがカスタムした表示名、インターフェース表示に使用
     */
    @Column(name = "NICKNAME")
    private String nickname;
    
    /**
     * ユーザー名（アカウント名）
     * ユーザーログイン時に使用するユーザー名、一意性を持つ
     */
    @Column(name = "NAME")
    private String name;
    /**
     * 電話番号
     * 電話番号ログインとユーザー連絡に使用
     */
    @Column(name = "PHONE")
    private String phone;

    /**
     * ユーザーパスワード
     * BCryptで暗号化して保存、@JsonIgnoreでフロントエンドへのシリアライズを防止
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
     * ユーザーアバターURL
     * ユーザーがアップロードしたアバター画像アドレスを保存
     */
    @Column(name = "AVATAR")
    private String avatar;
    /**
     * ユーザー登録時間
     * ユーザーアカウント作成のタイムスタンプを記録
     */
    @Column(name = "create_time")
    private Date createTime;
    
    /**
     * ユーザーの性別
     * 1-男性、2-女性、0-未設定
     */
    @Column(name = "GENDER")
    private Integer gender;
    
    /**
     * ユーザーの年齢
     * 誕生日から自動計算された実際の年齢
     */
    @Column(name = "AGE")
    private Integer age;
    
    /**
     * ユーザーの誕生日
     * 年齢計算と個人化サービスに使用
     */
    @Column(name = "BIRTH_DATE")
    private Date birthDate;
    
    /**
     * 情報更新時間
     * ユーザープロファイルの最終更新時間を記録
     */
    @Column(name = "UPDATE_TIME")
    private Date updateTime;

}


