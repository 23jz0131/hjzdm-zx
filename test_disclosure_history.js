const axios = require('axios');

async function testMyDisclosureIssue() {
    console.log('=== 投稿历史问题诊断 ===\n');
    
    try {
        // 1. 测试使用真实姓名账户登录
        console.log('1. 使用真实姓名账户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录成功');
            const token = loginResponse.data.data.token;
            console.log('Token:', token.substring(0, 20) + '...');
            
            // 2. 验证用户信息
            console.log('\n2. 获取用户信息...');
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userInfo = userInfoResponse.data.data;
                console.log('✅ 用户信息获取成功');
                console.log('   用户ID:', userInfo.id);
                console.log('   用户名:', userInfo.name);
                console.log('   昵称:', userInfo.nickname || '未设置');
                
                // 3. 测试投稿历史API
                console.log('\n3. 测试投稿历史API...');
                try {
                    const disclosureResponse = await axios.get(
                        'http://localhost:9090/disclosure/my?pageNum=1&pageSize=10',
                        {
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            }
                        }
                    );
                    
                    console.log('✅ 投稿历史API调用成功');
                    console.log('   状态码:', disclosureResponse.status);
                    console.log('   响应数据:', JSON.stringify(disclosureResponse.data, null, 2));
                    
                    const disclosures = disclosureResponse.data.data || [];
                    console.log(`   投稿数量: ${disclosures.length}`);
                    
                    if (disclosures.length === 0) {
                        console.log('⚠️  该用户确实没有投稿记录');
                        
                        // 4. 检查数据库中是否有任何投稿数据
                        console.log('\n4. 检查数据库中的投稿数据...');
                        try {
                            const allDisclosuresResponse = await axios.post(
                                'http://localhost:9090/disclosure/queryPublicList',
                                { pageNum: 1, pageSize: 100 },
                                {
                                    headers: { 
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                            
                            const allDisclosures = allDisclosuresResponse.data.data?.data || allDisclosuresResponse.data.data || [];
                            console.log(`   数据库总投稿数: ${allDisclosures.length}`);
                            
                            if (allDisclosures.length > 0) {
                                console.log('   投稿作者分布:');
                                const authorDistribution = {};
                                allDisclosures.forEach(d => {
                                    const author = d.author || 'unknown';
                                    authorDistribution[author] = (authorDistribution[author] || 0) + 1;
                                });
                                Object.entries(authorDistribution).forEach(([author, count]) => {
                                    console.log(`     作者${author}: ${count}篇`);
                                });
                            }
                        } catch (dbError) {
                            console.log('   数据库检查失败:', dbError.message);
                        }
                    } else {
                        console.log('✅ 用户有投稿记录');
                        disclosures.slice(0, 3).forEach((d, index) => {
                            console.log(`   投稿${index + 1}: ${d.title || '无标题'} (ID: ${d.disclosureId})`);
                        });
                    }
                    
                } catch (disclosureError) {
                    console.log('❌ 投稿历史API调用失败');
                    console.log('   错误信息:', disclosureError.message);
                    if (disclosureError.response) {
                        console.log('   状态码:', disclosureError.response.status);
                        console.log('   响应数据:', JSON.stringify(disclosureError.response.data, null, 2));
                    }
                }
                
            } else {
                console.log('❌ 用户信息获取失败:', userInfoResponse.data?.msg);
            }
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 诊断过程中出现错误:', error.message);
        if (error.response) {
            console.log('   错误详情:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    console.log('\n=== 诊断完成 ===');
}

testMyDisclosureIssue();