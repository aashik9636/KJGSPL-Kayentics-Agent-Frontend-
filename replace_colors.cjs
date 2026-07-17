const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace old blue hex with dark grey
  content = content.replace(/#0d47a1/g, '#1a1a1a');
  // Replace hover states
  content = content.replace(/hover:bg-blue-800/g, 'hover:bg-black');
  // Replace disabled states
  content = content.replace(/disabled:bg-blue-400/g, 'disabled:bg-gray-400');
  
  // Replace blue shadow with gray shadow
  content = content.replace(/shadow-blue-900\/20/g, 'shadow-black/20');
  content = content.replace(/shadow-blue-900\/10/g, 'shadow-black/10');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Replaced colors in ${changedCount} files.`);
