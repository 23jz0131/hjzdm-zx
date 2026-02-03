// API响应格式分析测试
console.log('=== API响应格式分析 ===');

// 模拟从控制台日志中看到的响应结构
const sampleApiResponse = {
  data: {
    code: 0,  // 注意：这里是0而不是200
    message: undefined,
    data: {
      id: "30001",
      openid: "123456789@gmail.com",
      nickname: "test1",
      name: "testuser1",
      createTime: "2026-01-26 16:01:44"
    }
  },
  status: 200,
  statusText: "",
  headers: {},
  config: {}
};

console.log('样本API响应:', sampleApiResponse);
console.log('响应数据分析:');
console.log('- 状态码:', sampleApiResponse.status);
console.log('- 数据code:', sampleApiResponse.data.code);
console.log('- 是否有用户数据:', !!sampleApiResponse.data.data);
console.log('- 用户数据内容:', sampleApiResponse.data.data);

// 测试不同的成功判断条件
console.log('\n=== 成功判断逻辑测试 ===');
const successCodes = [200, 0, '200', '0'];
const testData = sampleApiResponse.data;

console.log('传统判断 (code === 200):', testData.code === 200);
console.log('改进判断 (包含0):', successCodes.includes(testData.code));
console.log('备用判断 (无code但有data):', testData.code === undefined && testData.data);

console.log('\n=== 修复建议 ===');
console.log('1. 修改成功判断逻辑，接受code为0的情况');
console.log('2. 增强数据结构兼容性处理');
console.log('3. 添加更详细的调试日志');

console.log('\n=== 预期行为 ===');
console.log('✅ API响应code为0时应该被视为成功');
console.log('✅ 能够正确解析data.data中的用户信息');
console.log('✅ 页面正常显示用户数据而不是模拟数据');