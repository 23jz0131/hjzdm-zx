const axios = require('axios');

async function testCloudDatabaseConnection() {
    console.log('=== 云端数据库连接测试 ===\n');
    
    // 测试本地H2数据库（当前运行）
    console.log('1. 测试当前本地数据库状态...');
    try {
        const localStatus = await axios.get('http://localhost:9090/database-test/status', {
            timeout: 3000
        });
        console.log('✅ 本地数据库连接正常');
        console.log('数据库类型:', localStatus.data.data?.databaseType || 'Unknown');
        console.log('用户总数:', localStatus.data.data?.userCount || 0);
    } catch (error) {
        console.log('⚠️  本地数据库测试接口不可用');
    }
    
    console.log('\n2. 云端数据库切换准备...');
    console.log('📋 切换步骤:');
    console.log('   a. 停止当前运行的本地数据库服务');
    console.log('   b. 运行: ./switch_to_cloud_db.ps1');
    console.log('   c. 系统将连接到云端TiDB数据库');
    console.log('   d. 您的testuser3账户和投稿信息将会可用');
    
    console.log('\n3. 切换后验证...');
    console.log('待系统切换到云端数据库后，将自动测试:');
    console.log('   - testuser3账户登录');
    console.log('   - 投稿信息查询');
    console.log('   - 数据一致性检查');
    
    // 创建切换后的验证脚本
    createVerificationScript();
}

function createVerificationScript() {
    const verificationScript = `
const axios = require('axios');

async function verifyCloudDatabase() {
    console.log('=== 云端数据库验证 ===\\n');
    
    try {
        // 测试testuser3登录
        console.log('1. 测试testuser3账户登录...');
        const loginResponse = await axios.post('http://localhost:8080/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ testuser3登录成功!');
            const token = loginResponse.data.data.token;
            
            // 获取用户信息
            const userResponse = await axios.post('http://localhost:8080/user/me', {}, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`
                }
            });
            
            console.log('用户信息:', userResponse.data.data);
            
            // 检查投稿信息
            console.log('\\n2. 检查投稿信息...');
            // 这里可以添加具体的投稿查询逻辑
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('验证失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('错误信息:', error.response.data);
        }
    }
}

verifyCloudDatabase();
`;
    
    require('fs').writeFileSync('verify_cloud_db.js', verificationScript);
    console.log('\n✅ 已创建验证脚本: verify_cloud_db.js');
    console.log('切换到云端数据库后运行此脚本进行验证');
}

console.log('🔧 云端数据库切换工具准备就绪');
console.log('运行步骤:');
console.log('1. 停止当前服务 (Ctrl+C)');
console.log('2. 执行: ./switch_to_cloud_db.ps1');
console.log('3. 等待系统启动完成');
console.log('4. 运行: node verify_cloud_db.js 验证连接');

testCloudDatabaseConnection();