// 简化版投稿审查页面检查脚本
const http = require('http');

// 检查服务是否运行
function checkService() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:9090/actuator/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ 后端服务状态:', res.statusCode === 200 ? '运行中' : '异常');
                resolve(res.statusCode === 200);
            });
        }).on('error', () => {
            console.log('❌ 后端服务未运行');
            resolve(false);
        });
    });
}

// 管理员登录
function adminLogin() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            username: 'testuser3',
            password: '123123'
        });
        
        const options = {
            hostname: 'localhost',
            port: 9090,
            path: '/user/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.code === 200 && result.data?.token) {
                        console.log('✅ 管理员登录成功');
                        resolve(result.data.token);
                    } else {
                        console.log('❌ 登录失败:', result.msg || '未知错误');
                        resolve(null);
                    }
                } catch (e) {
                    console.log('❌ 登录响应解析失败');
                    resolve(null);
                }
            });
        });
        
        req.on('error', () => {
            console.log('❌ 登录请求失败');
            resolve(null);
        });
        
        req.write(postData);
        req.end();
    });
}

// 检查投稿接口
function checkDisclosures(token) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            pageNum: 1,
            pageSize: 10
        });
        
        const options = {
            hostname: 'localhost',
            port: 9090,
            path: '/disclosure/queryPendingList',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`\n=== 待审核投稿接口检查 ===`);
                    console.log('响应状态:', res.statusCode);
                    console.log('返回码:', result.code);
                    console.log('数据量:', Array.isArray(result.data) ? result.data.length : 0);
                    
                    if (result.data && result.data.length > 0) {
                        console.log('数据示例:');
                        result.data.slice(0, 2).forEach((item, index) => {
                            console.log(`  ${index + 1}. ID:${item.disclosureId} 标题:"${item.title}" 状态:${item.status}`);
                        });
                    } else {
                        console.log('⚠️  没有待审核的投稿数据');
                    }
                    resolve(result);
                } catch (e) {
                    console.log('❌ 接口响应解析失败:', e.message);
                    resolve(null);
                }
            });
        });
        
        req.on('error', (e) => {
            console.log('❌ 接口请求失败:', e.message);
            resolve(null);
        });
        
        req.write(postData);
        req.end();
    });
}

// 主检查流程
async function runCheck() {
    console.log('=== 投稿审查页面问题检查 ===\n');
    
    // 1. 检查服务状态
    const serviceOk = await checkService();
    if (!serviceOk) {
        console.log('\n🔧 请先启动后端服务 (mvn spring-boot:run)');
        return;
    }
    
    // 2. 管理员登录
    const token = await adminLogin();
    if (!token) {
        console.log('\n🔧 登录失败，请检查账户信息');
        return;
    }
    
    // 3. 检查投稿接口
    await checkDisclosures(token);
    
    console.log('\n=== 检查完成 ===');
    console.log('如果投稿不显示，请检查:');
    console.log('1. 数据库中是否有状态为0(待审核)的投稿');
    console.log('2. 管理员权限是否正确');
    console.log('3. 前端页面是否有JavaScript错误');
}

// 执行检查
runCheck();