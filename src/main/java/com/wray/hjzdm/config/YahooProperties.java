package com.wray.hjzdm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "yahoo")
public class YahooProperties {

    private String clientId;
    private String secret;
}
