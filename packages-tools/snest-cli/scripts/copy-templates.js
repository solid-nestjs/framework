const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.resolve(rootDir, 'src/templates');
const outputDir = path.resolve(rootDir, 'dist/templates');
const schemasDir = path.resolve(rootDir, 'schemas');

// Copy templates
if (fs.existsSync(templatesDir)) {
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
}

// Copy schema to bundles
if (fs.existsSync(schemasDir)) {
  const bundles = [
    path.resolve(rootDir, '../../packages-bundles/typeorm-crud'),
    path.resolve(rootDir, '../../packages-bundles/typeorm-graphql-crud'),
    path.resolve(rootDir, '../../packages-bundles/typeorm-hybrid-crud'),
  ];

  for (const bundle of bundles) {
    const bundleSchemasDir = path.join(bundle, 'schemas');
    fs.mkdirSync(bundleSchemasDir, { recursive: true });

    const schemaFile = path.join(schemasDir, 'snest.config.json');
    const bundleSchemaFile = path.join(bundleSchemasDir, 'snest.config.json');

    if (fs.existsSync(schemaFile)) {
      fs.copyFileSync(schemaFile, bundleSchemaFile);
      console.log(`Copied schema to ${path.relative(rootDir, bundle)}`);
    }
  }
}
