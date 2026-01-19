package com.wray.hjzdm.service;
import java.util.List;
import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.CommentDTO;
import com.wray.hjzdm.entity.Comment;
public interface CommentService extends IService<Comment> {

    boolean submitComment(Comment comment);

    List<CommentDTO> getCommentList(Long disclosureId);

    void delComment(Long commentId);
}
