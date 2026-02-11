-- 验证当前user表结构并进行必要调整
-- 根据实际截图的表结构进行检查

USE hjzdm;

-- 1. 首先查看当前user表的完整结构
DESCRIBE user;

-- 2. 查看当前表中的所有数据
SELECT * FROM user;

-- 3. 检查是否有任何可能引起冲突的字段
SHOW COLUMNS FROM user LIKE '%phone%' OR LIKE '%openid%';

-- 4. 如果存在多余的字段，删除它们
-- 根据您的截图，这些字段应该已经被移除了

-- 5. 验证表结构是否符合Java实体类
-- User实体类期望的字段：
-- ID, USERNAME, PASSWORD, NICKNAME, EMAIL, CREATE_TIME, UPDATE_TIME

-- 6. 如果需要调整字段类型或约束，可以在这里添加
-- 例如确保EMAIL字段允许NULL值（如果需要的话）
ALTER TABLE user MODIFY COLUMN EMAIL VARCHAR(255) NULL;

-- 7. 添加必要的索引（如果还没有的话）
SHOW INDEX FROM user WHERE Column_name = 'USERNAME';
-- 如果没有索引，可以添加：
-- CREATE UNIQUE INDEX idx_user_username ON user(USERNAME);

-- 8. 最终验证
SELECT 
    COUNT(*) as total_users,
    COUNT(EMAIL) as users_with_email,
    COUNT(NICKNAME) as users_with_nickname
FROM user;

-- 9. 显示最终的表结构确认
DESCRIBE user;