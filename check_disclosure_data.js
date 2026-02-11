const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hjzdm'
};

console.log('=== 投稿数据状态检查 ===\n');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查投稿表结构
    connection.query('DESCRIBE disclosure', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
            connection.end();
            return;
        }
        
        console.log('=== DISCLOSURE表结构 ===');
        results.forEach(row => {
            console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 2. 检查投稿数据统计
        console.log('\n=== 投稿数据统计 ===');
        connection.query('SELECT status, COUNT(*) as count FROM disclosure GROUP BY status', (countError, countResults) => {
            if (!countError) {
                console.log('按状态分组统计:');
                countResults.forEach(row => {
                    const statusText = row.status === 0 ? '待审核' : row.status === 1 ? '已公开' : row.status === 2 ? '已拒绝' : `未知(${row.status})`;
                    console.log(`  ${statusText}: ${row.count} 条`);
                });
            }
            
            // 3. 查看具体投稿数据
            console.log('\n=== 最近的投稿数据 ===');
            connection.query('SELECT disclosure_id, title, status, author, create_time FROM disclosure ORDER BY create_time DESC LIMIT 10', (dataError, dataResults) => {
                if (!dataError && dataResults.length > 0) {
                    console.log('最近10条投稿:');
                    dataResults.forEach((row, index) => {
                        const statusText = row.status === 0 ? '待审核' : row.status === 1 ? '已公开' : row.status === 2 ? '已拒绝' : `未知(${row.status})`;
                        console.log(`  ${index + 1}. ID:${row.disclosure_id} 标题:"${row.title}" 状态:${statusText} 作者:${row.author} 时间:${row.create_time}`);
                    });
                } else {
                    console.log('暂无投稿数据');
                }
                
                // 4. 检查管理员账户
                console.log('\n=== 管理员账户检查 ===');
                connection.query('SELECT id, name, openid FROM user WHERE id = 1 OR name = "admin"', (adminError, adminResults) => {
                    if (!adminError) {
                        if (adminResults.length > 0) {
                            console.log('找到管理员账户:');
                            adminResults.forEach(admin => {
                                console.log(`  ID:${admin.id} 用户名:${admin.name} OPENID:${admin.openid || '未设置'}`);
                            });
                        } else {
                            console.log('⚠️  未找到管理员账户');
                        }
                    }
                    
                    connection.end();
                    console.log('\n🎉 数据库检查完成！');
                });
            });
        });
    });
});