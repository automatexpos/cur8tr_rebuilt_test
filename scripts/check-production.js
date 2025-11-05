#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Run this before deploying to Vercel to catch potential issues
 * 
 * Usage: node scripts/check-production.js
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

let hasErrors = false;
let hasWarnings = false;

function error(message) {
  console.error('❌ ERROR:', message);
  hasErrors = true;
}

function warn(message) {
  console.warn('⚠️  WARNING:', message);
  hasWarnings = true;
}

function success(message) {
  console.log('✅', message);
}

function info(message) {
  console.log('ℹ️ ', message);
}

console.log('\n🔍 Running Production Readiness Checks...\n');

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/index.js',
  'vite.config.ts',
  'tsconfig.json',
  '.env.example',
  '.env.production.example',
  '.vercelignore',
];

requiredFiles.forEach(file => {
  const filePath = resolve(rootDir, file);
  if (existsSync(filePath)) {
    success(`${file} exists`);
  } else {
    error(`Missing required file: ${file}`);
  }
});

// Check 2: .env file should not be committed
console.log('\n🔒 Checking security...');
if (existsSync(resolve(rootDir, '.env'))) {
  warn('.env file exists locally (make sure it\'s in .gitignore)');
  
  const gitignore = readFileSync(resolve(rootDir, '.gitignore'), 'utf8');
  if (gitignore.includes('.env')) {
    success('.env is in .gitignore');
  } else {
    error('.env is NOT in .gitignore - security risk!');
  }
}

// Check 3: package.json validation
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
  
  if (pkg.scripts?.build) {
    success('Build script exists');
  } else {
    error('Missing build script in package.json');
  }
  
  if (pkg.scripts?.['vercel-build']) {
    success('vercel-build script exists');
  } else {
    warn('No vercel-build script (Vercel will use "build" instead)');
  }
  
  if (pkg.type === 'module') {
    success('ESM modules configured');
  } else {
    warn('Not using ESM modules');
  }
  
  // Check critical dependencies
  const criticalDeps = [
    'express',
    'drizzle-orm',
    'postgres',
    '@supabase/supabase-js',
    'react',
    'vite'
  ];
  
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  criticalDeps.forEach(dep => {
    if (allDeps[dep]) {
      success(`${dep} installed`);
    } else {
      error(`Missing critical dependency: ${dep}`);
    }
  });
  
} catch (err) {
  error('Failed to parse package.json: ' + err.message);
}

// Check 4: vercel.json validation
console.log('\n⚙️  Checking vercel.json...');
try {
  const vercelConfig = JSON.parse(readFileSync(resolve(rootDir, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.buildCommand) {
    success('Build command configured');
  } else {
    warn('No buildCommand specified (will use package.json scripts)');
  }
  
  if (vercelConfig.outputDirectory) {
    success(`Output directory: ${vercelConfig.outputDirectory}`);
  } else {
    warn('No outputDirectory specified');
  }
  
  if (vercelConfig.functions?.['api/index.js']) {
    success('API function configured');
    
    const fnConfig = vercelConfig.functions['api/index.js'];
    if (fnConfig.maxDuration && fnConfig.maxDuration > 0) {
      success(`Max duration: ${fnConfig.maxDuration}s`);
    } else {
      warn('No maxDuration set for API function');
    }
  } else {
    error('API function not configured in vercel.json');
  }
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    success(`${vercelConfig.rewrites.length} rewrite rules configured`);
  } else {
    warn('No rewrite rules configured');
  }
  
  if (vercelConfig.headers && vercelConfig.headers.length > 0) {
    success('Security headers configured');
  } else {
    warn('No security headers configured');
  }
  
} catch (err) {
  error('Failed to parse vercel.json: ' + err.message);
}

// Check 5: Environment variables template
console.log('\n🔐 Checking environment templates...');
const envExample = resolve(rootDir, '.env.production.example');
if (existsSync(envExample)) {
  const envContent = readFileSync(envExample, 'utf8');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SESSION_SECRET',
    'NODE_ENV'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      success(`${envVar} documented`);
    } else {
      warn(`${envVar} not in .env.production.example`);
    }
  });
}

// Check 6: TypeScript configuration
console.log('\n📘 Checking TypeScript config...');
try {
  const tsconfig = JSON.parse(readFileSync(resolve(rootDir, 'tsconfig.json'), 'utf8'));
  
  if (tsconfig.compilerOptions?.strict) {
    success('Strict mode enabled');
  } else {
    warn('TypeScript strict mode is disabled');
  }
  
  if (tsconfig.compilerOptions?.skipLibCheck) {
    success('skipLibCheck enabled (faster builds)');
  }
  
} catch (err) {
  error('Failed to parse tsconfig.json: ' + err.message);
}

// Check 7: Git repository
console.log('\n🌳 Checking Git...');
if (existsSync(resolve(rootDir, '.git'))) {
  success('Git repository initialized');
} else {
  warn('Not a Git repository (run: git init)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('\n❌ FAILED - Please fix the errors above before deploying\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  PASSED WITH WARNINGS - Review warnings before deploying\n');
  console.log('💡 Tip: Address warnings for optimal production deployment\n');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED - Ready for production deployment!\n');
  console.log('🚀 Next steps:');
  console.log('   1. Commit your changes: git add . && git commit -m "Production ready"');
  console.log('   2. Push to GitHub: git push');
  console.log('   3. Deploy on Vercel: https://vercel.com/new');
  console.log('   4. Add environment variables in Vercel dashboard\n');
  process.exit(0);
}
