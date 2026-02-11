const axios = require('axios');

async function detectDatabaseType() {
    console.log('=== 数据库类型检测 ===\n');
    
    try {
        // 通过特定的数据库查询来判断类型
        console.log('尝试通过数据库特性检测...');
        
        // 1. 首先登录获取token
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123456'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功');
            
            // 2. 尝试执行不同数据库特有的查询
            
            // 检查是否为MySQL/TiDB
            try {
                const mysqlTest = await axios.post('http://localhost:9090/db-test/mysql-version', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                if (mysqlTest.data && mysqlTest.data.code === 200) {
                    console.log('✅ 检测到MySQL/TiDB数据库');
                    console.log('版本信息:', mysqlTest.data.data);
                    return;
                }
            } catch (error) {
                console.log('不是MySQL/TiDB数据库');
            }
            
            // 检查是否为H2
            try {
                const h2Test = await axios.post('http://localhost:9090/db-test/h2-info', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                if (h2Test.data && h2Test.data.code === 200) {
                    console.log('✅ 检测到H2数据库');
                    console.log('H2信息:', h2Test.data.data);
                    return;
                }
            } catch (error) {
                console.log('不是H2数据库');
            }
            
            // 3. 通过查询结果推断
            console.log('\n通过查询结果推断数据库类型...');
            
            // 查询用户表结构来判断
            try {
                const userQuery = await axios.post('http://localhost:9090/db-test/user-table-info', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                if (userQuery.data && userQuery.data.code === 200) {
                    console.log('用户表信息:', userQuery.data.data);
                    
                    // 根据字段名和类型判断数据库
                    const fields = userQuery.data.data.fields || [];
                    if (fields.some(f => f.name === 'ID' && f.type.includes('BIGINT'))) {
                        console.log('推测: MySQL/TiDB (使用大写字段名)');
                    } else if (fields.some(f => f.name === 'id' && f.type.includes('BIGINT'))) {
                        console.log('推测: H2 (使用小写字段名)');
                    }
                }
            } catch (error) {
                console.log('无法获取表结构信息');
            }
            
        } else {
            console.log('❌ 登录失败');
        }
        
    } catch (error) {
        console.log('❌ 检测失败:', error.message);
    }
    
    console.log('\n=== 结论 ===');
    console.log('根据现有信息:');
    console.log('- application.yaml默认配置使用H2内存数据库');
    console.log('- application-prod.yaml配置指向TiDB Cloud');
    console.log('- 当前后端服务运行在9090端口');
    console.log('- 需要检查具体启动时使用的配置文件');
}

detectDatabaseType();