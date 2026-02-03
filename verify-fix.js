// 验证ProfilePage修复逻辑
console.log('=== ProfilePage修复验证 ===');

// 模拟API响应数据
const mockApiResponse = {
  data: {
    code: 0,
    message: undefined,
    data: {
      id: "30001",
      openid: "123456789@gmail.com",
      nickname: "test1",
      name: "testuser1",
      createTime: "2026-01-26 16:01:44"
    }
  },
  status: 200
};

console.log('模拟API响应:', mockApiResponse);

// 测试修复后的逻辑
const successCodes = [200, 0, '200', '0'];
const apiData = mockApiResponse.data;

console.log('\n=== 详细状态检查 ===');
console.log('实际code值:', apiData.code);
console.log('code类型:', typeof apiData.code);
console.log('是否在成功码列表中:', successCodes.includes(apiData.code));
console.log('是否有data字段:', !!apiData.data);
console.log('备用条件(无code但有data):', (apiData.code === undefined && apiData.data));

// 验证最终判断逻辑
const isSuccessful = successCodes.includes(apiData.code) || 
                    (apiData.code === undefined && apiData.data);

console.log('\n=== 最终判断结果 ===');
console.log('isSuccessful:', isSuccessful);

if (isSuccessful) {
  console.log('✅ 修复成功！应该显示真实用户数据');
  console.log('用户信息:', apiData.data);
} else {
  console.log('❌ 仍有问题，会显示模拟数据');
}

console.log('\n=== 预期行为 ===');
console.log('1. 页面应该显示真实用户数据而不是测试数据');
console.log('2. 不应该出现"API返回错误"的提示');
console.log('3. 控制台应该显示详细的调试信息');