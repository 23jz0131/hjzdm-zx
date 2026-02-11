const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hjzdm'
});

console.log('=== 检查USER表结构 ===\n');

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    
    // 查询表结构
    connection.query('DESCRIBE user', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
        } else {
            console.log('USER表当前字段:');
            results.forEach(row => {
                console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            // 检查缺失的字段
            const currentFields = results.map(row => row.Field.toUpperCase());
            const entityFields = ['ID', 'NICKNAME', 'NAME', 'PASSWORD', 'AVATAR', 'CREATE_TIME', 'UPDATE_TIME'];
            
            console.log('\n=== 字段对比分析 ===');
            entityFields.forEach(field => {
                if (!currentFields.includes(field)) {
                    console.log(`❌ 缺少字段: ${field}`);
                } else {
                    console.log(`✅ 存在字段: ${field}`);
                }
            });
            
            // 检查多余的字段
            const extraFields = currentFields.filter(field => !entityFields.includes(field) && field !== 'OPENID');
            if (extraFields.length > 0) {
                console.log('\n⚠️  多余字段（可能需要删除）:');
                extraFields.forEach(field => console.log(`  ${field}`));
            }
        }
        
        connection.end();
    });
});