import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
export function getSalesOrderbyNumber(server: McpServer) {
    server.tool(
        "getSalesOrderbyNumber",
        `Fetches a sales order by its order number from Microsoft Dataverse.`,
        {
            orderNumber: z.string().describe("The order number of the sales order to retrieve."),
        },
        async ({ orderNumber }) => {
            console.log("🧪 orderNumber received in tool:", orderNumber); // 👈 Debug this

            if (!orderNumber) {
                return {
                    content: [
                        { type: "text", text: "❌ No order number provided!" }
                    ]
                };
            }

            try {
                const url = "https://prod-31.westindia.logic.azure.com:443/workflows/dd183b99a96e4c8db0d30002680e2f27/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=GBnlUcKZSLC7KRi8f1z8QMb5aIYnyfes4KaZTEkiMsc";
                const body = { orderNumber: "446207" };  // Must be string if your schema says so

                const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
                });;

                const data = await res.json();

                console.log("📦 Logic App Response:", JSON.stringify(data, null, 2));

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data, null, 2), // stringified for text output
                        },
                    ],
                };
            } catch (err) {
                console.error("🔥 Error in fetch:", err);
                return {
                    content: [{ type: "text", text: "❌ Error calling Logic App." }],
                };
            }
        }
    );
}
