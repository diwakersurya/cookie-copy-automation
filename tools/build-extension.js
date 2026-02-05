#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_SRC = path.join(__dirname, '../packages/extension');
const EXTENSION_DIST = path.join(__dirname, '../packages/extension/dist');

// JS entrypoints to bundle from src to dist
const SRC_BUNDLES = [
  { file: 'background.js', format: 'esm' },
  { file: 'popup.js', format: 'esm' },
  { file: 'options.js', format: 'esm' },
  { file: 'offscreen.js', format: 'esm' },
  // Content scripts are not loaded as modules from the manifest.
  // We bundle to an IIFE so it can run as a classic script.
  { file: 'content.js', format: 'iife' }
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

async function bundleJs() {
  for (const { file, format } of SRC_BUNDLES) {
    const entry = path.join(EXTENSION_SRC, 'src', file);
    const out = path.join(EXTENSION_DIST, file);
    ensureDir(path.dirname(out));

    if (!fs.existsSync(entry)) {
      console.warn(`⚠️  Warning: Source file not found: ${entry}`);
      continue;
    }

    await esbuild.build({
      entryPoints: [entry],
      outfile: out,
      bundle: true,
      platform: 'browser',
      target: ['chrome114'],
      format,
      sourcemap: false,
      minify: false,
      logLevel: 'silent'
    });

    console.log(`✓ Bundled: ${path.relative(process.cwd(), entry)} → ${path.relative(process.cwd(), out)}`);
  }
}

async function buildExtension() {
  console.log('🔨 Building extension...');
  
  // Clean dist directory
  if (fs.existsSync(EXTENSION_DIST)) {
    fs.rmSync(EXTENSION_DIST, { recursive: true, force: true });
  }
  
  // Bundle JS entrypoints
  await bundleJs();
  
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
  await buildExtension();
  
  // Watch for changes in src and public directories
  const srcDir = path.join(EXTENSION_SRC, 'src');
  const publicDir = path.join(EXTENSION_SRC, 'public');
  
  let building = false;
  let pending = false;
  const scheduleBuild = async () => {
    if (building) {
      pending = true;
      return;
    }
    building = true;
    try {
      await buildExtension();
    } finally {
      building = false;
      if (pending) {
        pending = false;
        scheduleBuild();
      }
    }
  };

  [srcDir, publicDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        console.log(`🔄 File changed: ${filename}`);
        scheduleBuild();
      });
    }
  });
  
  console.log('Press Ctrl+C to stop watching');
} else {
  await buildExtension();
}
