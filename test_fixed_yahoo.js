const axios = require('axios');

async function testFixedYahooSearch() {
    console.log('=== 测试修复后的Yahoo搜索功能 ===\n');
    
    const baseUrl = 'http://localhost:9090';
    
    try {
        // 测试Yahoo搜索功能
        console.log('测试Yahoo搜索功能...');
        const searchQuery = 'ノートパソコン';
        console.log(`搜索关键词: ${searchQuery}`);
        
        const startTime = Date.now();
        const response = await axios.post(`${baseUrl}/goods/compare`, {
            query: searchQuery
        }, {
            timeout: 15000
        });
        const endTime = Date.now();
        
        console.log(`\n响应时间: ${endTime - startTime}ms`);
        console.log(`HTTP状态码: ${response.status}`);
        
        if (response.data && response.data.code === 200 && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            console.log(`\n✅ 找到 ${response.data.data.length} 个商品组`);
            
            // 详细分析每个商品组的数据
            let totalItems = 0;
            const platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
            
            response.data.data.forEach((group, groupIndex) => {
                if (group.goodsList && Array.isArray(group.goodsList)) {
                    totalItems += group.goodsList.length;
                    group.goodsList.forEach(item => {
                        if (item.mallType === 10) platformStats[10]++;
                        else if (item.mallType === 20) platformStats[20]++;
                        else if (item.mallType === 40) platformStats[40]++;
                        else platformStats.other++;
                    });
                }
            });
            
            console.log('\n平台分布统计:');
            console.log(`总计商品项数: ${totalItems}`);
            console.log(`乐天 (10): ${platformStats[10]} 个`);
            console.log(`Yahoo (20): ${platformStats[20]} 个`);
            console.log(`Amazon (40): ${platformStats[40]} 个`);
            console.log(`其他: ${platformStats.other} 个`);
            
            if (platformStats[20] > 0) {
                console.log('\n🎉 成功！Yahoo搜索功能已修复并正常工作！');
                console.log('\nYahoo商品详情:');
                response.data.data.forEach((group, groupIndex) => {
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        const yahooItems = group.goodsList.filter(item => item.mallType === 20);
                        if (yahooItems.length > 0) {
                            console.log(`\n商品组 ${groupIndex + 1}: ${group.goodsName}`);
                            yahooItems.forEach((item, itemIndex) => {
                                console.log(`  ${itemIndex + 1}. [Yahoo] ${item.goodsName || '未知商品'}`);
                                console.log(`     价格: ¥${item.goodsPrice}`);
                                console.log(`     链接: ${item.goodsLink ? item.goodsLink.substring(0, 50) + '...' : '无'}`);
                            });
                        }
                    }
                });
            } else {
                console.log('\n⚠️  未找到Yahoo商品');
                console.log('这可能是因为:');
                console.log('1. 搜索关键词在Yahoo上没有匹配结果');
                console.log('2. Yahoo API配置仍有问题');
                console.log('3. Yahoo搜索功能虽然启用但未返回数据');
                
                console.log('\n前3个商品组预览:');
                response.data.data.slice(0, 3).forEach((group, index) => {
                    console.log(`\n${index + 1}. ${group.goodsName}`);
                    console.log(`   最低价格: ¥${group.lowestPrice}`);
                    console.log(`   最低平台: ${group.lowestPlatform}`);
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        console.log(`   商品数量: ${group.goodsList.length}`);
                    }
                });
            }
        } else {
            console.log('❌ 未找到任何商品');
            console.log('响应数据:', response.data);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:');
        if (error.response) {
            console.error(`HTTP错误: ${error.response.status}`);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('网络错误: 无法连接到后端服务');
        } else {
            console.error('其他错误:', error.message);
        }
    }
}

// 运行测试
testFixedYahooSearch();