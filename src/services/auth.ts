import axios from "axios";
import * as qs from "qs";

// 🔁 Replace with your actual values
const tenantId = "26c4b2e4-ec07-4c7b-92e5-97f52865e98b";
const clientId = "f981812b-7800-4dfd-a873-f209099af0e3";
const clientSecret = "px48Q~uMwdUFtHi3F5hkI1~vQ-Rt1zBQ37onva5s";
const dataverseUrl = "https://cloudfronts.crm5.dynamics.com/"; // Your Dataverse URL

export async function getDataverseToken(): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;

  const requestBody = qs.stringify({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    resource: dataverseUrl,
  });

  try {
    const response = await axios.post(tokenEndpoint, requestBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const token = response.data.access_token;
    if (!token) throw new Error("❌ Token not received");
    console.log("✅ Token fetched successfully");
    return token;
  } catch (err: any) {
    console.error("❌ Error fetching token:", err.response?.data || err.message);
    throw err;
  }
}
