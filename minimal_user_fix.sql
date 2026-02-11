-- ==========================================
-- 简化数据库修复脚本
-- 只添加必需的nickname字段，忽略openid
-- 符合用户偏好：真实姓名账户 + 简洁设计
-- ==========================================

USE railway;

-- 1. 检查当前USER表结构
DESCRIBE USER;

-- 2. 确保nickname字段存在
ALTER TABLE USER ADD COLUMN NICKNAME VARCHAR(255) DEFAULT NULL COMMENT '用户昵称';

-- 3. 为现有用户设置合适的昵称
UPDATE USER SET NICKNAME = CASE 
    WHEN NAME = 'zhanghui' THEN '张辉'
    WHEN NAME = 'testuser3' THEN '管理员'
    WHEN NAME = 'testuser' THEN '测试用户'
    ELSE CONCAT('用户', ID)
END WHERE NICKNAME IS NULL;

-- 4. 验证修复结果
SELECT 
    ID,
    NAME,
    NICKNAME,
    CREATE_TIME 
FROM USER 
ORDER BY ID;

-- 5. 检查最终表结构
DESCRIBE USER;