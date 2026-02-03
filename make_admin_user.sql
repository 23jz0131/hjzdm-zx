-- 将现有用户设置为管理员的SQL脚本
-- 请根据您的实际情况修改WHERE条件

-- 方案1: 查看现有用户列表
SELECT ID, NAME, PHONE, CREATE_TIME FROM USER;

-- 方案2: 将指定用户名的用户设置为管理员(ID=1)
-- 请将 'your_username' 替换为您想要设为管理员的用户名
UPDATE USER SET ID = 1 WHERE NAME = 'your_username';

-- 方案3: 将第一个注册的用户设为管理员
UPDATE USER SET ID = 1 WHERE ID = (SELECT MIN(ID) FROM USER);

-- 方案4: 如果知道具体用户ID，直接修改
-- UPDATE USER SET ID = 1 WHERE ID = 您的用户ID;

-- 验证修改结果
SELECT * FROM USER WHERE ID = 1;