const fs = require('fs');
const path = require('path');

function replaceImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Match `from '../something'` and replace with `from '../../something'`
  content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, "from '../../$1'");
  // Match `import '../something'` and replace with `import '../../something'`
  content = content.replace(/import\s+['"]\.\.\/([^'"]+)['"]/g, "import '../../$1'");
  fs.writeFileSync(filePath, content, 'utf8');
}

// Pages that moved one level deeper:
const filesToUpdate = [
  'src/pages/auth/Login.jsx',
  'src/pages/auth/Signup.jsx',
  'src/pages/auth/ResetPassword.jsx',
  'src/pages/auth/NewPassword.jsx',
  'src/pages/auth/VerifyEmail.jsx',
  'src/pages/Dashboard/index.jsx',
  'src/pages/Integrations/index.jsx',
  'src/routes/guards/ProtectedRoute.jsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    replaceImports(fullPath);
    console.log(`Updated imports in ${file}`);
  }
});
