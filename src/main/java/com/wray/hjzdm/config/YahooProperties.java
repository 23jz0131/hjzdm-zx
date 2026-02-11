package com.wray.hjzdm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "yahoo")
public class YahooProperties {
    private String clientId;
    private String secret;
}
