const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 9090,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function test() {
    const data = JSON.stringify({ query: 'iphone' });

    console.log('--- Testing /goods/search (Rakuten Only) ---');
    try {
        const res1 = await post('/goods/search', data);
        console.log(`Status: ${res1.statusCode}`);
        if (res1.statusCode === 200) {
            const json = JSON.parse(res1.body);
            if (json.code === 200) {
                console.log(`Success! Found ${json.data ? json.data.length : 0} items.`);
            } else {
                console.log('API Error:', json.msg);
            }
        } else {
            console.log('HTTP Error:', res1.body);
        }
    } catch (e) {
        console.error('Request Failed:', e.message);
    }

    console.log('\n--- Testing /goods/compare (Rakuten + Yahoo) ---');
    try {
        const res2 = await post('/goods/compare', data);
        console.log(`Status: ${res2.statusCode}`);
        if (res2.statusCode === 200) {
            const json = JSON.parse(res2.body);
            if (json.code === 200) {
                console.log(`Success! Found ${json.data ? json.data.length : 0} groups.`);
                if (json.data && json.data.length > 0) {
                     const first = json.data[0];
                     console.log('First Item Keys:', Object.keys(first));
                     console.log('First Item Name:', first.goodsName || first.goods_name);
                     const list = first.goodsList || first.goods_list;
                     if (list) {
                        console.log('Platforms:', list.map(g => g.mallType === 10 ? 'Rakuten' : (g.mallType === 20 ? 'Yahoo' : 'Unknown')));
                     }
                }
            } else {
                console.log('API Error:', json.msg);
            }
        } else {
            console.log('HTTP Error:', res2.body);
        }
    } catch (e) {
        console.error('Request Failed:', e.message);
    }
}

test();
