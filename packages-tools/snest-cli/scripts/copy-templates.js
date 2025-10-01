const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.resolve(rootDir, 'src/templates');
const outputDir = path.resolve(rootDir, 'dist/templates');

if (!fs.existsSync(templatesDir)) {
  process.exit(0);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const copyRecursive = (source, destination) => {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.copyFileSync(source, destination);
};

copyRecursive(templatesDir, outputDir);