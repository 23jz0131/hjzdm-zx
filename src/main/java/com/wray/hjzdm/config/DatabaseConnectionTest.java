package com.wray.hjzdm.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;

@Component
@Slf4j
public class DatabaseConnectionTest implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseConnectionTest(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            
            // Test database connection
            String result = jdbcTemplate.queryForObject("SELECT 'TiDB Cloud Connection Successful!' as status", String.class);
            log.info("=== 数据库连接测试 ===");
            log.info("连接状态: {}", result);
            
            // Get database version info
            try {
                String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
                log.info("数据库版本: {}", version);
            } catch (Exception e) {
                log.warn("无法获取数据库版本: {}", e.getMessage());
            }
            
            // Test table access (if any exists)
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'fortune500'", Integer.class);
                log.info("数据库中的表数量: {}", count);
            } catch (Exception e) {
                log.warn("无法查询表信息: {}", e.getMessage());
            }
            
            log.info("=== 数据库连接测试完成 ===");
            
        } catch (Exception e) {
            log.error("数据库连接失败: {}", e.getMessage(), e);
            log.error("请检查数据库配置和网络连接");
        }
    }
}