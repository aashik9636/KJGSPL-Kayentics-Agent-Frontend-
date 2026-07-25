const fs = require('fs');
const path = require('path');

function replaceImports(filePath, levelsToAdd) {
  let content = fs.readFileSync(filePath, 'utf8');
  let dotsToAdd = Array(levelsToAdd).fill('..').join('/') + '/';
  
  // Replace all `../` with `../../` etc. based on levelsToAdd
  content = content.replace(/from\s+['"]((?:\.\.\/)+)([^'"]+)['"]/g, (match, dots, rest) => {
    return `from '${dots}${dotsToAdd}${rest}'`;
  });
  content = content.replace(/import\s+['"]((?:\.\.\/)+)([^'"]+)['"]/g, (match, dots, rest) => {
    return `import '${dots}${dotsToAdd}${rest}'`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Chat components: moved from src/pages/Chat/components (3 levels) to src/pages/Brain/AgentsChat/components (4 levels) -> Add 1 level
const chatComponents = fs.readdirSync(path.join(__dirname, 'src/pages/Brain/AgentsChat/components')).filter(f => f.endsWith('.jsx'));
chatComponents.forEach(file => {
  replaceImports(path.join(__dirname, 'src/pages/Brain/AgentsChat/components', file), 1);
});

// 2. Knowledge components: moved from src/components/knowledge (3 levels) to src/pages/Brain/KnowledgeBase/components (5 levels) -> Add 2 levels
const knowledgeComponents = fs.readdirSync(path.join(__dirname, 'src/pages/Brain/KnowledgeBase/components')).filter(f => f.endsWith('.jsx'));
knowledgeComponents.forEach(file => {
  replaceImports(path.join(__dirname, 'src/pages/Brain/KnowledgeBase/components', file), 2);
});
