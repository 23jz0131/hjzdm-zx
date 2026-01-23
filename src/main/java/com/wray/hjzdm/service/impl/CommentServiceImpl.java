package com.wray.hjzdm.service.impl;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
        log.info("Submitting comment: disclosureId={}, parentId={}, content={}", 
                comment.getDisclosureId(), comment.getParentId(), comment.getContent());
        
        String content = comment.getContent();
        if (content != null && !content.isEmpty()) {
            comment.setContent(filterContent(content));
        }
        comment.setCreateTime(Date.from(java.time.Instant.now()));
        comment.setAuthor(currentId);
        comment.setStatus(1);
        int rows = this.baseMapper.insertComment(comment);
        log.info("Insert result: rows={}, generatedId={}", rows, comment.getId());
        
        // Diagnostic verification
        if (comment.getId() != null) {
            Comment saved = this.baseMapper.selectById(comment.getId());
            log.info("Diagnostic - SelectById: {}", saved);
            
            List<CommentDTO> list = this.baseMapper.queryComment(comment.getDisclosureId());
            log.info("Diagnostic - QueryByDisclosureId size: {}", list != null ? list.size() : "null");
        }
        
        return rows > 0;
    }

    @Override
    public List<CommentDTO> getCommentList(Long disclosureId) {
        Long currentId = BaseContext.getCurrentId();
        Disclosure disclosure = disclosureService.getDisclosure(disclosureId);
        Long publisherId = disclosure != null ? disclosure.getAuthor() : null;

        List<CommentDTO> comments = this.baseMapper.queryComment(disclosureId);
        log.info("Found {} comments for disclosureId {}", comments != null ? comments.size() : 0, disclosureId);
        if (comments == null) {
            return new ArrayList<>();
        }
        
        log.info("Checking ownership - Current User ID: {}", currentId);
        
        comments.forEach(comment -> {
            Long authorId = comment.getAuthor();
            // log.info("Comment ID: {}, Author ID: {}, Current User ID: {}", comment.getId(), authorId, currentId);
            
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
        log.info("Attempting to delete commentId: {}", commentId);
        Long currentId = BaseContext.getCurrentId();
        log.info("Current userId: {}", currentId);

        if (currentId == null) {
            throw new BizException("未登录");
        }

        Comment comment = this.getById(commentId);
        log.info("Found comment: {}", comment);

        if (comment != null) {
            log.info("Comment author: {}, Current user: {}", comment.getAuthor(), currentId);
            if (currentId.equals(comment.getAuthor())) {
                // 删除主逻辑：删除该评论本身
                boolean updatedSelf = this.update(new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Comment>()
                        .set(Comment::getStatus, 2)
                        .eq(Comment::getId, commentId));
                log.info("Delete self result: {}", updatedSelf);

                // 级联删除子评论（如果是父评论的话）
                // 这里的逻辑是：如果该评论是某个回复的 parent，那么这些回复也要被删除
                // 注意：这里不需要检查 parent_id 是否为 null，因为即使是子评论，只要没有以它为 parent 的其他评论，这个 update 就只会影响 0 行，不会报错
                boolean updatedChildren = this.update(new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Comment>()
                        .set(Comment::getStatus, 2)
                        .eq(Comment::getParentId, commentId));
                log.info("Delete children result: {}", updatedChildren);
            } else {
                log.warn("Permission denied. Author: {}, User: {}", comment.getAuthor(), currentId);
                throw new BizException("无权删除");
            }
        } else {
            log.warn("Comment not found for id: {}", commentId);
            // 即使找不到也不报错，视为删除成功（幂等）
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
