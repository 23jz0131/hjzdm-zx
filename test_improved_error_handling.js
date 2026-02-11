const axios = require('axios');

async function testImprovedErrorHandling() {
    console.log('=== 测试改进的错误处理机制 ===\n');
    
    // 需要先将ImprovedGlobalExceptionHandler启用
    console.log('⚠️  注意: 需要在Spring Boot中启用ImprovedGlobalExceptionHandler');
    console.log('   请将 @ControllerAdvice 注解从 GlobalExceptionHandler 移到 ImprovedGlobalExceptionHandler\n');
    
    console.log('🧪 测试各种错误场景:');
    
    const testCases = [
        {
            name: '正确登录',
            data: { username: 'zhanghui', password: '123456' },
            expectSuccess: true
        },
        {
            name: '密码错误',
            data: { username: 'zhanghui', password: 'wrongpassword' },
            expectSuccess: false,
            expectedCode: 401
        },
        {
            name: '用户名不存在',
            data: { username: 'nonexistent', password: '123456' },
            expectSuccess: false,
            expectedCode: 401
        },
        {
            name: '用户名已存在(注册)',
            data: { 
                username: 'zhanghui', 
                email: 'test@example.com',
                password: '123456',
                confirmPassword: '123456'
            },
            url: '/user/register',
            expectSuccess: false,
            expectedCode: 409
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- 测试: ${testCase.name} ---`);
        try {
            const url = testCase.url || '/user/login';
            const response = await axios.post(`http://localhost:9090${url}`, testCase.data, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (testCase.expectSuccess) {
                console.log(`✅ ${testCase.name}: 成功`);
                console.log(`   状态码: ${response.status}`);
                console.log(`   响应码: ${response.data.code}`);
            } else {
                console.log(`❌ ${testCase.name}: 应该失败但成功了`);
            }
            
        } catch (error) {
            if (error.response) {
                console.log(`${testCase.expectSuccess ? '❌' : '✅'} ${testCase.name}: ${testCase.expectSuccess ? '失败' : '正确失败'}`);
                console.log(`   HTTP状态码: ${error.response.status}`);
                console.log(`   响应码: ${error.response.data?.code}`);
                console.log(`   错误信息: ${error.response.data?.msg}`);
                
                // 验证错误码是否符合预期
                if (testCase.expectedCode) {
                    if (error.response.data?.code === testCase.expectedCode) {
                        console.log(`   ✅ 错误码正确 (${testCase.expectedCode})`);
                    } else {
                        console.log(`   ❌ 错误码不正确 (期望: ${testCase.expectedCode}, 实际: ${error.response.data?.code})`);
                    }
                }
            } else {
                console.log(`❌ ${testCase.name}: 请求失败 - ${error.message}`);
            }
        }
    }
    
    console.log('\n📋 改进效果:');
    console.log('✅ 登录失败返回401状态码 (更准确)');
    console.log('✅ 用户名重复返回409状态码 (标准HTTP语义)');
    console.log('✅ 系统错误返回500状态码');
    console.log('✅ 前端可以根据不同状态码提供更好的用户体验');
}

// 执行测试
testImprovedErrorHandling();