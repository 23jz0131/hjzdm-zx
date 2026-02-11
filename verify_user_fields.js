const mysql = require('mysql2');
const axios = require('axios');

const dbConfig = {
    host: 'junction.proxy.rlwy.net',
    port: 3306,
    user: 'root',
    password: 'pBcCDdgEGAfCdAhcBgFaCEGEagEEDgBH',
    database: 'railway'
};

async function verifyDatabaseFix() {
    console.log('=== 数据库字段完整性验证 ===\n');
    
    const connection = mysql.createConnection(dbConfig);
    
    try {
        // 检查表结构
        const [columns] = await connection.promise().query('DESCRIBE USER');
        console.log('USER表当前字段:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type}`);
        });
        
        // 检查必需字段是否存在
        const requiredFields = ['OPENID', 'NICKNAME'];
        const missingFields = requiredFields.filter(field => 
            !columns.some(col => col.Field.toUpperCase() === field)
        );
        
        if (missingFields.length > 0) {
            console.log(`\n❌ 缺少字段: ${missingFields.join(', ')}`);
            console.log('请执行数据库修复脚本');
            return false;
        } else {
            console.log('\n✅ 所有必需字段都存在');
        }
        
        // 检查数据完整性
        const [users] = await connection.promise().query(
            'SELECT ID, NAME, OPENID, NICKNAME FROM USER LIMIT 5'
        );
        
        console.log('\n用户数据示例:');
        users.forEach(user => {
            console.log(`  ID:${user.ID} NAME:${user.NAME} OPENID:${user.OPENID || 'NULL'} NICKNAME:${user.NICKNAME || 'NULL'}`);
        });
        
        return true;
        
    } catch (error) {
        console.error('数据库验证失败:', error.message);
        return false;
    } finally {
        connection.end();
    }
}

async function verifyAPITest() {
    console.log('\n=== API功能验证 ===');
    
    try {
        // 测试登录
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录API正常');
            
            // 测试获取用户信息
            const token = loginResponse.data.data.token;
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userData = userInfoResponse.data.data;
                console.log('✅ 用户信息API正常');
                console.log('   openid字段:', userData.openid !== undefined ? '✅ 存在' : '❌ 缺失');
                console.log('   nickname字段:', userData.nickname !== undefined ? '✅ 存在' : '❌ 缺失');
                console.log('   openid值:', userData.openid || '未设置');
                console.log('   nickname值:', userData.nickname || '未设置');
            }
        }
        
    } catch (error) {
        console.log('❌ API测试失败:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
}

// 执行验证
(async () => {
    const dbOk = await verifyDatabaseFix();
    if (dbOk) {
        await verifyAPITest();
    }
    console.log('\n=== 验证完成 ===');
})();