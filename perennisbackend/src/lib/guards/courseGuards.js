// perennisbackend/src/lib/guards/courseGuards.js

export function assertEditable(course) {
  if (course.status === "PUBLISHED" || course.status === "ARCHIVED") {
    const err = new Error("Course is not editable");
    err.status = 409;
    throw err;
  }
}

export function assertDeletable(course) {
  if (course.status !== "DRAFT") {
    const err = new Error("Only DRAFT courses can be deleted");
    err.status = 409;
    throw err;
  }
}

export function assertPublishable(course, issues) {
  if (course.status !== "READY") {
    const err = new Error("Course must be READY before publishing");
    err.status = 409;
    throw err;
  }
  if (issues.length > 0) {
    const err = new Error("Course validation failed");
    err.status = 422;
    err.issues = issues;
    throw err;
  }
}
