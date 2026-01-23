package com.wray.hjzdm.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CloudStorageService {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Value("${file.upload-path}")
    private String localUploadPath;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            try {
                // Cloudinary URL format: cloudinary://api_key:api_secret@cloud_name
                cloudinary = new Cloudinary(cloudinaryUrl);
                log.info("Cloudinary service initialized successfully.");
            } catch (Exception e) {
                log.error("Failed to initialize Cloudinary", e);
            }
        } else {
            log.info("Cloudinary URL not configured. Using local storage.");
        }
    }

    public String upload(MultipartFile file) throws IOException {
        if (cloudinary != null) {
            return uploadToCloud(file);
        } else {
            return uploadToLocal(file);
        }
    }

    private String uploadToCloud(MultipartFile file) throws IOException {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto"
            ));
            String url = (String) uploadResult.get("secure_url");
            log.info("File uploaded to Cloudinary: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new IOException("Cloud upload failed", e);
        }
    }

    private String uploadToLocal(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String suffix = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            suffix = ".jpg";
        }
        String fileName = UUID.randomUUID().toString() + suffix;

        // 如果 localUploadPath 是相对路径（如 ./uploads/），需要转换为绝对路径
        File dir;
        if (localUploadPath.startsWith("./") || localUploadPath.startsWith("../")) {
            dir = new File(System.getProperty("user.dir"), localUploadPath);
        } else {
            dir = new File(localUploadPath);
        }
        
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 使用 getCanonicalPath 防止路径遍历，并确保是绝对路径
        File dest = new File(dir, fileName);
        log.info("Saving file to local path: {}", dest.getAbsolutePath());
        
        file.transferTo(dest);
        
        return "/uploads/" + fileName; 
    }
}
