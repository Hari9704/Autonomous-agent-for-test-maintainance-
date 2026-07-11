---
name: MCP Streamable HTTP client config snippet
description: The correct JSON config for connecting a Claude Desktop / Cursor client to a Streamable HTTP MCP server with a custom auth header
---

The backend MCP server uses `StreamableHTTPServerTransport` (stateless, one transport per request). The correct client-side config snippet is:

```json
{
  "mcpServers": {
    "qa-agent": {
      "url": "https://<host>/api/mcp",
      "headers": {
        "x-api-key": "<API_KEY>"
      }
    }
  }
}
```

**Why:** Modern MCP clients (Claude Desktop remote MCP, Cursor, etc.) support a `url` + `headers` field directly for Streamable HTTP servers. The old `@modelcontextprotocol/server-sse` npm bridge was for legacy SSE transport and doesn't forward custom headers correctly to Streamable HTTP endpoints.

**How to apply:** Any code/docs snippet showing how to connect to this server's `/api/mcp` endpoint must use the `url`+`headers` format, not `command`/`args`/`env`.
