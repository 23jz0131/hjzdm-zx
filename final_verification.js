const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hjzdm'
};

console.log('=== 最终修复验证 ===\n');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查USER表结构
    connection.query('DESCRIBE user', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
            connection.end();
            return;
        }
        
        console.log('=== USER表当前结构 ===');
        results.forEach(row => {
            console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 2. 检查是否还存在问题字段
        const problematicFields = ['gender', 'age', 'birth_date', 'phone', 'openid'];
        const existingProblematic = results.filter(row => 
            problematicFields.includes(row.Field.toLowerCase())
        );
        
        console.log('\n=== 问题字段检查 ===');
        if (existingProblematic.length > 0) {
            console.log('❌ 发现不应存在的字段:');
            existingProblematic.forEach(field => {
                console.log(`  - ${field.Field}: ${field.Type}`);
            });
        } else {
            console.log('✅ 没有发现不应存在的字段');
        }
        
        // 3. 检查应有的字段
        const requiredFields = ['id', 'name', 'password', 'nickname', 'avatar', 'create_time', 'update_time'];
        const missingRequired = requiredFields.filter(requiredField => 
            !results.some(row => row.Field.toLowerCase() === requiredField)
        );
        
        console.log('\n=== 必需字段检查 ===');
        if (missingRequired.length > 0) {
            console.log('❌ 缺少必需字段:', missingRequired.join(', '));
        } else {
            console.log('✅ 所有必需字段都存在');
        }
        
        // 4. 测试数据查询
        console.log('\n=== 测试数据查询 ===');
        connection.query('SELECT id, name, nickname FROM user LIMIT 3', (queryError, userData) => {
            if (queryError) {
                console.error('❌ 数据查询失败:', queryError.message);
            } else {
                console.log('✅ 数据查询成功');
                if (userData.length > 0) {
                    console.log('用户数据示例:');
                    userData.forEach(user => {
                        console.log(`  ID:${user.id} NAME:${user.name} NICKNAME:${user.nickname || '未设置'}`);
                    });
                } else {
                    console.log('  暂无用户数据');
                }
            }
            
            connection.end();
            console.log('\n🎉 验证完成！');
        });
    });
});