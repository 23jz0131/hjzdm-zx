const https = require('https');
const querystring = require('querystring');

// 新的Yahoo API密钥
const NEW_YAHOO_CLIENT_ID = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';

// 测试关键词
const TEST_KEYWORD = 'ノートパソコン';

console.log('🔍 Yahoo API新密钥测试');
console.log('=========================');
console.log(`使用的Client ID: ${NEW_YAHOO_CLIENT_ID}`);
console.log(`搜索关键词: ${TEST_KEYWORD}`);
console.log('');

// 构建API请求URL
const queryParams = querystring.stringify({
    query: TEST_KEYWORD,
    hits: 5,
    start: 1,
    sort: 'score'
});

const apiUrl = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${queryParams}`;
console.log(`请求URL: ${apiUrl}`);
console.log('');

// 发送HTTPS请求
const options = {
    hostname: 'shopping.yahooapis.jp',
    port: 443,
    path: `/ShoppingWebService/V3/itemSearch?${queryParams}`,
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Authorization': `Bearer ${NEW_YAHOO_CLIENT_ID}`
    }
};

console.log('🚀 正在发送API请求...');
console.log('');

const req = https.request(options, (res) => {
    console.log(`📡 响应状态码: ${res.statusCode}`);
    console.log(`📋 响应头: ${JSON.stringify(res.headers, null, 2)}`);
    console.log('');
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (response.hits && response.hits.length > 0) {
                console.log('✅ API调用成功！获取到商品数据:');
                console.log(`📊 总商品数: ${response.totalResultsAvailable}`);
                console.log(`📋 返回商品数: ${response.hits.length}`);
                console.log('');
                
                console.log('📦 前5个商品详情:');
                response.hits.slice(0, 5).forEach((item, index) => {
                    console.log(`${index + 1}. ${item.name}`);
                    console.log(`   价格: ¥${item.price.toLocaleString()}`);
                    console.log(`   商品代码: ${item.code}`);
                    console.log(`   店铺: ${item.store.name}`);
                    console.log('');
                });
                
                // 检查编码是否正确
                const sampleName = response.hits[0].name;
                console.log('🔤 编码检查:');
                console.log(`原始名称: ${sampleName}`);
                console.log(`字符长度: ${sampleName.length}`);
                console.log(`是否包含日文字符: ${/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(sampleName) ? '是' : '否'}`);
                
            } else {
                console.log('❌ API调用失败或无结果');
                console.log('响应内容:', JSON.stringify(response, null, 2));
            }
        } catch (error) {
            console.log('❌ JSON解析失败:', error.message);
            console.log('原始响应:', data.substring(0, 500) + '...');
        }
    });
});

req.on('error', (error) => {
    console.log('❌ 请求失败:', error.message);
});

req.end();

// 同时测试不带认证的请求来对比
setTimeout(() => {
    console.log('\n🔄 对比测试 - 不带认证的请求:');
    const noAuthOptions = {
        hostname: 'shopping.yahooapis.jp',
        port: 443,
        path: `/ShoppingWebService/V3/itemSearch?${queryParams}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };
    
    const noAuthReq = https.request(noAuthOptions, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        let noAuthData = '';
        res.on('data', chunk => noAuthData += chunk);
        res.on('end', () => {
            try {
                const noAuthResponse = JSON.parse(noAuthData);
                console.log(`结果数量: ${noAuthResponse.totalResultsAvailable || 'N/A'}`);
            } catch (e) {
                console.log('解析失败，可能是错误响应');
            }
        });
    });
    
    noAuthReq.on('error', (error) => {
        console.log('请求失败:', error.message);
    });
    
    noAuthReq.end();
}, 2000);