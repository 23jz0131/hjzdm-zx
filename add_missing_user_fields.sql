-- 检查并添加缺失的用户表字段
-- 根据User实体类添加数据库中缺少的字段

USE hjzdm;

-- 1. 首先检查当前USER表结构
DESCRIBE user;

-- 2. 添加缺失的字段（如果不存在）
-- 添加OPENID字段
ALTER TABLE user ADD COLUMN IF NOT EXISTS openid VARCHAR(255) NULL COMMENT '用户开放ID';

-- 添加PHONE字段  
ALTER TABLE user ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL COMMENT '手机号码';

-- 添加GENDER字段
ALTER TABLE user ADD COLUMN IF NOT EXISTS gender INT NULL COMMENT '用户性别(1-男,2-女,0-未设置)';

-- 添加AGE字段
ALTER TABLE user ADD COLUMN IF NOT EXISTS age INT NULL COMMENT '用户年龄';

-- 添加BIRTH_DATE字段
ALTER TABLE user ADD COLUMN IF NOT EXISTS birth_date DATE NULL COMMENT '用户生日';

-- 3. 验证添加结果
DESCRIBE user;

-- 4. 显示当前所有字段
SELECT 
    COLUMN_NAME as '字段名',
    COLUMN_TYPE as '类型',
    IS_NULLABLE as '可为空',
    COLUMN_DEFAULT as '默认值',
    COLUMN_COMMENT as '注释'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'hjzdm' AND TABLE_NAME = 'user'
ORDER BY ORDINAL_POSITION;

-- 5. 为现有用户设置默认值（可选）
-- UPDATE user SET gender = 0 WHERE gender IS NULL;
-- UPDATE user SET age = 0 WHERE age IS NULL;

SELECT '字段添加完成!' as message;