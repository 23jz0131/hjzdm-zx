package com.wray.hjzdm.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.CommentDTO;
import com.wray.hjzdm.dto.QueryDTO;
import com.wray.hjzdm.entity.Comment;
import com.wray.hjzdm.service.CommentService;
import io.swagger.annotations.Api;
@RestController
@RequestMapping("/comment")
@Api(value = "评论相关接口", tags = {"评论相关接口"})
public class CommentController {

    @Autowired
    private CommentService commentService;

    /**
     * 新增评论
     */
    @PostMapping("/addComment")
    public Result addComment(@RequestBody Comment comment) {
        commentService.submitComment(comment);
        return Result.success("评论成功", null);
    }

    /**
     * 删除评论
     */
    @PostMapping("/delComment")
    public Result delComment(@RequestBody QueryDTO queryDto) {
        commentService.delComment(queryDto.getCommentId());
        return Result.success("删除成功", null);
    }

    /**
     * 获得评论列表
     */
    @PostMapping("/queryComment")
    public Result queryComment(@RequestBody QueryDTO queryDto) {
        List<CommentDTO> disclosureList = commentService.getCommentList(queryDto.getDisclosureId());
        return Result.success(disclosureList);
    }
}
