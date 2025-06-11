# MCP Experts

An MCP (Model Context Protocol) server that provides access to multiple AI experts with specialized knowledge and perspectives.

## Features

- **6 Expert Personas**: UX Expert, Design Expert, Senior Engineer, Product Manager, Security Expert, Performance Expert
- **OpenAI o3-mini by default**: Optimized for cost and performance
- **Home directory config**: Configuration stored in `~/.experts.yaml`
- **NPX only**: No installation required, just run with `npx mcp-experts`

## Quick Start

```bash
# Setup (creates ~/.experts.yaml)
npx mcp-experts-setup

# Set your API key
export OPENAI_API_KEY="your-openai-key"

# Done! MCP server is ready for Claude Desktop
```

## Configuration

The configuration is automatically created at `~/.experts.yaml` when you run setup. Default configuration uses OpenAI o3-mini for all experts:

```yaml
providers:
  openai:
    api_key: "${OPENAI_API_KEY}"
    base_url: "https://api.openai.com/v1"

experts:
  ux_expert:
    name: "UX Expert"
    description: "Specializes in user experience design and usability"
    model: "openai/o3-mini"
    system_prompt: |
      You are a senior UX expert...
```

Edit `~/.experts.yaml` to customize models or add providers.

## Available Experts

Each expert is exposed as an MCP tool in Claude Desktop:

- **consult_ux_expert** - User experience and usability expertise
- **consult_design_expert** - Visual design and branding  
- **consult_senior_engineer** - Software architecture and engineering
- **consult_product_expert** - Product strategy and management
- **consult_security_expert** - Security and compliance
- **consult_performance_expert** - Performance optimization

## Environment Variables

```bash
export OPENAI_API_KEY="your-openai-key"
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "experts": {
      "command": "npx",
      "args": ["mcp-experts"]
    }
  }
}
```

That's it! Restart Claude Desktop and you'll have access to all 6 experts.

## License

ISC