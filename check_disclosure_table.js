const mysql = require('mysql2');

// 创建数据库连接 - 使用云端TiDB配置
const connection = mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2eXmMXiGeCt9iz7.root',
    password: '00KpH8EmSBk7A3ET',
    database: 'fortune500',
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('=== 检查投稿相关表结构 ===\n');

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message);
        console.log('\n💡 可能的解决方案:');
        console.log('1. 检查网络连接是否能访问TiDB Cloud');
        console.log('2. 确认数据库凭证是否正确');
        console.log('3. 检查防火墙设置');
        return;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查所有表
    connection.query('SHOW TABLES', (error, results) => {
        if (error) {
            console.error('查询表列表失败:', error);
        } else {
            console.log('📋 数据库中的所有表:');
            const tables = results.map(row => Object.values(row)[0]);
            tables.forEach(table => console.log(`  - ${table}`));
            
            // 检查关键表是否存在
            const requiredTables = ['DISCLOSURE', 'USER', 'COMMENT'];
            console.log('\n🔍 关键表检查:');
            requiredTables.forEach(table => {
                const exists = tables.includes(table);
                console.log(`  ${exists ? '✅' : '❌'} ${table}表: ${exists ? '存在' : '不存在'}`);
            });
        }
        
        // 2. 检查DISCLOSURE表结构
        console.log('\n📄 DISCLOSURE表结构检查:');
        connection.query('DESCRIBE DISCLOSURE', (descError, descResults) => {
            if (descError) {
                console.log('❌ DISCLOSURE表不存在或无法访问');
                console.log('错误信息:', descError.message);
                
                // 提供创建表的SQL
                console.log('\n🔧 建议执行的创建表SQL:');
                console.log(`
CREATE TABLE DISCLOSURE (
    DISCLOSURE_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    GOODS_ID BIGINT,
    AUTHOR BIGINT NOT NULL,
    CREATE_TIME TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONTENT TEXT,
    DISCLOSURE_PRICE DECIMAL(10,2),
    IMG_URL TEXT,
    TITLE VARCHAR(512),
    LINK VARCHAR(2048),
    STATUS INTEGER DEFAULT 0
);`);
            } else {
                console.log('✅ DISCLOSURE表存在，字段如下:');
                descResults.forEach(row => {
                    console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
                });
                
                // 3. 检查表中数据
                console.log('\n📊 DISCLOSURE表数据统计:');
                connection.query('SELECT COUNT(*) as total, STATUS, COUNT(STATUS) as count FROM DISCLOSURE GROUP BY STATUS', (countError, countResults) => {
                    if (countError) {
                        console.log('查询数据统计失败:', countError.message);
                    } else {
                        if (countResults.length === 0) {
                            console.log('  ⚠️  表中暂无数据');
                        } else {
                            console.log('  状态分布:');
                            countResults.forEach(row => {
                                const statusText = {0: '待审核', 1: '已公开', 2: '被拒绝'}[row.STATUS] || `未知状态(${row.STATUS})`;
                                console.log(`    ${statusText}: ${row.count} 条`);
                            });
                            const total = countResults.reduce((sum, row) => sum + row.count, 0);
                            console.log(`  总计: ${total} 条投稿`);
                        }
                    }
                    
                    // 4. 检查最近的几条数据
                    console.log('\n📋 最近的投稿数据:');
                    connection.query('SELECT DISCLOSURE_ID, TITLE, STATUS, CREATE_TIME FROM DISCLOSURE ORDER BY CREATE_TIME DESC LIMIT 5', (dataError, dataResults) => {
                        if (dataError) {
                            console.log('查询数据失败:', dataError.message);
                        } else {
                            if (dataResults.length === 0) {
                                console.log('  暂无投稿数据');
                            } else {
                                dataResults.forEach((row, index) => {
                                    const statusText = {0: '待审核', 1: '已公开', 2: '被拒绝'}[row.STATUS] || `未知(${row.STATUS})`;
                                    console.log(`  ${index + 1}. ID:${row.DISCLOSURE_ID} "${row.TITLE}" [${statusText}] ${row.CREATE_TIME}`);
                                });
                            }
                        }
                        
                        connection.end();
                    });
                });
            }
        });
    });
});