const http = require('http');

const data = JSON.stringify({
  query: 'iphone'
});

const options = {
  hostname: 'localhost',
  port: 9090,
  path: '/goods/compare',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Total items:', json.data.length);
      
      let amazonCount = 0;
      let rakutenCount = 0;
      let yahooCount = 0;
      let unknownCount = 0;

      // The structure is list of CompareGroupDTO, each has a list of goods
      json.data.forEach(group => {
          if (group.goodsList) {
              group.goodsList.forEach(goods => {
                  if (goods.mallType === 40) {
                      amazonCount++;
                      console.log('Amazon Item Found:', goods.goodsName);
                  }
                  else if (goods.mallType === 10) rakutenCount++;
                  else if (goods.mallType === 20) yahooCount++;
                  else unknownCount++;
              });
          }
      });

      console.log('Amazon items:', amazonCount);
      console.log('Rakuten items:', rakutenCount);
      console.log('Yahoo items:', yahooCount);
      console.log('Unknown items:', unknownCount);

      if (amazonCount > 0) {
          console.log('SUCCESS: Amazon data found!');
      } else {
          console.log('FAILURE: No Amazon data found.');
      }

    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw body:', body.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
