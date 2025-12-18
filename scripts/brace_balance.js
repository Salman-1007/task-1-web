const fs = require('fs');
const s = fs.readFileSync('views/products.ejs', 'utf8');
const regex = /<%[\s\S]*?%>/g;
let m;
let idx = 0;
let cum = 0;
const arr = [];
while (m = regex.exec(s)) {
    idx++;
    const code = m[0];
    const opens = (code.match(/{/g) || []).length;
    const closes = (code.match(/}/g) || []).length;
    cum += (opens - closes);
    const start = m.index;
    const line = s.slice(0, start).split(/\r?\n/).length;
    arr.push({ idx, opens, closes, cum, line, code: code.slice(0, 120).replace(/\n/g, ' ') });
}
arr.forEach(a => {
    console.log('slot', a.idx, 'line', a.line, 'opens', a.opens, 'closes', a.closes, 'cum', a.cum, 'snippet', a.code);
});
console.log('final cum', cum);