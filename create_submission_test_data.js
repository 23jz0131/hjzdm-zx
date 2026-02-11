const axios = require('axios');

async function createSubmissionTestData() {
    console.log('=== 创建投稿测试数据 ===\n');
    
    try {
        // 1. 尝试不同的用户登录（用于投稿）
        console.log('1. 尝试用户登录...');
        
        // 尝试已知存在的用户
        const userCredentials = [
            { username: 'testuser3', password: '123123' }, // 管理员用户
            { username: 'admin', password: '123123' },     // 管理员用户
            { username: 'testuser', password: '123123' }   // 普通用户
        ];
        
        let userLoginResponse = null;
        let userToken = null;
        
        for (const cred of userCredentials) {
            try {
                console.log(`尝试登录用户: ${cred.username}`);
                const response = await axios.post('http://localhost:9090/user/login', {
                    username: cred.username,
                    password: cred.password
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                
                if (response.data && response.data.code === 200) {
                    userLoginResponse = response;
                    userToken = response.data.data.token;
                    console.log(`✅ 用户 ${cred.username} 登录成功`);
                    break;
                }
            } catch (error) {
                console.log(`❌ 用户 ${cred.username} 登录失败: ${error.message}`);
            }
        }
        
        if (!userLoginResponse) {
            console.log('❌ 所有用户登录都失败了');
            return;
        }
        
        if (userLoginResponse.data && userLoginResponse.data.code === 200) {
            const userToken = userLoginResponse.data.data.token;
            console.log('✅ 普通用户登录成功\n');
            
            // 2. 创建待审核的投稿
            console.log('2. 创建待审核投稿...');
            
            const submissions = [
                {
                    title: '安全漏洞报告 - XSS攻击测试',
                    content: '发现了一个跨站脚本攻击(XSS)的安全漏洞。攻击者可以通过输入恶意JavaScript代码来窃取用户cookie信息。建议立即修复此漏洞。',
                    link: 'https://github.com/example/security-issue-001',
                    disclosurePrice: 5000
                },
                {
                    title: 'SQL注入漏洞详情',
                    content: '在用户登录模块发现了SQL注入漏洞。攻击者可以通过构造恶意SQL语句来绕过身份验证或获取敏感数据。这是一个高危漏洞，需要紧急处理。',
                    link: 'https://security.example.com/report/sql-injection-001',
                    disclosurePrice: 8000
                },
                {
                    title: 'CSRF攻击防护缺陷',
                    content: '系统缺少CSRF令牌验证机制，攻击者可以诱导用户执行非预期的操作。建议实施CSRF防护措施。',
                    link: 'https://docs.example.com/security/csrf-protection',
                    disclosurePrice: 3000
                },
                {
                    title: '弱密码策略安全隐患',
                    content: '当前系统的密码策略过于宽松，允许使用简单密码。建议加强密码复杂度要求，增加安全风险。',
                    link: 'https://owasp.org/www-project-top-ten/',
                    disclosurePrice: 2000
                }
            ];
            
            // 逐个提交投稿
            for (let i = 0; i < submissions.length; i++) {
                const submission = submissions[i];
                console.log(`提交第${i + 1}个投稿: ${submission.title}`);
                
                try {
                    const submitResponse = await axios.post('http://localhost:9090/disclosure/add', {
                        title: submission.title,
                        content: submission.content,
                        link: submission.link,
                        disclosurePrice: submission.disclosurePrice
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        timeout: 10000
                    });
                    
                    if (submitResponse.data && submitResponse.data.code === 200) {
                        console.log(`✅ 第${i + 1}个投稿提交成功`);
                    } else {
                        console.log(`❌ 第${i + 1}个投稿提交失败:`, submitResponse.data?.msg);
                    }
                } catch (submitError) {
                    console.log(`❌ 第${i + 1}个投稿提交出错:`, submitError.message);
                }
                
                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // 3. 管理员登录检查数据
            console.log('\n3. 管理员检查投稿数据...');
            const adminLoginResponse = await axios.post('http://localhost:9090/user/login', {
                username: 'testuser3',
                password: '123123'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (adminLoginResponse.data && adminLoginResponse.data.code === 200) {
                const adminToken = adminLoginResponse.data.data.token;
                
                // 检查各种状态的投稿数量
                const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const publicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const allRes = await axios.post('http://localhost:9090/disclosure/queryAll', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                console.log('\n📊 当前投稿统计:');
                console.log('📝 待审核投稿数量:', pendingRes.data.data?.length || 0);
                console.log('✅ 已公开投稿数量:', publicRes.data.data?.length || 0);
                console.log('🏠 全部投稿数量:', allRes.data.data?.length || 0);
                
                if (pendingRes.data.data && pendingRes.data.data.length > 0) {
                    console.log('\n📋 待审核投稿列表:');
                    pendingRes.data.data.slice(0, 3).forEach((item, index) => {
                        console.log(`${index + 1}. [ID:${item.disclosureId}] ${item.title} - ¥${item.disclosurePrice}`);
                    });
                }
                
                if (publicRes.data.data && publicRes.data.data.length > 0) {
                    console.log('\n📋 已公开投稿列表:');
                    publicRes.data.data.slice(0, 3).forEach((item, index) => {
                        console.log(`${index + 1}. [ID:${item.disclosureId}] ${item.title} - ¥${item.disclosurePrice}`);
                    });
                }
            }
            
        } else {
            console.log('❌ 普通用户登录失败:', userLoginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行测试数据创建
createSubmissionTestData();