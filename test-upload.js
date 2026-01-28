/**
 * Run this with:
 *   node test-cover-upload.js
 *
 * Be sure to:
 *  1. npm install node-fetch form-data
 *  2. Replace moduleId, lessonId, SESSION_TOKEN, and file path below.
 */

import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

// 🧩 CONFIG — edit these
const BASE_URL = process.env.BASE_URL;
const moduleId = 21; // your module ID
const lessonId = 14; // your lesson ID
const SESSION_TOKEN =
  "IPcjB_NPTn_o0trv6gyQtoG9I1EnjZLN5jWW1xD4TjqrcWywehQ9PVR8A2Cj0yKD"; // replace
const API_KEY = process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"; // replace with real if needed
const COVER_PATH = `C:/Texagon/texagon/public/banner_splash.png`; // path to local test image

async function testUpload() {
  // Prepare FormData
  const formData = new FormData();
  formData.append("title", "Test upload cover");
  formData.append("type", "video");
  formData.append("duration", "60");
  formData.append("cover_image", fs.createReadStream(COVER_PATH));

  // PATCH request to update lesson
  const patchUrl = `${BASE_URL}/learning/api/teacher/modules/${moduleId}/lessons/${lessonId}/`;

  const patchRes = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Api-Key ${API_KEY}`,
      "X-Session-Token": SESSION_TOKEN,
    },
    body: formData,
  });

  const patchData = await patchRes.json().catch(() => ({}));

  // Extract cover image from response
  const newCover = patchData?.lesson?.cover_image || patchData?.cover_image;

  // Follow-up GET to confirm the update persisted
  const getUrl = `${BASE_URL}/learning/api/teacher/modules/${moduleId}/`;

  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `Api-Key ${API_KEY}`,
      "X-Session-Token": SESSION_TOKEN,
    },
  });

  const getData = await getRes.json().catch(() => ({}));

  // Look for the updated lesson and check its cover_image
  const updatedLesson = getData?.module?.lessons?.find(
    (l) => l.id === lessonId
  );
}

testUpload().catch((err) => {
  console.error("❌ Test failed:", err);
});
