// test-teacher-overview.js
// Usage: node test-teacher-overview.js

const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const BASE_URL =
  "https://texagonbackend.onrender.com/accounts/api/teacher/overview/";

// Replace with your actual session token
const SESSION_TOKEN =
  "QH8hbNjHoS_LN_w5V4FKenvAAYXRvHWgPabmeYTSaFfm8_UxlPkuSL0I7YaWZant";

async function testTeacherOverview() {
  if (!SESSION_TOKEN || SESSION_TOKEN === "YOUR_SESSION_TOKEN_HERE") {
    console.error("❌ ERROR: Please set your SESSION_TOKEN in the script!");
    process.exit(1);
  }

  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SESSION_TOKEN}`,
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ API SUCCESS:");
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
  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Test with wrong token format (to see Bearer vs Api-Key difference)
async function testWrongAuthFormat() {
  try {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        Authorization: `Api-Key ${SESSION_TOKEN}`, // Wrong format
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
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

// Run only main test
testTeacherOverview();
