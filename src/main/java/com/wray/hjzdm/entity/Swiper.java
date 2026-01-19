package com.wray.hjzdm.entity;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;

;

/**
 * <b>[swiper]数据持久化对象</b>
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用扩展函数方式进行处理。
 * </p>
 *
 * @author makejava
 * @date 2024-05-10 16:49:41
 */
@Entity
@Table(name = "SWIPER")
public class Swiper implements Serializable {
    private static final long serialVersionUID = -84495331533490758L;

    /**
     * 轮播图id
     */
    @Id
    @Column(name = "SWIPER_ID")
    @TableId(value = "SWIPER_ID", type = IdType.AUTO)
    private Long swiperId;

    /**
     * 轮播图路径
     */
    @Column(name = "IMG_URL")
    private String imgUrl;
    /**
     * 轮播图跳转路径
     */
    @Column(name = "LINK")
    private String link;
    /**
     * 状态 0 弃用 1 启用
     */
    @Column(name = "STATUS")
    private Integer status;

    public Long getSwiperId() {
        return swiperId;
    }

    public void setSwiperId(Long swiperId) {
        this.swiperId = swiperId;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
    @Override
    public String toString() {

        StringBuilder builder = new StringBuilder();
        builder.append("com.wray.hjzdm.entity.Swiper")
                .append(";swiperId=")
                .append(swiperId)
                .append(";imgUrl=")
                .append(imgUrl)
                .append(";link=")
                .append(link)
                .append(";status=")
                .append(status)
                .append("]");
        return builder.toString();
    }
}
