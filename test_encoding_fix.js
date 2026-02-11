const http = require('http');

console.log('🔍 测试字符编码修复效果...\n');

function testEncodingFix() {
    console.log('🚀 发送包含中文关键词的测试请求');
    
    const postData = JSON.stringify({
        query: '任天堂 Switch'  // 使用包含中文的关键词测试编码
    });

    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/compare',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 HTTP响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📦 响应解析成功');
                console.log('📊 响应码:', jsonData.code);
                console.log('📈 返回数据项数:', jsonData.data ? jsonData.data.length : 0);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`\n🛒 商品组名称: ${group.goodsName}`);
                    console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                    
                    // 检查商品名称是否正常显示
                    console.log('\n📋 商品名称检查:');
                    let encodingIssues = 0;
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        group.goodsList.forEach((item, index) => {
                            const itemName = item.goodsName;
                            console.log(`${index + 1}. [${item.mallType === 10 ? '乐天' : item.mallType === 20 ? 'Yahoo' : '其他'}] ${itemName.substring(0, 50)}...`);
                            
                            // 检查是否包含乱码字符
                            if (itemName.includes('') || itemName.includes('ï¿½') || itemName.includes('ã') || itemName.includes('è')) {
                                console.log('   ⚠️  发现可能的乱码字符');
                                encodingIssues++;
                            }
                        });
                        
                        if (encodingIssues === 0) {
                            console.log('\n✅ 字符编码正常，未发现乱码问题！');
                        } else {
                            console.log(`\n❌ 发现 ${encodingIssues} 个可能的编码问题`);
                        }
                    }
                } else {
                    console.log('❌ 未返回有效的商品数据');
                }
                
            } catch (error) {
                console.error('❌ 解析响应失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
    
    // 提示检查后端日志
    setTimeout(() => {
        console.log('\n📋 请同时检查后端日志，应该能看到:');
        console.log('   - "Yahoo API 响应长度: X 字符"');
        console.log('   - "添加Yahoo商品: 正常的中文商品名称 - ¥XXXXX"');
        console.log('   - "乐天搜索返回 X 个商品"');
    }, 2000);
}

// 执行测试
testEncodingFix();