#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Auto-generate .env from mcp-config.json if available
const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
if (fs.existsSync(mcpConfigPath)) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    const firebaseEnv = mcpConfig.mcpServers?.firebase?.env;
    if (firebaseEnv && Object.keys(firebaseEnv).length) {
      console.log('🛠️ Generating .env from mcp-config.json');
      const envPath = path.join(__dirname, '.env');
      let envContent = '# Firebase Configuration (auto-generated from mcp-config.json)\n';
      Object.entries(firebaseEnv).forEach(([key, val]) => {
        envContent += `${key}=${val}\n`;
      });
      envContent += '\n# React App Firebase Configuration\n';
      Object.entries(firebaseEnv).forEach(([key, val]) => {
        const reactKey = key.replace('FIREBASE_', 'REACT_APP_FIREBASE_');
        envContent += `${reactKey}=${val}\n`;
      });
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ .env file created successfully at ${envPath}`);
      process.exit(0);
    }
  } catch (e) {
    console.warn('⚠️ Failed to parse mcp-config.json, continuing manual setup:', e.message);
  }
}

console.log('🔥 Firebase Environment Setup');
console.log('============================\n');

console.log('📋 Instructions:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project (or create a new one)');
console.log('3. Click "Add app" (</> icon) and select Web');
console.log('4. Copy the configuration values from the code shown\n');

const questions = [
  { name: 'FIREBASE_API_KEY', label: 'API Key' },
  { name: 'FIREBASE_AUTH_DOMAIN', label: 'Auth Domain' },
  { name: 'FIREBASE_PROJECT_ID', label: 'Project ID' },
  { name: 'FIREBASE_STORAGE_BUCKET', label: 'Storage Bucket' },
  { name: 'FIREBASE_MESSAGING_SENDER_ID', label: 'Messaging Sender ID' },
  { name: 'FIREBASE_APP_ID', label: 'App ID' }
];

const envVars = {};

function askQuestion(index) {
  if (index >= questions.length) {
    // Write to .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '# Firebase Configuration\n';
    envContent += '# Generated automatically\n\n';
    
    questions.forEach(q => {
      envContent += `${q.name}=${envVars[q.name]}\n`;
    });
    
    // Add React App variables
    envContent += '\n# React App Firebase Configuration\n';
    questions.forEach(q => {
      const reactName = q.name.replace('FIREBASE_', 'REACT_APP_FIREBASE_');
      envContent += `${reactName}=${envVars[q.name]}\n`;
    });
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully!');
    console.log('📁 File location:', envPath);
    console.log('\n🎉 You can now use Firebase MCP with Cursor!');
    
    rl.close();
    return;
  }
  
  const question = questions[index];
  rl.question(`${question.label}: `, (answer) => {
    envVars[question.name] = answer.trim();
    askQuestion(index + 1);
  });
}

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askQuestion(0);
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
} 