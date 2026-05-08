function normalizeSellerDomain(rawValue) {
    let d = String(rawValue || '').trim();
    d = d.replace(/^https?:\/\//i, '');
    d = d.split('/')[0];
    return d;
}

console.log('Test 1 (with http):', normalizeSellerDomain('http://127.0.0.1:5000'));
console.log('Test 2 (with https):', normalizeSellerDomain('https://example.com/path'));
console.log('Test 3 (without):', normalizeSellerDomain('example.com'));
