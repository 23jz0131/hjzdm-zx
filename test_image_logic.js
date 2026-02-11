// 模拟Yahoo API返回的数据结构来测试图片URL处理逻辑
const testData = {
    "hits": [
        {
            "name": "テスト商品",
            "price": "2980",
            "url": "https://test.example.com",
            "image": {
                "small": "https://item-shopping.c.yimg.jp/i/c/test_small",
                "medium": "https://item-shopping.c.yimg.jp/i/g/test_medium"
            }
        },
        {
            "name": "別の商品",
            "price": "1500",
            "url": "https://test2.example.com",
            "image": "https://direct-image-url.com/image.jpg"
        }
    ]
};

console.log('=== 测试Yahoo图片URL处理逻辑 ===\n');

testData.hits.forEach((hit, index) => {
    console.log(`商品 ${index + 1}: ${hit.name}`);
    
    // 模拟修改后的Java处理逻辑
    let imgUrl = "";
    if (hit.image) {
        if (typeof hit.image === 'object') {
            // image是JSONObject对象，包含small和medium字段
            imgUrl = hit.image.medium || hit.image.small || '';
            console.log('  图片对象内容:', JSON.stringify(hit.image));
            console.log('  提取的medium URL:', hit.image.medium);
            console.log('  提取的small URL:', hit.image.small);
        } else if (typeof hit.image === 'string') {
            // 如果是字符串格式
            imgUrl = hit.image;
            console.log('  直接图片URL:', hit.image);
        }
    }
    
    console.log('  最终处理的图片URL:', imgUrl);
    console.log('  URL是否有效:', imgUrl && imgUrl.includes('http') ? '✓' : '✗');
    console.log('');
});