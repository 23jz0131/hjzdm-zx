-- ==========================================
-- 完整数据库字段修复脚本
-- 解决openid和nickname字段缺失问题
-- ==========================================

USE railway;

-- 1. 检查当前USER表结构
DESCRIBE USER;

-- 2. 添加缺失的openid字段
ALTER TABLE USER ADD COLUMN OPENID VARCHAR(255) DEFAULT NULL COMMENT '微信用户唯一标识';

-- 3. 确保nickname字段存在（如果不存在则添加）
-- 注意：nickname字段应该已经在之前的修复中添加过了
ALTER TABLE USER ADD COLUMN NICKNAME VARCHAR(255) DEFAULT NULL COMMENT '用户昵称';

-- 4. 为现有用户设置默认值
UPDATE USER SET OPENID = CONCAT('openid_', ID) WHERE OPENID IS NULL;
UPDATE USER SET NICKNAME = CASE 
    WHEN NAME = 'zhanghui' THEN '张辉'
    WHEN NAME = 'testuser3' THEN '管理员'
    WHEN NAME = 'testuser' THEN '测试用户'
    ELSE CONCAT('用户', ID)
END WHERE NICKNAME IS NULL;

-- 5. 验证修复结果
SELECT 
    ID,
    NAME,
    OPENID,
    NICKNAME,
    CREATE_TIME 
FROM USER 
ORDER BY ID;

-- 6. 检查最终表结构
DESCRIBE USER;

-- ==========================================
-- 可选：创建必要的索引
-- ==========================================
-- CREATE INDEX idx_user_openid ON USER(OPENID);
-- CREATE INDEX idx_user_nickname ON USER(NICKNAME);