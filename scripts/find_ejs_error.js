const fs = require('fs');
const ejs = require('ejs');
const path = 'views/products.ejs';
const s = fs.readFileSync(path, 'utf8');
const lines = s.split(/\r?\n/);
let low = 1,
    high = lines.length,
    ans = 0;
while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    const src = lines.slice(0, mid).join('\n');
    try {
        ejs.compile(src, { filename: path });
        ans = mid;
        low = mid + 1;
    } catch (e) {
        high = mid - 1;
    }
}
console.log('last good line', ans);
console.log('next line content:\n', lines[ans] || 'EOF');

// show compiled client function for the last good chunk
try {
    const goodSrc = lines.slice(0, ans).join('\n');
    const fnSrc = ejs.compile(goodSrc, { filename: path, client: true });
    console.log('\n--- compiled function (truncated) ---\n', fnSrc.slice(0, 2000));
} catch (err) {
    console.error('failed to compile good chunk:', err && err.message);
}

console.log('\n--- next 10 lines ---');
console.log(lines.slice(ans, ans + 10).join('\n'));