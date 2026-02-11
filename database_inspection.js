const mysql = require('mysql2');

// 数据库连接配置
const connection = mysql.createConnection({
    host: 'junction.proxy.rlwy.net',
    port: 3306,
    user: 'root',
    password: 'pBcCDdgEGAfCdAhcBgFaCEGEagEEDgBH',
    database: 'railway'
});

console.log('=== 数据库信息查询 ===\n');

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
    }
    console.log('✅ 数据库连接成功\n');
    
    // 1. 获取所有表名
    connection.query('SHOW TABLES', (error, tables) => {
        if (error) {
            console.error('查询表列表失败:', error);
            connection.end();
            return;
        }
        
        const tableNames = tables.map(row => Object.values(row)[0]);
        console.log('=== 数据库中的所有表 ===');
        tableNames.forEach((table, index) => {
            console.log(`${index + 1}. ${table}`);
        });
        console.log(`\n总共 ${tableNames.length} 个表\n`);
        
        // 2. 逐个查看表结构
        let completed = 0;
        tableNames.forEach(tableName => {
            console.log(`\n=== ${tableName} 表结构 ===`);
            
            // 获取表结构
            connection.query(`DESCRIBE ${tableName}`, (descError, columns) => {
                if (descError) {
                    console.error(`获取 ${tableName} 结构失败:`, descError);
                } else {
                    console.table(columns);
                }
                
                // 获取表记录数
                connection.query(`SELECT COUNT(*) as count FROM ${tableName}`, (countError, countResult) => {
                    if (countError) {
                        console.error(`统计 ${tableName} 记录数失败:`, countError);
                    } else {
                        console.log(`${tableName} 表记录数: ${countResult[0].count}`);
                    }
                    
                    completed++;
                    if (completed === tableNames.length) {
                        // 3. 查看USER表的详细数据示例
                        console.log('\n=== USER表数据示例 ===');
                        connection.query('SELECT * FROM USER LIMIT 5', (userError, userData) => {
                            if (userError) {
                                console.error('查询USER表数据失败:', userError);
                            } else {
                                if (userData.length > 0) {
                                    console.table(userData);
                                } else {
                                    console.log('USER表暂无数据');
                                }
                            }
                            connection.end();
                        });
                    }
                });
            });
        });
    });
});