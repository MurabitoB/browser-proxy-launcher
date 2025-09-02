#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function updateVersion(filePath, currentVersion, newVersion) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(
    new RegExp(currentVersion.replace(/\./g, '\\.'), 'g'),
    newVersion
  );
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated ${filePath}: ${currentVersion} → ${newVersion}`);
}

function bumpVersion() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node bump_version.js <new_version>');
    console.log('Example: node bump_version.js 0.1.4');
    process.exit(1);
  }
  
  const newVersion = args[0];
  
  // Validate version format (basic semver check)
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('Error: Version must be in format x.y.z (e.g., 0.1.4)');
    process.exit(1);
  }
  
  // Read current version from package.json
  const packageJsonPath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
  
  try {
    // Files to update
    const filesToUpdate = [
      './package.json',
      './src/app/about/page.tsx',
      './src-tauri/Cargo.toml',
      './src-tauri/tauri.conf.json'
    ];
    
    // Update each file
    filesToUpdate.forEach(file => {
      if (fs.existsSync(file)) {
        updateVersion(file, currentVersion, newVersion);
      } else {
        console.warn(`Warning: File ${file} not found, skipping...`);
      }
    });
    
    console.log('\n✅ Version bump completed successfully!');
    console.log(`\nNext steps:`);
    console.log(`1. Review changes: git diff`);
    console.log(`2. Commit changes: git add . && git commit -m "bump: version ${newVersion}"`);
    console.log(`3. Create tag: git tag v${newVersion}`);
    
  } catch (error) {
    console.error('Error during version bump:', error.message);
    process.exit(1);
  }
}

bumpVersion();