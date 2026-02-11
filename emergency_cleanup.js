const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hjzdm'
};

console.log('=== 紧急数据库清理 ===\n');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 首先检查当前表结构
    connection.query('DESCRIBE user', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
            connection.end();
            return;
        }
        
        console.log('=== 当前USER表结构 ===');
        results.forEach(row => {
            console.log(`  ${row.Field}: ${row.Type}`);
        });
        
        // 2. 识别需要删除的问题字段
        const problematicFields = results.filter(row => 
            ['gender', 'age', 'birth_date', 'phone'].includes(row.Field.toLowerCase())
        );
        
        if (problematicFields.length > 0) {
            console.log('\n=== 发现需要删除的字段 ===');
            problematicFields.forEach(field => {
                console.log(`  - ${field.Field}: ${field.Type}`);
            });
            
            // 3. 删除问题字段
            console.log('\n=== 执行字段删除 ===');
            let deleteCount = 0;
            
            const deleteNextField = () => {
                if (deleteCount < problematicFields.length) {
                    const field = problematicFields[deleteCount];
                    const dropSql = `ALTER TABLE user DROP COLUMN ${field.Field}`;
                    
                    console.log(`删除字段: ${field.Field}`);
                    connection.query(dropSql, (dropError) => {
                        if (dropError) {
                            console.error(`❌ 删除 ${field.Field} 失败:`, dropError.message);
                        } else {
                            console.log(`✅ 成功删除 ${field.Field}`);
                        }
                        deleteCount++;
                        deleteNextField();
                    });
                } else {
                    // 所有字段删除完成，重新检查表结构
                    console.log('\n=== 清理完成，重新检查表结构 ===');
                    connection.query('DESCRIBE user', (finalError, finalResults) => {
                        if (!finalError) {
                            console.log('清理后的USER表结构:');
                            finalResults.forEach(row => {
                                console.log(`  ${row.Field}: ${row.Type}`);
                            });
                        }
                        connection.end();
                        console.log('\n🎉 数据库清理完成！');
                    });
                }
            };
            
            deleteNextField();
        } else {
            console.log('\n✅ 数据库表结构正常，无需清理');
            connection.end();
        }
    });
});