const mysql = require('mysql2');

// 数据库连接配置
const config = {
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2eXmMXiGeCt9iz7.root',
    password: '00KpH8EmSBk7A3ET',
    database: 'fortune500',
    ssl: {
        rejectUnauthorized: false
    }
};

console.log('=== 云端数据库连接测试 ===\n');

console.log('连接信息:');
console.log('- 主机:', config.host);
console.log('- 端口:', config.port);
console.log('- 用户名:', config.user);
console.log('- 数据库:', config.database);
console.log('');

// 创建连接
const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.log('❌ 连接失败:');
        console.log('错误代码:', err.code);
        console.log('错误信息:', err.message);
        console.log('错误编号:', err.errno);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n可能的原因:');
            console.log('1. 用户名或密码错误');
            console.log('2. 用户没有访问该数据库的权限');
            console.log('3. 数据库服务暂时不可用');
        }
        
        process.exit(1);
    }
    
    console.log('✅ 连接成功!\n');
    
    // 测试查询
    connection.query('SELECT 1 as test', (error, results) => {
        if (error) {
            console.log('❌ 查询失败:', error.message);
        } else {
            console.log('✅ 查询成功:', results[0]);
        }
        
        // 关闭连接
        connection.end();
    });
});