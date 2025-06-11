#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { ExpertClient } from './expert-client.js';
import { ConsultExpertRequest } from './types.js';
import * as path from 'path';
import * as process from 'process';

// Handle CLI arguments
const args = process.argv.slice(2);
const configPathIndex = args.indexOf('--config');
const configPath = configPathIndex !== -1 && args[configPathIndex + 1] 
  ? args[configPathIndex + 1] 
  : undefined;

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.error(`
MCP Experts Server

Usage: npx mcp-experts [options]

Options:
  --config <path>    Path to configuration file (default: ~/.experts.yaml)
  --help, -h         Show this help message

Environment Variables:
  OPENAI_API_KEY     OpenAI API key (required)

Example:
  npx mcp-experts
  npx mcp-experts --config ./my-experts.yaml
  `);
  process.exit(0);
}

const config = loadConfig(configPath);
const expertClient = new ExpertClient(config);

const server = new Server(
  {
    name: 'experts-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools (one for each expert)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const experts = expertClient.getAvailableExperts();
  
  const tools = Object.entries(experts).map(([expertId, expert]) => ({
    name: `consult_${expertId}`,
    description: `Consult with ${expert.name}: ${expert.description}`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        problem: {
          type: 'string',
          description: 'The problem or question you want the expert to analyze',
        },
        context: {
          type: 'string',
          description: 'Additional context or background information (optional)',
        },
        images: {
          type: 'array',
          items: { type: 'string' },
          description: 'Base64 encoded images to include in the consultation (optional)',
        },
      },
      required: ['problem'],
    },
  }));

  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  
  if (!toolName.startsWith('consult_')) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  const expertId = toolName.replace('consult_', '');
  const experts = expertClient.getAvailableExperts();
  
  if (!experts[expertId]) {
    throw new Error(`Expert '${expertId}' not found`);
  }

  const args = request.params.arguments as any as ConsultExpertRequest;
  
  if (!args.problem) {
    throw new Error('Problem description is required');
  }

  try {
    const response = await expertClient.consultExpert(expertId, args);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: `**${response.expert} Analysis:**\n\n${response.response}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to consult expert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Experts MCP Server running on stdio');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

export { server };