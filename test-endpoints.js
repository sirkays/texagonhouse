const BASE_URL = 'https://texagonbackend.epichouse.online';
const API_KEY = '1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz';
const EMAIL = 'sirkays@gmail.com';
const PASSWORD = 'testuser';

// Headers with session token
const headers = (sessionToken) => ({
  'Authorization': `Api-Key ${API_KEY}`,
  'Content-Type': 'application/json',
  ...(sessionToken && { 'X-Session-Token': sessionToken }),
});

// Test login endpoint
async function testLogin(fetch) {
  console.log('[Test] Testing login endpoint (/api/auth/login)');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    console.log('[Test] Login response status:', response.status);
    console.log('[Test] Login response headers:', Object.fromEntries(response.headers));

    const rawResponse = await response.text();
    console.log('[Test] Login raw response:', rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('[Test] Failed to parse login JSON:', parseError);
      return null;
    }

    if (!response.ok) {
      console.error('[Test] Login failed:', response.status, data);
      return null;
    }

    console.log('[Test] Login successful:', data);
    return data.sessionToken;
  } catch (error) {
    console.error('[Test] Login error:', error.message);
    return null;
  }
}

// Test post-login endpoint
async function testPostLogin(fetch, sessionToken) {
  console.log('[Test] Testing post-login endpoint with session token');
  try {
    const url = new URL(`${BASE_URL}/accounts/api/post-login/`);
    url.searchParams.append('email', EMAIL);
    url.searchParams.append('password', PASSWORD);

    const response = await fetch(url, {
      method: 'GET',
      headers: headers(sessionToken),
    });

    console.log('[Test] Post-login response status:', response.status);
    console.log('[Test] Post-login response headers:', Object.fromEntries(response.headers));

    const rawResponse = await response.text();
    console.log('[Test] Post-login raw response:', rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('[Test] Failed to parse post-login JSON:', parseError);
      return;
    }

    if (!response.ok) {
      console.error('[Test] Post-login failed:', response.status, data);
      return;
    }

    console.log('[Test] Post-login successful:', data);
  } catch (error) {
    console.error('[Test] Post-login error:', error.message);
  }
}

// Test logout endpoint
async function testLogout(fetch, sessionToken) {
  console.log('[Test] Testing logout endpoint with session token');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: headers(sessionToken),
    });

    console.log('[Test] Logout response status:', response.status);
    console.log('[Test] Logout response headers:', Object.fromEntries(response.headers));

    const rawResponse = await response.text();
    console.log('[Test] Logout raw response:', rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('[Test] Failed to parse logout JSON:', parseError);
      return;
    }

    if (!response.ok) {
      console.error('[Test] Logout failed:', response.status, data);
      return;
    }

    console.log('[Test] Logout successful:', data);
  } catch (error) {
    console.error('[Test] Logout error:', error.message);
  }
}



// Run tests
async function runTests() {
  const fetch = (await import('node-fetch')).default;
  console.log('[Test] Starting API tests');

  const sessionToken = await testLogin(fetch);
  if (sessionToken) {
    await testPostLogin(fetch, sessionToken);
    await testLogout(fetch, sessionToken);
    await testCheckToken(fetch, sessionToken);
  } else {
    console.error('[Test] Skipping post-login, logout, and check-token tests due to login failure');
  }

  console.log('[Test] All tests completed');
}

runTests();