#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_SRC = path.join(__dirname, '../packages/extension');
const EXTENSION_DIST = path.join(__dirname, '../packages/extension/dist');

// Files to copy from src to dist
const SRC_FILES = [
  'background.js',
  'content.js',
  'popup.js',
  'options.js',
  'offscreen.js'
];

// Files to copy from public to dist
const PUBLIC_FILES = [
  'manifest.json',
  'popup.html',
  'options.html',
  'offscreen.html'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  console.log(`✓ Copied: ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dest)}`);
}

function copyDirectory(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function buildExtension() {
  console.log('🔨 Building extension...');
  
  // Clean dist directory
  if (fs.existsSync(EXTENSION_DIST)) {
    fs.rmSync(EXTENSION_DIST, { recursive: true, force: true });
  }
  
  // Copy source files
  for (const file of SRC_FILES) {
    const srcPath = path.join(EXTENSION_SRC, 'src', file);
    const destPath = path.join(EXTENSION_DIST, file);
    
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    } else {
      console.warn(`⚠️  Warning: Source file not found: ${srcPath}`);
    }
  }
  
  // Copy public files
  for (const file of PUBLIC_FILES) {
    const srcPath = path.join(EXTENSION_SRC, 'public', file);
    const destPath = path.join(EXTENSION_DIST, file);
    
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    } else {
      console.warn(`⚠️  Warning: Public file not found: ${srcPath}`);
    }
  }
  
  // Copy icons directory
  const iconsSrc = path.join(EXTENSION_SRC, 'public', 'icons');
  const iconsDest = path.join(EXTENSION_DIST, 'icons');
  
  if (fs.existsSync(iconsSrc)) {
    copyDirectory(iconsSrc, iconsDest);
  } else {
    console.warn(`⚠️  Warning: Icons directory not found: ${iconsSrc}`);
  }
  
  console.log('✅ Extension build complete!');
  console.log(`📁 Output directory: ${path.relative(process.cwd(), EXTENSION_DIST)}`);
}

// Check if --watch flag is provided
const isWatch = process.argv.includes('--watch');

if (isWatch) {
  console.log('👀 Watching for changes...');
  buildExtension();
  
  // Watch for changes in src and public directories
  const srcDir = path.join(EXTENSION_SRC, 'src');
  const publicDir = path.join(EXTENSION_SRC, 'public');
  
  [srcDir, publicDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        console.log(`🔄 File changed: ${filename}`);
        buildExtension();
      });
    }
  });
  
  console.log('Press Ctrl+C to stop watching');
} else {
  buildExtension();
}
