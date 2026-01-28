package com.wray.hjzdm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;

import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Set;

@Slf4j
@Component
public class Initializer implements ApplicationListener<ContextRefreshedEvent> {

    @Resource
    private javax.sql.DataSource dataSource;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        log.info("程序启动...bean已加载完成");
        // clearCache(); // Redis removed
        printTableInfo();
        updateSchema(); // 添加数据库结构更新
    }

    private void clearCache() {
        // Redis removed
    }

    private void printTableInfo() {
        try (java.sql.Connection conn = dataSource.getConnection()) {
            java.sql.DatabaseMetaData meta = conn.getMetaData();

            // 检查并迁移 PARENTID -> parent_id
            checkAndRenameColumn(conn, meta, "COMMENT", "PARENTID", "parent_id");

            // 确保 DISCLOSURE 表的 IMG_URL 字段足够长 (支持多图)
            // 直接尝试修改列类型为 TEXT (H2/MySQL 通用)
            // 注意：某些数据库可能不支持直接这样写，但对于 H2 和 MySQL 应该没问题
            ensureDisclosureColumnTypes(conn, meta);
        } catch (Exception e) {
            log.error("Failed to check/migrate table info", e);
        }
    }

    private void updateSchema() {
        try (java.sql.Connection conn = dataSource.getConnection()) {
            java.sql.DatabaseMetaData meta = conn.getMetaData();
            String dbProductName = meta.getDatabaseProductName();
            log.info("Database Product: {}", dbProductName);

            // 检查并添加USER表的新字段
            ensureUserTableColumns(conn, meta, dbProductName);
        } catch (Exception e) {
            log.error("Failed to update schema", e);
        }
    }

    private void ensureUserTableColumns(java.sql.Connection conn, java.sql.DatabaseMetaData meta,
            String dbProductName) {
        try {
            // 检查USER表是否存在
            boolean tableExists = false;
            try (java.sql.ResultSet tables = meta.getTables(null, null, "USER", new String[] { "TABLE" })) {
                if (tables.next()) {
                    tableExists = true;
                }
            }

            if (!tableExists) {
                // 如果USER表不存在，创建它
                String createUserTableSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                    createUserTableSql = "CREATE TABLE \"USER\" (" +
                            "\"ID\" BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                            "\"OPENID\" VARCHAR(255), " +
                            "\"NAME\" VARCHAR(255), " +
                            "\"PHONE\" VARCHAR(20), " +
                            "\"PASSWORD\" VARCHAR(255), " +
                            "\"AVATAR\" VARCHAR(500), " +
                            "\"create_time\" TIMESTAMP, " +
                            "\"GENDER\" INTEGER, " +
                            "\"AGE\" INTEGER, " +
                            "\"BIRTH_DATE\" TIMESTAMP)";
                } else {
                    // MySQL
                    createUserTableSql = "CREATE TABLE USER (" +
                            "ID BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                            "OPENID VARCHAR(255), " +
                            "NAME VARCHAR(255), " +
                            "PHONE VARCHAR(20), " +
                            "PASSWORD VARCHAR(255), " +
                            "AVATAR VARCHAR(500), " +
                            "create_time TIMESTAMP, " +
                            "GENDER INT, " +
                            "AGE INT, " +
                            "BIRTH_DATE TIMESTAMP)";
                }

                try (java.sql.Statement stmt = conn.createStatement()) {
                    stmt.execute(createUserTableSql);
                    log.info("Created USER table");
                }
                return; // 表刚创建，字段已包含，直接返回
            }

            // 如果表已存在，则检查并添加缺失的字段
            ensureColumn(conn, dbProductName, "USER", "GENDER", "INTEGER", "INT");
            ensureColumn(conn, dbProductName, "USER", "AGE", "INTEGER", "INT");
            ensureColumn(conn, dbProductName, "USER", "BIRTH_DATE", "TIMESTAMP", "DATETIME");
        } catch (Exception e) {
            log.error("Failed to ensure USER table columns", e);
        }
    }

    private void ensureColumn(java.sql.Connection conn, String dbProductName, String tableName, String columnName,
            String h2Type, String mysqlType) throws java.sql.SQLException {
        // 检查列是否存在
        boolean columnExists = false;
        try (java.sql.ResultSet columns = conn.getMetaData().getColumns(null, null, tableName, columnName)) {
            if (columns.next()) {
                columnExists = true;
            }
        }

        if (!columnExists) {
            // 列不存在，添加它
            String alterSql;
            if ("H2".equalsIgnoreCase(dbProductName)) {
                alterSql = String.format("ALTER TABLE \"%s\" ADD COLUMN \"%s\" %s", tableName, columnName, h2Type);
            } else {
                // MySQL
                alterSql = String.format("ALTER TABLE %s ADD COLUMN %s %s", tableName, columnName, mysqlType);
            }

            try (java.sql.Statement stmt = conn.createStatement()) {
                log.info("Adding column {} to table {}: {}", columnName, tableName, alterSql);
                stmt.execute(alterSql);
                log.info("Successfully added column {}", columnName);
            }
        } else {
            log.info("Column {} already exists in table {}", columnName, tableName);
        }
    }

    private void ensureDisclosureColumnTypes(java.sql.Connection conn, java.sql.DatabaseMetaData meta) {
        try {
            // 确保 DISCLOSURE 表的 IMG_URL 字段足够长 (支持多图)
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                    alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"IMG_URL\" TEXT";
                } else {
                    // MySQL
                    alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN IMG_URL TEXT";
                }
                log.info("Attempting to alter IMG_URL column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("IMG_URL column altered successfully.");
            } catch (Exception e) {
                log.warn("Failed to alter IMG_URL column (might be already correct): {}", e.getMessage());
            }

            // 确保 DISCLOSURE 表的 TITLE 字段足够长 (512字符，适配标题长度)
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
                log.warn("Failed to alter LINK column (might be already correct): {}", e.getMessage());
            }

            // 确保 DISCLOSURE 表的 CONTENT 字段足够长 (支持较长内容)
            try (java.sql.Statement stmt = conn.createStatement()) {
                String dbProductName = meta.getDatabaseProductName();
                String alterSql;
                if ("H2".equalsIgnoreCase(dbProductName)) {
                    alterSql = "ALTER TABLE \"DISCLOSURE\" ALTER COLUMN \"CONTENT\" TEXT";
                } else {
                    // MySQL
                    alterSql = "ALTER TABLE DISCLOSURE MODIFY COLUMN CONTENT TEXT";
                }
                log.info("Attempting to alter CONTENT column type: {}", alterSql);
                stmt.execute(alterSql);
                log.info("CONTENT column altered successfully.");
            } catch (Exception e) {
                log.warn("Failed to alter CONTENT column (might be already correct): {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to ensure disclosure column types", e);
        }
    }

    private void checkAndRenameColumn(java.sql.Connection conn, java.sql.DatabaseMetaData meta, String tableName,
            String oldCol, String newCol) throws java.sql.SQLException {
        boolean oldExists = false;
        boolean newExists = false;

        try (java.sql.ResultSet rs = meta.getColumns(null, null, tableName, null)) {
            while (rs.next()) {
                String colName = rs.getString("COLUMN_NAME");
                if (oldCol.equalsIgnoreCase(colName))
                    oldExists = true;
                if (newCol.equalsIgnoreCase(colName))
                    newExists = true;
            }
        }

        if (oldExists && !newExists) {
            log.info("Migrating column {} to {} in table {}...", oldCol, newCol, tableName);
            try (java.sql.Statement stmt = conn.createStatement()) {
                // H2 语法: ALTER TABLE tableName ALTER COLUMN oldName RENAME TO newName
                stmt.execute(String.format("ALTER TABLE \"%s\" ALTER COLUMN \"%s\" RENAME TO \"%s\"", tableName, oldCol,
                        newCol));
                log.info("Migration successful.");
            }
        } else {
            log.info("Column migration check: old={} exists={}, new={} exists={}", oldCol, oldExists, newCol,
                    newExists);
        }

        // 输出表的所有列信息
        log.info("========== Table {} Columns (After Check) ==========", tableName);
        try (java.sql.ResultSet rs = meta.getColumns(null, null, tableName, null)) {
            while (rs.next()) {
                log.info("Column: {}", rs.getString("COLUMN_NAME"));
            }
        }
        log.info("=========================================");
    }
}