const fs = require('fs');
const s = fs.readFileSync('views/products.ejs', 'utf8');
const matches = s.match(/<%[\s\S]*?%>/g) || [];
const totalOpen = matches.reduce((sum, m) => sum + ((m.match(/{/g) || []).length), 0);
const totalClose = matches.reduce((sum, m) => sum + ((m.match(/}/g) || []).length), 0);
console.log('totalOpen', totalOpen, 'totalClose', totalClose);
console.log('scriptlet count', matches.length);
matches.forEach((m, i) => {
    const opens = (m.match(/{/g) || []).length;
    const closes = (m.match(/}/g) || []).length;
    if (opens !== closes) console.log('scriptlet', i + 1, 'opens', opens, 'closes', closes, m.slice(0, 120).replace(/\n/g, ' '));
});