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

    @PostMapping("/upload")
    @ApiOperation("文件上传")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件为空");
        }

        try {
            // 获取文件名
            String originalFilename = file.getOriginalFilename();
            String suffix = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                suffix = ".jpg"; // 默认后缀
            }
            String fileName = UUID.randomUUID().toString() + suffix;

            // 保存路径：当前项目下的 uploads 目录
            String basePath = System.getProperty("user.dir") + "/uploads/";
            File dir = new File(basePath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 保存文件
            file.transferTo(new File(dir, fileName));

            // 返回访问路径 (假设已配置 /uploads/** 映射)
            // 注意：这里返回相对路径，前端可能需要拼接 host，或者后端返回完整 URL
            // 这里返回相对路径，配合 HandlerConfig 的资源映射即可
            String url = "/uploads/" + fileName;
            return Result.success("上传成功", url);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败");
        }
    }
}
