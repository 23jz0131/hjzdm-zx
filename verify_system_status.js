// 验证当前user表结构和系统功能
const axios = require('axios');
const mysql = require('mysql2/promise');

async function verifyCurrentStructure() {
    console.log('=== 当前系统状态验证 ===\n');
    
    // 1. 首先检查数据库连接和表结构
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'hjzdm'
        });
        
        console.log('1. 检查数据库表结构...');
        const [columns] = await connection.execute("DESCRIBE user");
        console.log('当前user表字段:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
        });
        
        // 检查是否存在问题字段
        const problematicFields = columns.filter(col => 
            col.Field.toLowerCase().includes('phone') || 
            col.Field.toLowerCase().includes('openid')
        );
        
        if (problematicFields.length > 0) {
            console.log('⚠️  发现可能的问题字段:', problematicFields.map(f => f.Field));
        } else {
            console.log('✅ 没有发现phone或openid相关字段');
        }
        
        await connection.end();
        
    } catch (dbError) {
        console.log('⚠️  数据库连接检查跳过:', dbError.message);
    }
    
    // 2. 测试API功能
    try {
        console.log('\n2. 测试用户登录API...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            
            const token = loginResponse.data.data.token;
            
            // 测试获取用户信息
            console.log('\n3. 测试用户信息获取...');
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userData = userInfoResponse.data.data;
                console.log('✅ 用户信息获取成功');
                console.log('   用户ID:', userData.id);
                console.log('   用户名:', userData.name);
                console.log('   昵称:', userData.nickname || '未设置');
                console.log('   邮箱:', userData.email || '未设置');
                
                // 检查不应该存在的字段
                const shouldNotExist = ['phone', 'openid'];
                const existingProblematic = shouldNotExist.filter(field => userData[field] !== undefined);
                
                if (existingProblematic.length > 0) {
                    console.log('❌ 仍然存在不应有的字段:', existingProblematic);
                } else {
                    console.log('✅ 没有发现不应有的字段');
                }
                
                // 显示所有返回的字段
                const allFields = Object.keys(userData);
                console.log('   返回的所有字段:', allFields.join(', '));
            }
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg || '未知错误');
        }
        
    } catch (apiError) {
        console.log('❌ API测试失败:', apiError.message);
        if (apiError.response) {
            console.log('   服务器响应:', apiError.response.data?.msg || apiError.response.statusText);
        }
    }
    
    // 3. 测试其他关键功能
    try {
        console.log('\n4. 测试投稿相关功能...');
        
        // 尝试获取投稿列表（无需认证）
        const disclosureResponse = await axios.get('http://localhost:9090/disclosure/list', {
            params: { current: 1, size: 5 },
            timeout: 5000
        });
        
        if (disclosureResponse.data && disclosureResponse.data.code === 200) {
            console.log('✅ 投稿列表获取正常');
            const disclosures = disclosureResponse.data.data?.records || [];
            console.log('   获取到投稿数量:', disclosures.length);
        }
        
    } catch (disclosureError) {
        console.log('⚠️  投稿功能测试:', disclosureError.message);
    }
    
    console.log('\n🎉 验证完成！');
    console.log('\n建议:');
    console.log('- 如果所有测试都通过，说明系统运行正常');
    console.log('- 如果仍有字段问题，请检查数据库和实体类是否完全同步');
    console.log('- 确保前后端服务都在正常运行');
}

verifyCurrentStructure();