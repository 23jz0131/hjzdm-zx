-- ==========================================
-- 完整数据库清理脚本
-- 解决PHONE和OPENID字段残留问题
-- 符合用户简化数据结构的偏好
-- ==========================================

USE railway;

-- 1. 检查当前USER表结构
DESCRIBE USER;

-- 2. 删除残留的PHONE字段（如果存在）
SET @drop_phone = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'railway' 
                   AND TABLE_NAME = 'USER' 
                   AND COLUMN_NAME = 'PHONE');

SET @sql_drop_phone = IF(@drop_phone > 0, 
    'ALTER TABLE USER DROP COLUMN PHONE', 
    'SELECT "PHONE字段不存在" as message');

PREPARE stmt FROM @sql_drop_phone;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 删除残留的OPENID字段（如果存在）
SET @drop_openid = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'railway' 
                    AND TABLE_NAME = 'USER' 
                    AND COLUMN_NAME = 'OPENID');

SET @sql_drop_openid = IF(@drop_openid > 0, 
    'ALTER TABLE USER DROP COLUMN OPENID', 
    'SELECT "OPENID字段不存在" as message');

PREPARE stmt FROM @sql_drop_openid;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 验证清理结果
DESCRIBE USER;

-- 5. 测试查询确保只包含必要字段
SELECT ID, NAME, NICKNAME FROM USER LIMIT 3;