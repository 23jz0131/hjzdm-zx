package com.wray.hjzdm.service.impl;
import java.sql.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.common.BaseContext;
import com.wray.hjzdm.common.BizException;
import com.wray.hjzdm.converter.CommentConverter;
import com.wray.hjzdm.dto.CommentDTO;
import com.wray.hjzdm.entity.Comment;
import com.wray.hjzdm.mapper.CommentMapper;
import com.wray.hjzdm.service.CommentService;
@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Autowired
    private CommentConverter commentConverter;

    /**
     * 提交评论
     */
    @Override
    public boolean submitComment(Comment comment) {
        comment.setCreateTime(Date.from(java.time.Instant.now()));
        comment.setAuthor(BaseContext.getCurrentId());
        this.baseMapper.insertComment(comment);
        return true;
    }

    @Override
    public List<CommentDTO> getCommentList(Long disclosureId) {
        Long id = BaseContext.getCurrentId();

        List<CommentDTO> comments = this.baseMapper.queryComment(disclosureId);
        comments.forEach(comment -> {
            if (comment.getAuthor()
                    .equals(id)) {
                comment.setOwner(true);
            }
        });
        return comments;

    }
    @Override
    public void delComment(Long commentId) {
        Comment comment = this.getOne(new LambdaQueryWrapper<Comment>().eq(Comment::getId, commentId));
        if (comment.getAuthor()
                .equals(BaseContext.getCurrentId())) {
            this.update()
                    .set("status", 2)
                    .eq("id", commentId)
                    .or()
                    .eq("parent_id", commentId)
                    .update();
        } else {
            throw new BizException("无权删除");
        }
    }
}
