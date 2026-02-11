const https = require('https');

console.log('🔍 检查Yahoo商品图片URL格式...\n');

function checkYahooImageUrls() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'iPhone';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=3&format=json`;
    
    console.log('请求URL:', url);
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`状态码: ${res.statusCode}`);
            
            try {
                const json = JSON.parse(data);
                console.log('\n=== Yahoo API 图片URL检查 ===');
                
                if (json.hits && Array.isArray(json.hits) && json.hits.length > 0) {
                    console.log(`\n找到 ${json.hits.length} 个商品`);
                    
                    json.hits.forEach((hit, index) => {
                        console.log(`\n--- 商品 ${index + 1} ---`);
                        console.log('商品名称:', hit.name || 'N/A');
                        
                        // 检查不同层级的image字段
                        console.log('直接image字段:', hit.image || '不存在');
                        
                        if (hit.Item) {
                            console.log('Item.Image字段:', hit.Item.Image || '不存在');
                            if (hit.Item.Image && typeof hit.Item.Image === 'object') {
                                console.log('Image对象属性:', Object.keys(hit.Item.Image));
                                console.log('Image.Medium:', hit.Item.Image.Medium || 'N/A');
                                console.log('Image.Small:', hit.Item.Image.Small || 'N/A');
                                console.log('Image.Large:', hit.Item.Image.Large || 'N/A');
                            }
                        }
                        
                        // 检查URL有效性
                        let imageUrl = '';
                        if (hit.image) {
                            // image字段是对象，包含small和medium属性
                            if (typeof hit.image === 'object') {
                                imageUrl = hit.image.medium || hit.image.small || '';
                                console.log('  image对象内容:', JSON.stringify(hit.image));
                            } else {
                                imageUrl = hit.image;
                            }
                        } else if (hit.Item && hit.Item.Image && hit.Item.Image.Medium) {
                            imageUrl = hit.Item.Image.Medium;
                        }
                        
                        if (imageUrl) {
                            console.log('使用的图片URL:', imageUrl);
                            console.log('URL格式检查:');
                            console.log('  - 是否包含http:', imageUrl.includes('http'));
                            console.log('  - 是否包含https:', imageUrl.includes('https'));
                            console.log('  - URL长度:', imageUrl.length);
                        } else {
                            console.log('❌ 未找到有效的图片URL');
                        }
                    });
                    
                    // 测试图片URL加载
                    console.log('\n=== 图片URL加载测试 ===');
                    const testImages = [];
                    
                    json.hits.slice(0, 2).forEach((hit, index) => {
                        let imageUrl = '';
                        if (hit.image) {
                            if (typeof hit.image === 'object') {
                                imageUrl = hit.image.medium || hit.image.small || '';
                            } else {
                                imageUrl = hit.image;
                            }
                        } else if (hit.Item && hit.Item.Image && hit.Item.Image.Medium) {
                            imageUrl = hit.Item.Image.Medium;
                        }
                        
                        if (imageUrl) {
                            testImages.push({ index: index + 1, url: imageUrl });
                        }
                    });
                    
                    testImages.forEach(testImg => {
                        console.log(`\n测试图片 ${testImg.index}: ${testImg.url.substring(0, 100)}...`);
                        
                        // 简单的HTTP HEAD请求测试
                        const urlObj = new URL(testImg.url);
                        const options = {
                            hostname: urlObj.hostname,
                            port: urlObj.port || 443,
                            path: urlObj.pathname + urlObj.search,
                            method: 'HEAD',
                            timeout: 5000
                        };
                        
                        const req = https.request(options, (res) => {
                            console.log(`  状态码: ${res.statusCode}`);
                            console.log(`  Content-Type: ${res.headers['content-type']}`);
                            console.log(`  Content-Length: ${res.headers['content-length']}`);
                        });
                        
                        req.on('error', (error) => {
                            console.log(`  错误: ${error.message}`);
                        });
                        
                        req.on('timeout', () => {
                            console.log('  超时');
                            req.destroy();
                        });
                        
                        req.end();
                    });
                    
                } else {
                    console.log('❌ 未找到商品数据');
                }
                
            } catch (error) {
                console.error('❌ JSON解析失败:', error.message);
                console.log('原始数据前500字符:', data.substring(0, 500));
            }
        });
    }).on('error', (error) => {
        console.error('❌ HTTP请求失败:', error.message);
    });
}

// 执行检查
checkYahooImageUrls();