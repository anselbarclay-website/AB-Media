const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content', 'originals');
const files = fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort();
fs.writeFileSync(path.join(__dirname, '..', 'content', 'originals-index.json'), JSON.stringify(files.map(name => '/content/originals/' + name), null, 2) + '\n');
console.log(`Indexed ${files.length} original film(s).`);
