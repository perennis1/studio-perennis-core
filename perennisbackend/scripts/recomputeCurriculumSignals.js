import { computeCurriculumSignals } from "../src/lib/learning/curriculum/computeCurriculumSignals.js";

await computeCurriculumSignals();
console.log("Curriculum signals recomputed");
process.exit(0);
