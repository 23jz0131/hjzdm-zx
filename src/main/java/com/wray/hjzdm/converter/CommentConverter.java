package com.wray.hjzdm.converter;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import com.wray.hjzdm.dto.CommentDTO;
import com.wray.hjzdm.entity.Comment;

@Component
public class CommentConverter {

    public Comment dto2po(CommentDTO dto) {
        if (dto == null) {
            return null;
        }
        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setParentId(dto.getParentId());
        comment.setDisclosureId(dto.getDisclosureId());
        comment.setContent(dto.getContent());
        comment.setCreateTime(dto.getCreateTime());
        comment.setAuthor(dto.getAuthor());
        comment.setStatus(dto.getStatus());
        return comment;
    }

    public CommentDTO po2dto(Comment po) {
        if (po == null) {
            return null;
        }
        CommentDTO dto = new CommentDTO();
        dto.setId(po.getId());
        dto.setParentId(po.getParentId());
        dto.setDisclosureId(po.getDisclosureId());
        dto.setContent(po.getContent());
        dto.setCreateTime(po.getCreateTime());
        dto.setAuthor(po.getAuthor());
        dto.setStatus(po.getStatus());
        dto.setOwner(false);
        dto.setAvatarUrl(null);
        dto.setNickName(null);
        dto.setHasLike(false);
        dto.setPublisher(false);
        return dto;
    }

    public List<CommentDTO> po2dtoList(List<Comment> poList) {
        if (poList == null) {
            return null;
        }
        return poList.stream()
                .map(this::po2dto)
                .collect(Collectors.toList());
    }

    public List<Comment> dto2poList(List<CommentDTO> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream()
                .map(this::dto2po)
                .collect(Collectors.toList());
    }
}
