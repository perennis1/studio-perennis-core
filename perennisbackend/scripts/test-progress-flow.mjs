// scripts/test-progress-flow.mjs
const BASE = "http://localhost:5000/api"; // no /api

// 1) Paste a valid JWT for any test user here:
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiIxMjM0SXNBZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE3NjU3MjM1NTEsImV4cCI6MTc2NjMyODM1MX0.m9QD9h9ueo7mw3U_-vbonTVQrSKxYcTdLjaHecL96CA";

if (!TOKEN) {
  console.error("Set TOKEN in test-progress-flow.mjs before running.");
  process.exit(1);
}

const authHeader = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function main() {
  // 2) Use existing course 1 + slug foundations-of-clear-thinking
  const courseId = 1;
  const courseSlug = "foundations-of-clear-thinking";

  // 3) Create a test lesson on that course via admin route
  const lessonSlug = `progress-test-${Date.now()}`;
  let res = await fetch(`${BASE}/admin/courses/${courseId}/lessons`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({
      title: "Progress Test Lesson",
      slug: lessonSlug,
      body: "Test body",
      order: 99,
      videoUrl: null,
      isPreview: true,
    }),
  });
  if (!res.ok) {
    console.error("Create lesson failed", res.status);
    console.error(await res.text());
    process.exit(1);
  }
  const lesson = await res.json();

  // 4) Enroll in the course
  res = await fetch(`${BASE}/courses/${courseId}/enroll`, {
    method: "POST",
    headers: authHeader,
  });
  if (!res.ok && res.status !== 409 && res.status !== 201) {
    console.error("Enroll failed", res.status);
    console.error(await res.text());
    process.exit(1);
  }

  // 5) Mark lesson complete
  res = await fetch(
    `${BASE}/courses/${courseId}/lessons/${lesson.id}/complete`,
    {
      method: "POST",
      headers: authHeader,
    }
  );
  if (!res.ok) {
    console.error("Complete failed", res.status);
    console.error(await res.text());
    process.exit(1);
  }
  const completeData = await res.json();
  console.log("Complete response:", completeData);

  // 6) Fetch course by slug and assert
  res = await fetch(`${BASE}/courses/slug/${courseSlug}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error("Get course by slug failed", res.status);
    console.error(await res.text());
    process.exit(1);
  }
  const courseSlugData = await res.json();
  console.log("Course slug data:", {
    enrolled: courseSlugData.enrolled,
    progress: courseSlugData.progress,
    completedLessons: courseSlugData.completedLessons,
  });

  const completedLessons = courseSlugData.completedLessons || [];
  const hasLesson = completedLessons.includes(lesson.id);

  const totalLessons = courseSlugData.lessons.length;
  const expectedProgress = totalLessons > 0 ? 1 / totalLessons : 0;
  const progressOK =
    Math.abs(courseSlugData.progress - expectedProgress) < 1e-6;

  if (!hasLesson || !progressOK || !courseSlugData.enrolled) {
    console.error("TEST FAILED", {
      hasLesson,
      progress: courseSlugData.progress,
      expectedProgress,
      enrolled: courseSlugData.enrolled,
    });
    process.exit(1);
  }

  console.log("✅ Progress flow test PASSED");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
