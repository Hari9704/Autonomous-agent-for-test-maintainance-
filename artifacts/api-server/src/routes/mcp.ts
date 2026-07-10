import { Router, type IRouter } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../mcp/server";
import { findApiKey } from "../lib/apiKeys";

const router: IRouter = Router();

// Paid, stateless MCP endpoint. Each request is handled by a fresh
// McpServer + transport pair (no session store) so concurrent clients never
// share state. Gated by the same API key issued at POST /access/purchase.
router.post("/mcp", async (req, res): Promise<void> => {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Missing x-api-key header. Get one from /get-mcp." },
      id: null,
    });
    return;
  }

  const record = await findApiKey(apiKey);
  if (!record) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Invalid API key." },
      id: null,
    });
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

export default router;
