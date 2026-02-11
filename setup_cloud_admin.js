const axios = require('axios');

async function setupCloudAdminAccount() {
    console.log('=== 云端管理员账户设置方案 ===\n');
    
    console.log('📋 问题分析:');
    console.log('当前系统使用本地H2内存数据库');
    console.log('您的testuser3账户存储在云端TiDB数据库中');
    console.log('两个数据库相互独立，无法直接访问\n');
    
    console.log('🔧 解决方案:');
    
    // 方案1: 在本地创建相同账户
    console.log('\n方案1: 在本地创建相同凭据的管理员账户');
    await createLocalAdminAccount();
    
    // 方案2: 切换到云端数据库
    console.log('\n方案2: 切换系统到使用云端TiDB数据库');
    showCloudDbSetup();
    
    // 方案3: 数据迁移
    console.log('\n方案3: 从云端数据库迁移用户数据到本地');
    showMigrationOption();
}

async function createLocalAdminAccount() {
    console.log('\n--- 创建本地管理员账户 ---');
    
    const adminData = {
        username: 'testuser3',
        email: 'admin@testuser3.com',
        password: '123123',
        confirmPassword: '123123'
    };
    
    try {
        console.log('注册本地管理员账户...');
        
        const response = await axios.post('http://localhost:9090/user/register', adminData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        if (response.data && response.data.code === 200) {
            console.log('✅ 本地管理员账户创建成功!');
            console.log('用户ID:', response.data.data?.id);
            
            // 测试登录
            console.log('\n测试本地账户登录...');
            await testLocalAdminLogin();
        } else {
            console.log('❌ 账户创建失败:', response.data?.msg);
            
            // 如果账户已存在，直接测试登录
            if (response.data?.msg?.includes('已存在')) {
                console.log('账户已存在，直接测试登录...');
                await testLocalAdminLogin();
            }
        }
        
    } catch (error) {
        if (error.response?.data?.msg?.includes('已存在')) {
            console.log('✅ 本地账户已存在，测试登录...');
            await testLocalAdminLogin();
        } else {
            console.log('❌ 操作失败:', error.response?.data?.msg || error.message);
        }
    }
}

async function testLocalAdminLogin() {
    const loginData = {
        username: 'testuser3',
        password: '123123'
    };
    
    try {
        const response = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (response.data && response.data.code === 200) {
            console.log('✅ 本地管理员登录成功!');
            console.log('Token:', response.data.data?.token?.substring(0, 30) + '...');
            
            // 检查是否为管理员
            await checkAdminStatus(response.data.data.token);
        } else {
            console.log('❌ 本地登录失败:', response.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 本地登录异常:', error.response?.data?.msg || error.message);
    }
}

async function checkAdminStatus(token) {
    try {
        const response = await axios.post('http://localhost:9090/user/me', {}, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });
        
        if (response.data && response.data.code === 200) {
            const user = response.data.data;
            console.log('用户信息:', {
                id: user.id,
                name: user.name,
                createTime: user.createTime
            });
            
            // 管理员通常ID为1或者有特殊标记
            if (user.id === '1' || user.name === 'admin') {
                console.log('👑 确认为管理员账户');
            } else {
                console.log('👤 普通用户账户');
            }
        }
        
    } catch (error) {
        console.log('获取用户信息失败:', error.message);
    }
}

function showCloudDbSetup() {
    console.log('\n--- 云端数据库配置说明 ---');
    console.log('要使用云端TiDB数据库，请执行以下步骤:');
    console.log('1. 运行 PowerShell 脚本: ./run_with_cloud_db.ps1');
    console.log('2. 输入您的 TiDB 数据库密码');
    console.log('3. 系统将连接到云端数据库');
    console.log('4. 重启后端服务');
    console.log('\n注意: 这将切换整个系统的数据源');
}

function showMigrationOption() {
    console.log('\n--- 数据迁移选项 ---');
    console.log('如果您想保留云端数据并迁移到本地:');
    console.log('1. 从云端数据库导出用户数据');
    console.log('2. 转换数据格式以适配本地系统');
    console.log('3. 导入到本地数据库');
    console.log('\n这需要数据库管理权限和技术支持');
}

// 执行设置
setupCloudAdminAccount();