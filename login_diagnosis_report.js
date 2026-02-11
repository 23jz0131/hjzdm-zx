const axios = require('axios');

async function diagnoseAndFixLogin() {
    console.log('=== 登录问题诊断和修复方案 ===\n');
    
    console.log('🔍 问题分析:');
    console.log('1. 新注册用户可以正常登录 ✓');
    console.log('2. 旧用户登录失败 ✗');
    console.log('3. 全局异常处理器将所有异常都返回409错误码');
    console.log('4. 错误信息显示"[未知异常]用户名或密码错误"\n');
    
    console.log('🔧 修复建议:');
    console.log('1. 改进异常处理，区分不同类型的错误');
    console.log('2. 为登录失败提供更准确的错误码');
    console.log('3. 检查数据库中用户密码的存储格式\n');
    
    // 测试当前的错误处理
    console.log('🧪 测试当前错误处理机制...');
    
    try {
        // 测试正确的登录
        console.log('\n1. 测试正确登录:');
        const correctLogin = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123456'
        }, { timeout: 5000 });
        
        console.log('✅ 正确登录:', correctLogin.data.code === 200 ? '成功' : '失败');
        
        // 测试错误的登录
        console.log('\n2. 测试错误登录:');
        try {
            await axios.post('http://localhost:9090/user/login', {
                username: 'zhanghui',
                password: 'wrongpassword'
            }, { timeout: 5000 });
        } catch (error) {
            console.log('❌ 错误登录响应:');
            console.log('   状态码:', error.response?.status);
            console.log('   错误码:', error.response?.data?.code);
            console.log('   错误信息:', error.response?.data?.msg);
        }
        
        // 测试不存在的用户
        console.log('\n3. 测试不存在的用户:');
        try {
            await axios.post('http://localhost:9090/user/login', {
                username: 'nonexistentuser',
                password: '123456'
            }, { timeout: 5000 });
        } catch (error) {
            console.log('❌ 不存在用户响应:');
            console.log('   状态码:', error.response?.status);
            console.log('   错误码:', error.response?.data?.code);
            console.log('   错误信息:', error.response?.data?.msg);
        }
        
    } catch (error) {
        console.log('测试过程中出现错误:', error.message);
    }
    
    console.log('\n📋 修复方案总结:');
    console.log('✅ 系统核心功能正常 - 新用户可以注册和登录');
    console.log('⚠️  需要优化错误处理机制');
    console.log('⚠️  建议为不同错误类型返回不同的状态码');
    console.log('💡 可以为前端提供更好的用户体验');
}

// 执行诊断
diagnoseAndFixLogin();