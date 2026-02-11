const axios = require('axios');

async function checkZhanghuiSubmissions() {
    console.log('=== 检查zhanghui用户的投稿情况 ===\n');
    
    try {
        // 1. 先登录zhanghui用户
        console.log('1. 登录zhanghui用户...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123456'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data.token;
            const userId = loginResponse.data.data.id;
            console.log('✅ 登录成功!');
            console.log('- 用户ID:', userId);
            console.log('- Token:', token.substring(0, 20) + '...');
            
            // 2. 检查用户基本信息
            console.log('\n2. 获取用户基本信息...');
            try {
                const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('用户信息响应状态:', profileResponse.status);
                console.log('用户信息:', JSON.stringify(profileResponse.data, null, 2));
            } catch (profileError) {
                console.log('获取用户信息失败:', profileError.response?.data || profileError.message);
            }
            
            // 3. 检查我的投稿（POST方式）
            console.log('\n3. 检查我的投稿 (POST方式)...');
            try {
                const myPostResponse = await axios.post('http://localhost:9090/disclosure/queryMyDisclosure', {
                    pageNum: 1,
                    pageSize: 10
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('POST投稿响应状态:', myPostResponse.status);
                console.log('POST投稿数据:', JSON.stringify(myPostResponse.data, null, 2));
            } catch (postError) {
                console.log('POST获取投稿失败:', postError.response?.data || postError.message);
            }
            
            // 4. 检查我的投稿（GET方式）- 新添加的接口
            console.log('\n4. 检查我的投稿 (GET方式)...');
            try {
                const myGetResponse = await axios.post('http://localhost:9090/disclosure/my', {}, {
                    params: {
                        pageNum: 1,
                        pageSize: 10
                    },
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('GET投稿响应状态:', myGetResponse.status);
                console.log('GET投稿数据:', JSON.stringify(myGetResponse.data, null, 2));
            } catch (getError) {
                console.log('GET获取投稿失败:', getError.response?.data || getError.message);
            }
            
            // 5. 检查公开投稿列表
            console.log('\n5. 检查公开投稿列表...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 10
                }, {
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                
                console.log('公开投稿响应状态:', publicResponse.status);
                console.log('公开投稿数据:', JSON.stringify(publicResponse.data, null, 2));
            } catch (publicError) {
                console.log('获取公开投稿失败:', publicError.response?.data || publicError.message);
            }
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行检查
checkZhanghuiSubmissions();