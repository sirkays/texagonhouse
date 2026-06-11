import fetch from 'node-fetch';

const BASE_URL = 'process.env.BASE_URL/api/notes/';
const API_KEY = 'WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8';
const SESSION_TOKEN = 'CKeB40eCmc0ayvP71aik6OuIcuOBgsLGZjP-BJYcOSEkLRE6HzkOIQmR05eBrcEh';

const headers = {
  'Authorization': `Api-Key ${API_KEY}`,
  'X-Session-Token': SESSION_TOKEN,
  'Content-Type': 'application/json',
};

const body = {
  lesson: 1,
  content: 'Test note from JavaScript',
  is_private: true,
};

async function testPostNotes() {
  console.log('[Test Notes API] Sending POST request to:', BASE_URL);
  console.log('[Test Notes API] Headers:', headers);
  console.log('[Test Notes API] Body:', body);

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[Test Notes API] Response Status:', response.status);
    console.log('[Test Notes API] Response Headers:', Object.fromEntries(response.headers));

    const contentType = response.headers.get('content-type') || '';
    console.log('[Test Notes API] Response Content-Type:', contentType);

    const responseBody = await response.text();
    console.log('[Test Notes API] Response Content:', responseBody.slice(0, 200) + (responseBody.length > 200 ? '...' : ''));

    if (!response.ok) {
      console.error('[Test Notes API] Request failed:', response.status, responseBody);
      try {
        const errorData = JSON.parse(responseBody);
        console.error('[Test Notes API] Error Details:', errorData);
      } catch {
        console.error('[Test Notes API] Error: Invalid response format');
      }
      return;
    }

    if (!contentType.includes('application/json')) {
      console.error('[Test Notes API] Non-JSON response received:', contentType);
      return;
    }

    let data;
    try {
      data = JSON.parse(responseBody);
      console.log('[Test Notes API] Success: Note created successfully', data);
    } catch (parseError) {
      console.error('[Test Notes API] Failed to parse JSON:', parseError);
    }
  } catch (error) {
    console.error('[Test Notes API] Error:', error.message);
  }
}

testPostNotes();