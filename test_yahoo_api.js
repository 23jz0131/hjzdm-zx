const axios = require('axios');

async function testYahooAPI() {
    console.log('🔍 测试雅虎API集成...');
    
    try {
        // 测试基本连接
        const response = await axios.get('http://localhost:9090/api/goods/search?keyword=手机&page=1&size=10');
        
        console.log('✅ API响应状态:', response.status);
        console.log('📦 返回商品数量:', response.data.content?.length || 0);
        
        // 检查是否有雅虎商品
        const yahooProducts = response.data.content?.filter(item => 
            item.source === 'YAHOO'
        ) || [];
        
        console.log('📊 雅虎商品数量:', yahooProducts.length);
        
        if (yahooProducts.length > 0) {
            console.log('✨ 雅虎API集成成功！');
            console.log('📱 示例商品:');
            yahooProducts.slice(0, 3).forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - ¥${product.price}`);
            });
        } else {
            console.log('⚠️  未找到雅虎商品，可能需要检查配置');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('📋 错误详情:', error.response.data);
        }
    }
}

testYahooAPI();