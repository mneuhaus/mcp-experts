#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up MCP Experts...\n');

// Get the package directory
const packageDir = path.resolve(__dirname, '..');
const homeDir = os.homedir();

// Copy configuration file to home directory
const configSource = path.join(packageDir, 'experts-config.yaml');
const configTarget = path.join(homeDir, '.experts.yaml');

if (!fs.existsSync(configTarget)) {
  if (fs.existsSync(configSource)) {
    fs.copyFileSync(configSource, configTarget);
    console.log('✅ Created ~/.experts.yaml');
  } else {
    console.log('⚠️  Configuration template not found in package');
  }
} else {
  console.log('✅ ~/.experts.yaml already exists');
}

console.log(`
🎉 Setup complete!

Next steps:
1. Set up your OpenAI API key:
   export OPENAI_API_KEY="your-key-here"

2. Customize ~/.experts.yaml if needed (defaults to OpenAI o3-mini)

3. Add to Claude Desktop config:
   {
     "mcpServers": {
       "experts": {
         "command": "npx",
         "args": ["mcp-experts"]
       }
     }
   }

4. Restart Claude Desktop to load the experts

Available experts: UX, Design, Senior Engineer, Product Manager, Security, Performance

Need help? Visit: https://github.com/mneuhaus/mcp-experts
`);