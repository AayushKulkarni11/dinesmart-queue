const fs = require('fs');
const path = require('path');

function checkImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const absoluteImportPath = path.resolve(path.dirname(fullPath), importPath);
          // Check if file exists exactly with this case
          const dirPath = path.dirname(absoluteImportPath);
          const baseName = path.basename(absoluteImportPath);
          
          if (fs.existsSync(dirPath)) {
            const actualFiles = fs.readdirSync(dirPath);
            // We need to see if baseName matches exactly any file, or baseName + .ts, .tsx
            const matchesExact = actualFiles.some(f => 
              f === baseName || 
              f === baseName + '.ts' || 
              f === baseName + '.tsx' || 
              f === baseName + '/index.ts' ||
              f === baseName + '/index.tsx'
            );
            if (!matchesExact) {
              console.log(`CASE MISMATCH OR MISSING: ${importPath} in ${fullPath}`);
            }
          }
        }
      }
    }
  }
}
checkImports('./src');
console.log('Case check complete.');
