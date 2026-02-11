const axios = require('axios');

async function getDatabaseInfo() {
    console.log('=== 详细数据库信息检查 ===\n');
    
    try {
        // 1. 检查数据库连接
        console.log('1. 检查数据库连接状态...');
        const connResponse = await axios.get('http://localhost:9090/db-test/test-connection', {
            timeout: 5000
        });
        
        console.log('连接测试结果:', connResponse.data.msg);
        
        // 2. 尝试获取数据库配置信息
        console.log('\n2. 尝试获取数据库配置信息...');
        
        // 尝试几个可能的配置端点
        const configEndpoints = [
            '/actuator/env',
            '/actuator/info',
            '/health',
            '/db-test/info'
        ];
        
        for (const endpoint of configEndpoints) {
            try {
                const response = await axios.get(`http://localhost:9090${endpoint}`, {
                    timeout: 3000
                });
                console.log(`✅ 找到配置端点: ${endpoint}`);
                console.log('响应数据:', JSON.stringify(response.data, null, 2));
                break;
            } catch (error) {
                // 继续尝试下一个端点
            }
        }
        
        // 3. 通过SQL查询检查数据库类型
        console.log('\n3. 通过SQL查询检查数据库类型...');
        
        // 尝试登录并执行数据库查询
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123456'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data.token;
            
            // 尝试执行数据库版本查询
            try {
                // 这里我们可以通过特定的端点来查询数据库信息
                const dbInfoResponse = await axios.post('http://localhost:9090/db-test/database-info', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('数据库信息:', JSON.stringify(dbInfoResponse.data, null, 2));
            } catch (error) {
                console.log('无法获取详细数据库信息');
            }
        }
        
        console.log('\n=== 当前配置分析 ===');
        console.log('根据application.yaml配置:');
        console.log('- 默认开发环境使用H2内存数据库');
        console.log('- 生产环境配置指向TiDB Cloud');
        console.log('- 当前测试显示连接成功，查询结果为"admin"');
        
        console.log('\n=== 推论 ===');
        console.log('当前运行的可能是:');
        console.log('1. 开发环境 - 使用H2内存数据库');
        console.log('2. 或者已切换到生产配置 - 连接TiDB Cloud');
        console.log('3. 需要进一步确认具体的数据库URL配置');
        
    } catch (error) {
        console.log('❌ 检查失败:', error.message);
    }
}

getDatabaseInfo();