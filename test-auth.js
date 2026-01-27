import fetch from "node-fetch"; // Ensure "type": "module" is in package.json
import readline from "readline";

// --- CONFIGURATION (Matched to Python Script) ---
const BASE_URL = process.env.BASE_URL;
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// 🔴 CHANGE THIS TO SWITCH ACCOUNTS
// Options: "student" | "teacher" | "parent"
const ACCOUNT_TYPE = "parent";

const USER_DATA = {
  email: "ryanjackson7733@gmail.com", // ✅ REAL EMAIL (Prevents 500 Timeout)
  password: "testuser123",
  first_name: "Kemi",
  last_name: "Idris",
  phone: "+2348000000000",
  primary_org_id: 1,
  account_type: ACCOUNT_TYPE,
};

// Add specific fields based on account type (Mirroring Python logic)
if (ACCOUNT_TYPE === "student") {
  USER_DATA.parent_profile_id = 7; // Required for student
} else if (ACCOUNT_TYPE === "parent") {
  USER_DATA.address = "Lagos, Nigeria";
}

// --- SETUP ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function sendRequest(endpoint, method, body, stepName) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n--- [${stepName}] ---`);
  console.log(`📡 ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Handle HTML errors (like the 500 timeout) gracefully
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const text = await response.text();
      console.error(
        `❌ [${stepName}] Failed! Server returned HTML (likely an error page).`
      );
      console.error(`Status: ${response.status}`);
      console.error(`Snippet: ${text.slice(0, 200)}...`);
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [${stepName}] Failed: ${response.status}`);
      console.error("Error Detail:", JSON.stringify(data, null, 2));
      return null;
    }

    return data;
  } catch (error) {
    console.error(`❌ [${stepName}] Network Error:`, error.message);
    return null;
  }
}

// --- MAIN FLOW ---
async function run() {
  console.log(`🚀 Starting Test with email: ${USER_DATA.email}`);

  // 1. Create Account
  const createResult = await sendRequest(
    "/accounts/api/account/create/",
    "POST",
    USER_DATA,
    "Create Account"
  );

  if (!createResult) {
    rl.close();
    return;
  }

  // 2. Wait for User Input (OTP)
  rl.question("\n📩 Check your email! Enter the OTP code: ", async (code) => {
    if (!code) {
      rl.close();
      return;
    }

    // 3. Verify Email
    await sendRequest(
      "/accounts/api/auth/verify-email/",
      "POST",
      {
        email: USER_DATA.email,
        code: code.trim(),
      },
      "Verify Email"
    );

    rl.close();
  });
}

run();
