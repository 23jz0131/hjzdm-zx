const https = require('https');
const querystring = require('querystring');

// 新的Yahoo API密钥
const NEW_YAHOO_CLIENT_ID = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';

// 测试关键词
const TEST_KEYWORD = 'ノートパソコン';

console.log('🔍 Yahoo API密钥深度测试');
console.log('==========================');
console.log(`Client ID: ${NEW_YAHOO_CLIENT_ID}`);
console.log('');

// 方法1: Bearer Token方式
console.log('🧪 方法1: Bearer Token认证');
const method1Options = {
    hostname: 'shopping.yahooapis.jp',
    port: 443,
    path: `/ShoppingWebService/V3/itemSearch?appid=${NEW_YAHOO_CLIENT_ID}&query=${encodeURIComponent(TEST_KEYWORD)}&hits=3`,
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};

makeRequest('Bearer Token方式', method1Options);

// 方法2: Query Parameter方式
setTimeout(() => {
    console.log('\n🧪 方法2: Query Parameter认证');
    const queryParams = querystring.stringify({
        appid: NEW_YAHOO_CLIENT_ID,
        query: TEST_KEYWORD,
        hits: 3
    });
    
    const method2Options = {
        hostname: 'shopping.yahooapis.jp',
        port: 443,
        path: `/ShoppingWebService/V3/itemSearch?${queryParams}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };
    
    makeRequest('Query Parameter方式', method2Options);
}, 1000);

// 方法3: Authorization Header方式
setTimeout(() => {
    console.log('\n🧪 方法3: Authorization Header认证');
    const method3Options = {
        hostname: 'shopping.yahooapis.jp',
        port: 443,
        path: `/ShoppingWebService/V3/itemSearch?query=${encodeURIComponent(TEST_KEYWORD)}&hits=3`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Authorization': `Bearer ${NEW_YAHOO_CLIENT_ID}`
        }
    };
    
    makeRequest('Authorization Header方式', method3Options);
}, 2000);

// 方法4: X-Zeta-ClientID方式
setTimeout(() => {
    console.log('\n🧪 方法4: X-Zeta-ClientID认证');
    const method4Options = {
        hostname: 'shopping.yahooapis.jp',
        port: 443,
        path: `/ShoppingWebService/V3/itemSearch?query=${encodeURIComponent(TEST_KEYWORD)}&hits=3`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Zeta-ClientID': NEW_YAHOO_CLIENT_ID
        }
    };
    
    makeRequest('X-Zeta-ClientID方式', method4Options);
}, 3000);

function makeRequest(methodName, options) {
    console.log(`\n🚀 测试 ${methodName}:`);
    console.log(`URL: https://${options.hostname}${options.path}`);
    
    const req = https.request(options, (res) => {
        console.log(`   📡 状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.hits && response.hits.length > 0) {
                    console.log(`   ✅ 成功! 获取到 ${response.hits.length} 个商品`);
                    console.log(`   📊 总计: ${response.totalResultsAvailable} 个商品`);
                    console.log(`   🏷️  第一个商品: ${response.hits[0].name}`);
                } else if (response.Error) {
                    console.log(`   ❌ 错误: ${response.Error.Message}`);
                } else {
                    console.log(`   ⚠️  无有效数据`);
                }
            } catch (error) {
                console.log(`   ❌ JSON解析失败: ${error.message}`);
                console.log(`   原始响应前200字符: ${data.substring(0, 200)}`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`   ❌ 请求失败: ${error.message}`);
    });
    
    req.end();
}