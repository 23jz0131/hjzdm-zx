const https = require('https');

const appId = '1065081596741280321';
const affiliateId = '4f0e084a.2fb02d14.4f0e084b.3ecf281e';
const keyword = 'iphone';
const encodedKeyword = encodeURIComponent(keyword);

const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&affiliateId=${affiliateId}&keyword=${encodedKeyword}&hits=10&format=json`;

console.log('Requesting URL:', url);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.Items && json.Items.length > 0) {
                console.log(`Success! Found ${json.Items.length} items.`);
                console.log('First Item:', json.Items[0].Item.itemName);
            } else {
                console.log('Response JSON:', JSON.stringify(json, null, 2));
                console.log('No items found.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw Data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
