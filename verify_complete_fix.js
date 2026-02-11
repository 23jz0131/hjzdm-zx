const mysql = require('mysql2');
const axios = require('axios');

// 数据库连接配置
const dbConfig = {
    host: 'junction.proxy.rlwy.net',
    port: 3306,
    user: 'root',
    password: 'pBcCDdgEGAfCdAhcBgFaCEGEagEEDgBH',
    database: 'railway'
};

console.log('=== 数据库修复验证 ===\n');

// 测试数据库连接和字段存在性
function testDatabaseFix() {
    const connection = mysql.createConnection(dbConfig);
    
    connection.connect((err) => {
        if (err) {
            console.error('❌ 数据库连接失败:', err);
            return;
        }
        console.log('✅ 数据库连接成功\n');
        
        // 检查USER表结构
        connection.query('DESCRIBE USER', (error, results) => {
            if (error) {
                console.error('查询表结构失败:', error);
                connection.end();
                return;
            }
            
            console.log('=== USER表结构 ===');
            console.table(results);
            
            // 检查nickname字段是否存在
            const hasNickname = results.some(row => row.Field.toLowerCase() === 'nickname');
            console.log(`\n是否存在nickname字段: ${hasNickname ? '✅ 是' : '❌ 否'}`);
            
            if (hasNickname) {
                // 查看nickname数据
                connection.query('SELECT ID, NAME, NICKNAME FROM USER LIMIT 10', (dataError, userData) => {
                    if (dataError) {
                        console.error('查询用户数据失败:', dataError);
                    } else {
                        console.log('\n=== 用户昵称数据示例 ===');
                        console.table(userData);
                    }
                    connection.end();
                });
            } else {
                console.log('\n⚠️  请先执行数据库修复SQL脚本');
                connection.end();
            }
        });
    });
}

// 测试后端API功能
async function testBackendAPI() {
    console.log('\n=== 后端API功能测试 ===');
    
    try {
        // 测试用户登录
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        console.log('登录API测试:', loginResponse.status === 200 ? '✅ 成功' : '❌ 失败');
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('   用户ID:', loginResponse.data.data?.id);
            console.log('   Token获取:', loginResponse.data.data?.token ? '✅ 成功' : '❌ 失败');
        }
        
        // 测试获取用户信息
        const token = loginResponse.data.data?.token;
        if (token) {
            const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000
            });
            
            console.log('用户信息API测试:', profileResponse.status === 200 ? '✅ 成功' : '❌ 失败');
            if (profileResponse.data && profileResponse.data.code === 200) {
                console.log('   昵称字段:', profileResponse.data.data?.nickname !== undefined ? '✅ 存在' : '❌ 缺失');
                console.log('   用户昵称:', profileResponse.data.data?.nickname || '未设置');
            }
        }
        
    } catch (error) {
        console.log('API测试失败:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
}

// 执行测试
testDatabaseFix();
setTimeout(() => {
    testBackendAPI();
}, 2000);