-- 删除USER表中的PHONE字段
-- 符合用户偏好：简化注册流程，去除不必要的字段

USE railway;

-- 检查PHONE字段是否存在
DESCRIBE USER;

-- 删除PHONE字段
ALTER TABLE USER DROP COLUMN PHONE;

-- 验证删除结果
DESCRIBE USER;

-- 测试查询确保不影响现有功能
SELECT ID, NAME, NICKNAME FROM USER LIMIT 5;