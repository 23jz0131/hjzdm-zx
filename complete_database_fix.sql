-- ==========================================
-- 数据库完整修复脚本
-- 用于添加缺失的nickname字段并初始化数据
-- ==========================================

USE railway;

-- 1. 添加nickname字段到USER表
ALTER TABLE USER ADD COLUMN NICKNAME VARCHAR(255) DEFAULT NULL COMMENT '用户昵称';

-- 2. 为现有用户设置默认昵称
UPDATE USER SET NICKNAME = CONCAT('用户', ID) WHERE NICKNAME IS NULL;

-- 3. 为特定用户设置有意义的昵称（根据您的偏好使用真实姓名）
UPDATE USER SET NICKNAME = '张辉' WHERE NAME = 'zhanghui';
UPDATE USER SET NICKNAME = '管理员' WHERE NAME = 'testuser3';
UPDATE USER SET NICKNAME = '测试用户' WHERE NAME = 'testuser';

-- 4. 验证修复结果
SELECT ID, NAME, NICKNAME, CREATE_TIME FROM USER ORDER BY ID;

-- 5. 检查表结构确认字段已添加
DESCRIBE USER;

-- ==========================================
-- 可选：创建索引优化查询性能
-- ==========================================
-- CREATE INDEX idx_user_nickname ON USER(NICKNAME);

-- ==========================================
-- 数据备份建议（执行前）
-- ==========================================
-- mysqldump -h junction.proxy.rlwy.net -u root -p railway USER > user_backup.sql