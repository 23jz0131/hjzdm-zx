// 简单的测试脚本，用于验证个人信息更新功能
console.log('开始测试个人信息更新功能...');

// 模拟前端发送的请求数据
const testData = {
    nickname: '测试昵称' + Date.now(),
    gender: 1,
    birthDate: '1990-01-01'
};

console.log('测试数据:', testData);

// 模拟前端请求头
const headers = {
    'Content-Type': 'application/json',
    // 注意：实际使用时需要有效的JWT token
    'Authorization': 'Bearer your-jwt-token-here'
};

console.log('请求头:', headers);

// 验证数据格式
console.log('\n=== 数据验证 ===');
console.log('昵称类型:', typeof testData.nickname);
console.log('性别类型:', typeof testData.gender);
console.log('生日类型:', typeof testData.birthDate);
console.log('生日格式验证:', /^\d{4}-\d{2}-\d{2}$/.test(testData.birthDate));

console.log('\n=== 建议的调试步骤 ===');
console.log('1. 在浏览器开发者工具中检查实际发送的请求');
console.log('2. 确认JWT token是否有效且正确格式化');
console.log('3. 检查请求体是否正确序列化为JSON');
console.log('4. 验证Content-Type是否为application/json');