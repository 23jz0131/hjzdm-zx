const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'junction.proxy.rlwy.net',
    port: 3306,
    user: 'root',
    password: 'pBcCDdgEGAfCdAhcBgFaCEGEagEEDgBH',
    database: 'railway'
});

console.log('=== 检查USER表结构 ===\n');

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    
    connection.query('DESCRIBE USER', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
        } else {
            console.log('USER表当前字段:');
            results.forEach(row => {
                console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            // 检查是否需要删除PHONE字段
            const hasPhone = results.some(row => row.Field === 'PHONE');
            console.log(`\n是否存在PHONE字段: ${hasPhone ? '是' : '否'}`);
            
            if (hasPhone) {
                console.log('\n建议执行的SQL:');
                console.log('ALTER TABLE USER DROP COLUMN PHONE;');
            }
        }
        
        connection.end();
    });
});