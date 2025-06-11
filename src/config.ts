import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { Config, ConfigSchema } from './types.js';

function expandEnvVars(text: string): string {
  return text.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    return process.env[varName] || match;
  });
}

function expandEnvVarsInObject(obj: any): any {
  if (typeof obj === 'string') {
    return expandEnvVars(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(expandEnvVarsInObject);
  } else if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = expandEnvVarsInObject(value);
    }
    return result;
  }
  return obj;
}

export function loadConfig(configPath?: string): Config {
  const homeConfigPath = path.join(os.homedir(), '.experts.yaml');
  const cwdConfigPath = path.join(process.cwd(), 'experts-config.yaml');
  
  let finalConfigPath: string;
  
  if (configPath) {
    // Use explicitly provided config path
    finalConfigPath = configPath;
  } else if (fs.existsSync(homeConfigPath)) {
    // Use home directory config if it exists
    finalConfigPath = homeConfigPath;
  } else if (fs.existsSync(cwdConfigPath)) {
    // Fall back to current directory config
    finalConfigPath = cwdConfigPath;
  } else {
    throw new Error(`Configuration file not found. Please run 'npx mcp-experts-setup' or create ~/.experts.yaml`);
  }

  const configContent = fs.readFileSync(finalConfigPath, 'utf8');
  const rawConfig = yaml.load(configContent);
  
  // Expand environment variables
  const expandedConfig = expandEnvVarsInObject(rawConfig);
  
  // Validate configuration
  const config = ConfigSchema.parse(expandedConfig);
  
  return config;
}