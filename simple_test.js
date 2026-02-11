const https = require('https');

const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
const keyword = encodeURIComponent('ノートパソコン');
const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${keyword}&hits=3`;

console.log('URL:', url);

const req = https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Results:', json.totalResultsAvailable);
            if (json.hits && json.hits.length > 0) {
                console.log('First item:', json.hits[0].name);
            }
        } catch(e) {
            console.log('Error parsing:', e.message);
        }
    });
});

req.on('error', (e) => console.log('Error:', e.message));
req.end();