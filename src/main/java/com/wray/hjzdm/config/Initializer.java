package com.wray.hjzdm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Set;

@Slf4j
@Component
public class Initializer implements ApplicationListener<ContextRefreshedEvent> {

    @Resource
    private RedisTemplate redisTemplate;

    @Resource
    private javax.sql.DataSource dataSource;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        log.info("程序启动...bean已加载完成");
        clearCache();
        printTableInfo();
    }

    private void printTableInfo() {
        try (java.sql.Connection conn = dataSource.getConnection()) {
            java.sql.DatabaseMetaData meta = conn.getMetaData();
            
            // 检查并迁移 PARENTID -> parent_id
            checkAndRenameColumn(conn, meta, "COMMENT", "PARENTID", "parent_id");
            
            // 确保 DISCLOSURE 表的 IMG_URL 字段足够长 (支持多图)
            // 直接尝试修改列类型为 TEXT (H2/MySQL 通用)
            // 注意：某些数据库可能不支持直接这样写，但对于 H2 和 MySQL 应该没问题
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                     alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"IMG_URL\" VARCHAR(4096)";
                } else {
                     // MySQL
                     alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN IMG_URL TEXT";
                }
                log.info("Attempting to alter IMG_URL column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("IMG_URL column altered successfully.");
            } catch (Exception e) {
                // 忽略错误，可能是已经修改过或者语法不支持
                log.warn("Failed to alter IMG_URL column (might be already correct): {}", e.getMessage());
            }

            // 确保 DISCLOSURE 表的 TITLE 字段足够长
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                     alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"TITLE\" VARCHAR(512)";
                } else {
                     // MySQL
                     alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN TITLE VARCHAR(512)";
                }
                log.info("Attempting to alter TITLE column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("TITLE column altered successfully.");
            } catch (Exception e) {
                log.warn("Failed to alter TITLE column (might be already correct): {}", e.getMessage());
            }

            // 确保 DISCLOSURE 表的 LINK 字段足够长 (2048字符，适配大多数URL)
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                     alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"LINK\" VARCHAR(2048)";
                } else {
                     // MySQL
                     alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN LINK VARCHAR(2048)";
                }
                log.info("Attempting to alter LINK column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("LINK column altered successfully.");
            } catch (Exception e) {
                log.warn("Failed to alter LINK column: {}", e.getMessage());
            }

            // 确保 DISCLOSURE 表的 CONTENT 字段足够长 (TEXT类型，支持长文)
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                     alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"CONTENT\" VARCHAR(4096)";
                } else {
                     // MySQL
                     alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN CONTENT TEXT";
                }
                log.info("Attempting to alter CONTENT column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("CONTENT column altered successfully.");
            } catch (Exception e) {
                log.warn("Failed to alter CONTENT column: {}", e.getMessage());
            }

            java.sql.ResultSet rs = meta.getColumns(null, null, "COMMENT", null);
            log.info("========== Table COMMENT Columns (After Check) ==========");
            while (rs.next()) {
                log.info("Column: {}", rs.getString("COLUMN_NAME"));
            }
            log.info("=========================================");
        } catch (Exception e) {
            log.error("Failed to check/migrate table info", e);
        }
    }

    private void checkAndRenameColumn(java.sql.Connection conn, java.sql.DatabaseMetaData meta, String tableName, String oldCol, String newCol) throws java.sql.SQLException {
        boolean oldExists = false;
        boolean newExists = false;
        
        try (java.sql.ResultSet rs = meta.getColumns(null, null, tableName, null)) {
            while (rs.next()) {
                String colName = rs.getString("COLUMN_NAME");
                if (oldCol.equalsIgnoreCase(colName)) oldExists = true;
                if (newCol.equalsIgnoreCase(colName)) newExists = true;
            }
        }
        
        if (oldExists && !newExists) {
            log.info("Migrating column {} to {} in table {}...", oldCol, newCol, tableName);
            try (java.sql.Statement stmt = conn.createStatement()) {
                // H2 语法: ALTER TABLE tableName ALTER COLUMN oldName RENAME TO newName
                stmt.execute(String.format("ALTER TABLE \"%s\" ALTER COLUMN \"%s\" RENAME TO \"%s\"", tableName, oldCol, newCol));
                log.info("Migration successful.");
            }
        }
    }

    /**
     * 清除 Redis 缓存（Redis 不可用时不影响启动）
     */
    public void clearCache() {
        try {
            log.info("清除缓存...");
            Set<String> keys = redisTemplate.keys("*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
            log.info("缓存清理完成");
        } catch (Exception e) {
            // ⭐ 核心修复点：吞掉异常，不让程序退出
            log.warn("Redis 未连接或不可用，跳过缓存清理");
        }
    }
}
