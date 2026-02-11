const axios = require('axios');

// 使用真实的Yahoo API参数
const YAHOO_APP_ID = 'KRZLBo4iST';
const YAHOO_SECRET = 'MWI0MD4MTRkNGI2MGI2MDI4MAjZA';

async function testYahooAPIWithRealKeys() {
    console.log('🔍 测试真实的Yahoo API配置');
    console.log('AppID:', YAHOO_APP_ID);
    console.log('Secret长度:', YAHOO_SECRET.length);
    
    const testKeyword = '手机';
    const yahooApiUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';
    
    try {
        console.log(`\n📱 搜索关键词: ${testKeyword}`);
        
        // 构建请求参数
        const params = {
            appid: YAHOO_APP_ID,
            query: testKeyword,
            version: '202507',
            hits: 10,
            availability: 1,
            affiliate_type: 'vc',
            response_format: 'json'
        };
        
        console.log('请求参数:', params);
        
        // 构建完整URL
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        const fullUrl = `${yahooApiUrl}?${queryString}`;
        
        console.log('完整请求URL:', fullUrl);
        
        // 发送请求
        const response = await axios.get(fullUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('\n✅ 请求成功!');
        console.log('HTTP状态码:', response.status);
        console.log('响应头:', response.headers['content-type']);
        
        // 分析响应
        const data = response.data;
        console.log('\n📊 响应数据分析:');
        console.log('响应类型:', typeof data);
        
        if (typeof data === 'object') {
            console.log('顶层键:', Object.keys(data));
            
            // 检查常见的响应结构
            if (data.ResultSet && data.ResultSet.Result) {
                console.log('✅ 找到ResultSet.Result结构');
                console.log('商品数量:', data.ResultSet.Result.length);
                
                if (data.ResultSet.Result.length > 0) {
                    const firstItem = data.ResultSet.Result[0];
                    console.log('\n第一个商品示例:');
                    console.log('- 名称:', firstItem.Name || 'N/A');
                    console.log('- 价格:', firstItem.Price?._value || firstItem.Price || 'N/A');
                    console.log('- URL:', firstItem.Url?._value || firstItem.Url || 'N/A');
                    console.log('- 图片:', firstItem.Image?.Medium?._value || 'N/A');
                }
            } else if (data.hits) {
                console.log('✅ 找到hits结构');
                console.log('商品数量:', data.hits.length);
            } else if (data.Error) {
                console.log('❌ API返回错误:');
                console.log('错误代码:', data.Error.Code);
                console.log('错误消息:', data.Error.Message);
            } else {
                console.log('⚠️ 未知的响应结构');
                console.log('完整响应预览:', JSON.stringify(data, null, 2).substring(0, 500));
            }
        }
        
        return data;
        
    } catch (error) {
        console.log('\n❌ 请求失败:');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('响应数据:', error.response.data);
            console.log('响应头:', error.response.headers);
        } else if (error.request) {
            console.log('无响应 received');
            console.log('错误详情:', error.message);
        } else {
            console.log('请求配置错误:', error.message);
        }
        return null;
    }
}

// 运行测试
testYahooAPIWithRealKeys().then(result => {
    if (result) {
        console.log('\n🎉 Yahoo API测试完成');
    } else {
        console.log('\n💥 Yahoo API测试失败');
    }
}).catch(error => {
    console.error('测试过程中出现异常:', error);
});