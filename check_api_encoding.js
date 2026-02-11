const https = require('https');

// 直接测试Yahoo API响应编码
function checkYahooEncoding() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'Switch';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=3&format=json`;
    
    console.log('🔍 检查Yahoo API响应编码...');
    console.log('URL:', url);
    
    https.get(url, (res) => {
        console.log('响应头信息:');
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Content-Encoding:', res.headers['content-encoding']);
        
        let data = '';
        let rawData = Buffer.alloc(0);
        
        res.on('data', (chunk) => {
            data += chunk;
            rawData = Buffer.concat([rawData, chunk]);
        });
        
        res.on('end', () => {
            console.log('\n=== 编码分析 ===');
            console.log('原始数据长度:', rawData.length, '字节');
            console.log('UTF-8解码长度:', data.length, '字符');
            
            // 尝试不同的编码解码
            try {
                const shiftJisDecoder = new TextDecoder('shift-jis');
                const shiftJisText = shiftJisDecoder.decode(rawData);
                console.log('Shift-JIS解码预览:', shiftJisText.substring(0, 100));
                
                // 检查是否包含明显的乱码模式
                const utf8Garbage = data.match(/[^\x00-\x7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g);
                console.log('UTF-8解码疑似乱码字符数:', utf8Garbage ? utf8Garbage.length : 0);
                
                const sjisGarbage = shiftJisText.match(/[^\x00-\x7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g);
                console.log('Shift-JIS解码疑似乱码字符数:', sjisGarbage ? sjisGarbage.length : 0);
                
                // 解析JSON
                const json = JSON.parse(data);
                if (json.hits && json.hits.length > 0) {
                    console.log('\n=== 商品名称对比 ===');
                    json.hits.slice(0, 3).forEach((hit, index) => {
                        if (hit.Item && hit.Item.Name) {
                            console.log(`商品${index + 1}:`);
                            console.log('  UTF-8:', hit.Item.Name.substring(0, 50));
                            console.log('  Shift-JIS可能显示:', shiftJisText.substring(shiftJisText.indexOf('"Name":"'), shiftJisText.indexOf('"Name":"') + 100).split('"')[3]?.substring(0, 50) || '未找到');
                        }
                    });
                }
            } catch (error) {
                console.log('编码检测出错:', error.message);
            }
        });
    }).on('error', (error) => {
        console.log('请求失败:', error.message);
    });
}

// 执行检查
checkYahooEncoding();