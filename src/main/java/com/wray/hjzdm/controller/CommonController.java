package com.wray.hjzdm.controller;

import com.wray.hjzdm.common.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/common")
@Api(value = "通用接口", tags = {"通用接口"})
@Slf4j
public class CommonController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.wray.hjzdm.service.CloudStorageService cloudStorageService;

    @PostMapping("/upload")
    @ApiOperation("文件上传")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件为空");
        }

        try {
            // 委托给 CloudStorageService 处理上传（支持 Cloudinary 或本地）
            String url = cloudStorageService.upload(file);
            return Result.success("上传成功", url);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
}
