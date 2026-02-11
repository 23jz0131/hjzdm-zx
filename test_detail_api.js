const axios = require('axios');

async function testDetail() {
  try {
    const loginRes = await axios.post('http://localhost:9090/user/login', {
      username: 'testuser3',
      password: '123123'
    });
    const token = loginRes.data.data.token;
    
    // 获取第一个待审核投稿的ID
    const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
      pageNum: 1,
      pageSize: 1
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (pendingRes.data.data && pendingRes.data.data.length > 0) {
      const disclosureId = pendingRes.data.data[0].disclosureId;
      console.log('测试投稿ID:', disclosureId);
      
      // 测试详情接口
      const detailRes = await axios.get(`http://localhost:9090/disclosure/detail?disclosureId=${disclosureId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('详情接口响应状态:', detailRes.status);
      console.log('详情接口响应数据:', detailRes.data);
    }
  } catch (error) {
    console.log('错误:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

testDetail();