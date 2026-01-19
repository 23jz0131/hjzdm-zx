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
import com.wray.hjzdm.entity.Disclosure;
import com.wray.hjzdm.mapper.CommentMapper;
import com.wray.hjzdm.service.CommentService;
import com.wray.hjzdm.service.DisclosureService;
@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Autowired
    private CommentConverter commentConverter;

    @Autowired
    private DisclosureService disclosureService;

    /**
     * 提交评论
     */
    @Override
    public boolean submitComment(Comment comment) {
        Long currentId = BaseContext.getCurrentId();
        if (currentId == null) {
            throw new BizException("未登录");
        }
        String content = comment.getContent();
        if (content != null && !content.isEmpty()) {
            comment.setContent(filterContent(content));
        }
        comment.setCreateTime(Date.from(java.time.Instant.now()));
        comment.setAuthor(currentId);
        this.baseMapper.insertComment(comment);
        return true;
    }

    @Override
    public List<CommentDTO> getCommentList(Long disclosureId) {
        Long currentId = BaseContext.getCurrentId();
        Disclosure disclosure = disclosureService.getDisclosure(disclosureId);
        Long publisherId = disclosure != null ? disclosure.getAuthor() : null;

        List<CommentDTO> comments = this.baseMapper.queryComment(disclosureId);
        comments.forEach(comment -> {
            Long authorId = comment.getAuthor();
            if (currentId != null && authorId != null && authorId.equals(currentId)) {
                comment.setOwner(true);
            }
            if (publisherId != null && authorId != null && authorId.equals(publisherId)) {
                comment.setPublisher(true);
            }
        });
        return comments;

    }
    @Override
    public void delComment(Long commentId) {
        Comment comment = this.getOne(new LambdaQueryWrapper<Comment>().eq(Comment::getId, commentId));
        Long currentId = BaseContext.getCurrentId();
        if (currentId == null) {
            throw new BizException("未登录");
        }
        if (comment != null && comment.getAuthor() != null && comment.getAuthor().equals(currentId)) {
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

    private String filterContent(String content) {
        String[] words = new String[] {
                "傻逼",
                "SB",
                "sb",
                "妈的",
                "操你",
                "fuck",
                "shit",
                "死ね"
        };
        String result = content;
        for (String w : words) {
            if (w == null || w.isEmpty()) {
                continue;
            }
            String replacement = buildMask(w.length());
            result = result.replace(w, replacement);
            String lowerWord = w.toLowerCase();
            String upperWord = w.toUpperCase();
            if (!w.equals(lowerWord)) {
                result = result.replace(lowerWord, replacement);
            }
            if (!w.equals(upperWord)) {
                result = result.replace(upperWord, replacement);
            }
        }
        return result;
    }

    private String buildMask(int len) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) {
            sb.append("*");
        }
        return sb.toString();
    }
}
