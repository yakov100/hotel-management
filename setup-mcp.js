#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase MCP Setup for Cursor');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created successfully!');
        console.log('⚠️  Please update the .env file with your actual Firebase credentials.\n');
    } else {
        console.log('❌ env.example file not found. Please create .env file manually.');
    }
} else {
    console.log('✅ .env file already exists.');
}

// Check if mcp-config.json exists
const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
if (fs.existsSync(mcpConfigPath)) {
    console.log('✅ mcp-config.json file exists.');
} else {
    console.log('❌ mcp-config.json file not found. Please create it manually.');
}

// Check if mcp-firebase.js exists
const mcpFirebasePath = path.join(__dirname, 'mcp-firebase.js');
if (fs.existsSync(mcpFirebasePath)) {
    console.log('✅ mcp-firebase.js file exists.');
} else {
    console.log('❌ mcp-firebase.js file not found. Please create it manually.');
}

console.log('\n📋 Next steps:');
console.log('1. Update .env file with your Firebase credentials');
console.log('2. Update mcp-config.json with your Firebase project details');
console.log('3. Run: npm install');
console.log('4. Configure MCP in Cursor settings');
console.log('5. Restart Cursor');

console.log('\n📖 For detailed instructions, see MCP_SETUP.md');
console.log('\n�� Setup complete!'); 