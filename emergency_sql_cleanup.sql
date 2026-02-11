-- 紧急数据库清理脚本
-- 直接删除问题字段

USE hjzdm;

-- 检查当前表结构
DESCRIBE user;

-- 删除问题字段（如果存在）
ALTER TABLE user DROP COLUMN IF EXISTS gender;
ALTER TABLE user DROP COLUMN IF EXISTS age;
ALTER TABLE user DROP COLUMN IF EXISTS birth_date;
ALTER TABLE user DROP COLUMN IF EXISTS phone;

-- 验证清理结果
DESCRIBE user;

-- 显示清理完成信息
SELECT '数据库清理完成!' as message;