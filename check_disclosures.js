const axios = require('axios');

async function checkDisclosures() {
    console.log('=== 检查投稿功能 ===\n');
    
    // 先用zhanghui账户登录获取token
    const loginData = {
        username: 'zhanghui',
        password: '123456'
    };
    
    try {
        console.log('1. 获取登录token...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data?.token;
            console.log('✅ 登录成功，获取token');
            
            // 检查公开投稿
            console.log('\n2. 检查公开投稿...');
            try {
                const publicResponse = await axios.get('http://localhost:9090/disclosure/public?pageNum=1&pageSize=10', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('公开投稿响应状态:', publicResponse.status);
                console.log('公开投稿数据:', JSON.stringify(publicResponse.data, null, 2));
                
                if (publicResponse.data && publicResponse.data.data) {
                    console.log(`\n找到 ${publicResponse.data.data.length} 个公开投稿`);
                    if (publicResponse.data.data.length > 0) {
                        console.log('\n投稿详情:');
                        publicResponse.data.data.forEach((disclosure, index) => {
                            console.log(`${index + 1}. 标题: ${disclosure.title}`);
                            console.log(`   内容: ${disclosure.content?.substring(0, 50)}...`);
                            console.log(`   状态: ${disclosure.status}`);
                            console.log(`   创建时间: ${disclosure.createTime}`);
                            console.log('   ---');
                        });
                    }
                }
            } catch (publicError) {
                console.log('获取公开投稿失败:', publicError.response?.data || publicError.message);
            }
            
            // 检查待审核投稿
            console.log('\n3. 检查待审核投稿...');
            try {
                const pendingResponse = await axios.get('http://localhost:9090/disclosure/pending?pageNum=1&pageSize=10', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('待审核投稿响应状态:', pendingResponse.status);
                console.log('待审核投稿数据:', JSON.stringify(pendingResponse.data, null, 2));
            } catch (pendingError) {
                console.log('获取待审核投稿失败:', pendingError.response?.data || pendingError.message);
            }
            
            // 检查我的投稿
            console.log('\n4. 检查我的投稿...');
            try {
                const myResponse = await axios.get('http://localhost:9090/disclosure/my?pageNum=1&pageSize=10', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('我的投稿响应状态:', myResponse.status);
                console.log('我的投稿数据:', JSON.stringify(myResponse.data, null, 2));
            } catch (myError) {
                console.log('获取我的投稿失败:', myError.response?.data || myError.message);
            }
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
    }
}

// 执行检查
checkDisclosures();