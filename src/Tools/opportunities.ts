import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDataverseToken } from "../services/auth.js";

export function registerOpportunityTool(server: McpServer) {
  server.tool(
    "dataversemcp",
    `
    Fetch test data from the Opportunity table in Microsoft Dataverse.

    For testing purposes, this tool ignores any user filters and returns
    the first 50 records from the opportunities table.
    `,
    {},
    async () => {
      const token = await getDataverseToken();

      const url = `https://cloudfronts.crm5.dynamics.com/api/data/v9.2/opportunities?$top=50&$select=opportunityid,name,estimatedvalue,estimatedclosedate,statuscode,statecode,salesstagecode,stepname,_ownerid_value,_owninguser_value,_customerid_value,createdon,modifiedon`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

    //   if (!data.value || !data.value.length) {
    //     return {
    //       content: [{ type: "text", text: "No opportunity data found." }],
    //     };
    //   }

      console.log("🔍 Raw API response:", JSON.stringify(data, null, 2));

      return {
        content: [
          { type: "text", text: `Showing the first ${data.value.length} records:\n${JSON.stringify(data.value, null, 2)}` },
        ],
      };
    }
  );
}
