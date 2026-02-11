const https = require('https');

// 简单测试Yahoo API返回的图片格式
function simpleYahooTest() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'Switch';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=1&format=json`;
    
    console.log('测试Yahoo API图片格式...');
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.hits && json.hits.length > 0) {
                    const hit = json.hits[0];
                    console.log('商品名称:', hit.name);
                    console.log('图片字段类型:', typeof hit.image);
                    console.log('图片字段内容:', hit.image);
                    
                    // 模拟Java代码中的处理逻辑
                    let imgUrl = "";
                    if (hit.image) {
                        if (typeof hit.image === 'object') {
                            imgUrl = hit.image.medium || hit.image.small || '';
                        } else if (typeof hit.image === 'string') {
                            imgUrl = hit.image;
                        }
                    }
                    console.log('处理后的图片URL:', imgUrl);
                }
            } catch(e) {
                console.log('解析失败:', e.message);
            }
        });
    });
}

simpleYahooTest();