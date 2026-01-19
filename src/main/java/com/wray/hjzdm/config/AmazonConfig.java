package com.wray.hjzdm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "amazon")
public class AmazonConfig {
    private String accessKey;
    private String secretKey;
    private String partnerTag;
    private String region;
}
