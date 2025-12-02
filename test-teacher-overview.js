// test-teacher-overview.js
// Usage: node test-teacher-overview.js

const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";
const BASE_URL = "https://texagonbackend.epichouse.online/accounts/api/teacher/overview/";

// Replace with your actual session token
const SESSION_TOKEN = "QH8hbNjHoS_LN_w5V4FKenvAAYXRvHWgPabmeYTSaFfm8_UxlPkuSL0I7YaWZant";

async function testTeacherOverview() {
  console.log("🧪 Testing Teacher Overview API...");
  console.log(`📡 Endpoint: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`🎫 Session Token: ${SESSION_TOKEN ? SESSION_TOKEN.substring(0, 20) + "..." : "MISSING"}`);
  console.log("-".repeat(60));

  if (!SESSION_TOKEN || SESSION_TOKEN === "YOUR_SESSION_TOKEN_HERE") {
    console.error("❌ ERROR: Please set your SESSION_TOKEN in the script!");
    console.log("\n💡 How to get session token:");
    console.log("1. Open browser DevTools (F12)");
    console.log("2. Go to Application/Storage → Cookies");
    console.log("3. Find 'next-auth.session-token' or similar");
    console.log("4. Copy the value and replace YOUR_SESSION_TOKEN_HERE");
    process.exit(1);
  }

  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SESSION_TOKEN}`,
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`);
    console.log(`   Content-Type: ${response.headers.get("content-type")}`);
    console.log(`   Server: ${response.headers.get("server") || "N/A"}`);
    console.log("-".repeat(60));

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ SUCCESS! Response data:");
      console.log(JSON.stringify(data, null, 2));
      
      // Validate response structure
      console.log("\n🔍 Data validation:");
      console.log(`   stats: ${data.stats?.length || 0} items ✓`);
      console.log(`   recent_activity: ${data.recent_activity?.length || 0} items ✓`);
      console.log(`   performance: ${!!data.performance} ✓`);
      console.log(`   top_courses: ${data.top_courses?.length || 0} items ✓`);
      console.log(`   recent_materials: ${data.recent_materials?.length || 0} items ✓`);
    } else {
      console.error("❌ API ERROR:");
      console.error("Response body:", JSON.stringify(data, null, 2));
      
      if (data.detail) {
        console.error(`💡 Error detail: ${data.detail}`);
      }
    }
  } catch (error) {
    console.error("💥 Network/Fetch Error:", error.message);
  }
}

// Test without session token (to see 401/403)
async function testWithoutToken() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 Testing WITHOUT session token (expect 401/403)...");
  
  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(`📊 Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Test with wrong token format (to see Bearer vs Api-Key difference)
async function testWrongAuthFormat() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 Testing WRONG auth format (expect 401/403)...");
  
  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "Authorization": `Api-Key ${SESSION_TOKEN}`, // Wrong format
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(`📊 Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run all tests
async function runTests() {
  await testWithoutToken();
  await testWrongAuthFormat();
  await testTeacherOverview();
}

console.log("🚀 Starting Teacher Overview API Tests...\n");

// Uncomment to run all tests
// runTests();

// Run only main test
testTeacherOverview();