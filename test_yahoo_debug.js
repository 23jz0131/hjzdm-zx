const https = require('https');
const querystring = require('querystring');

async function testYahooAPI() {
    console.log('🔍 详细测试Yahoo API连接...\n');
    
    // 使用后端配置的相同参数
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'Nintendo Switch';
    const encodedKeyword = encodeURIComponent(keyword);
    const start = 1;
    
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=${start}&results=10&format=json`;
    
    console.log('📋 测试参数:');
    console.log('   AppID:', clientId);
    console.log('   关键词:', keyword);
    console.log('   编码后:', encodedKeyword);
    console.log('   完整URL:', url);
    console.log('');
    
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            console.log('📡 HTTP响应:');
            console.log('   状态码:', res.statusCode);
            console.log('   响应头:', res.headers);
            console.log('');
            
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    console.log('📄 原始响应数据长度:', data.length, '字符');
                    console.log('📄 响应前500字符:');
                    console.log(data.substring(0, Math.min(500, data.length)));
                    console.log('');
                    
                    const json = JSON.parse(data);
                    console.log('✅ JSON解析成功');
                    
                    if (json.Error) {
                        console.log('❌ API返回错误:');
                        console.log('   错误代码:', json.Error.Code);
                        console.log('   错误消息:', json.Error.Message);
                        if (json.Error.Detail) {
                            console.log('   详细信息:', json.Error.Detail);
                        }
                    } else if (json.hits) {
                        console.log('✅ API调用成功!');
                        console.log('   找到商品数量:', json.hits.length);
                        console.log('   总结果数:', json.totalResultsAvailable || '未知');
                        console.log('   当前页开始位置:', json.firstResultsPosition || '未知');
                        
                        if (json.hits.length > 0) {
                            console.log('\n📦 前3个商品详情:');
                            json.hits.slice(0, 3).forEach((hit, index) => {
                                const item = hit.Item;
                                if (item) {
                                    console.log(`   ${index + 1}. ${item.Name}`);
                                    console.log(`      价格: ${item.Price}`);
                                    console.log(`      URL: ${item.Url}`);
                                    if (item.Image && item.Image.Medium) {
                                        console.log(`      图片: ${item.Image.Medium}`);
                                    }
                                    console.log('');
                                }
                            });
                        }
                    } else {
                        console.log('⚠️  未知的响应结构');
                        console.log('   响应中的键:', Object.keys(json));
                    }
                    
                    resolve(json);
                } catch (error) {
                    console.log('❌ JSON解析失败:', error.message);
                    console.log('   原始数据:', data);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ HTTP请求失败:', error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ 请求超时');
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// 运行测试
testYahooAPI()
    .then(result => {
        console.log('\n🎉 Yahoo API测试完成');
        if (result.hits && result.hits.length > 0) {
            console.log('✅ Yahoo API工作正常，可以获取商品数据');
        } else if (result.Error) {
            console.log('❌ Yahoo API存在问题，需要检查配置');
        } else {
            console.log('⚠️  Yahoo API返回空结果，可能需要调整搜索参数');
        }
    })
    .catch(error => {
        console.log('\n💥 Yahoo API测试失败:', error.message);
    });