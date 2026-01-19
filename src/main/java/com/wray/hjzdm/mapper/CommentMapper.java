package com.wray.hjzdm.mapper;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wray.hjzdm.dto.CommentDTO;
import com.wray.hjzdm.entity.Comment;

;

/**
 * <b>CATEGORY [CategoryMapper]数据访问接口</b>
 *
 * <p>
 * 注意:此文件由框架自动生成-用户自定义可以使用Ext扩展函数方式进行处理
 * </p>
 *
 * @author makejava
 * @since 2024-04-15 14:52:54
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {

    /**
     * 提交评论
     */
    int insertComment(Comment comment);

    List<CommentDTO> queryComment(Long disclosureId);
}

