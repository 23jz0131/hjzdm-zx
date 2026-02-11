const http = require('http');

// 测试Yahoo搜索API
function testYahooSearch() {
    const postData = JSON.stringify({
        query: '手机',
        pageNum: 1,
        pageSize: 10
    });
    
    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/search',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('🔍 Yahoo搜索测试结果:');
            console.log('状态码:', res.statusCode);
            console.log('响应头:', res.headers);
            try {
                const jsonData = JSON.parse(data);
                console.log('响应数据:', JSON.stringify(jsonData, null, 2));
                if (jsonData.data) {
                    console.log('商品数量:', Array.isArray(jsonData.data) ? jsonData.data.length : 'Not array');
                    if (Array.isArray(jsonData.data)) {
                        jsonData.data.forEach((item, index) => {
                            console.log(`${index + 1}. ${item.goodsName} - ¥${item.goodsPrice} (${item.mallType === 20 ? 'Yahoo' : 'Other'})`);
                        });
                    }
                }
            } catch (e) {
                console.log('原始响应:', data);
                console.log('JSON解析失败:', e.message);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ 请求错误:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行测试
console.log('🚀 开始测试Yahoo搜索功能...');
testYahooSearch();