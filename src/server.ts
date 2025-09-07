import express, { Request, Response } from "express";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { registerOpportunityTool } from "./Tools/opportunities.js";
import { getSalesOrderbyNumber } from "./Tools/SalesOrder.js";

const API_KEY = "e8792e5503e74bfbb8a71435251108";

const server = new McpServer({
  name: "mcp-streamable-http",
  version: "1.0.0",
});

// Register existing tools
registerOpportunityTool(server);
getSalesOrderbyNumber(server);

// Example sales order tool (from your original)
server.tool(
  "get-sales-order",
  "Get a sales order by its order number",
  async () => {
    return {
      content: [
        {
          type: "text",
          text: "This tool retrieves the sales order details including customer information, order status, and total amount.",
        },
      ],
    };
  }
);

// ✅ New Weather Tool
server.tool(
  "getWeather",
  { city: z.string() },
  async ({ city }) => {
    const res = await axios.get("http://api.weatherapi.com/v1/current.json", {
      params: { key: API_KEY, q: city, aqi: "no" },
    });
    const data = res.data;

    return {
      content: [
        {
          type: "text",
          text: `Weather in ${data.location.name}, ${data.location.country}: ${data.current.temp_c}°C, ${data.current.condition.text}`,
        },
      ],
    };
  }
);

const app = express();
app.use(express.json());

const transport: StreamableHTTPServerTransport =
  new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless server
  });

// Setup routes for the server
const setupServer = async () => {
  await server.connect(transport);
};

app.post("/mcp", async (req: Request, res: Response) => {
  console.log("Received MCP request:", req.body);
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

// Start the server
const PORT = process.env.PORT || 3000;
setupServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to set up the server:", error);
    process.exit(1);
  });
