// Writes backend/college-data.json: the few facts "My College List" needs from the built-in college
// directory (src/data/college-directory.ts), so the backend (plain Node, deployed on its own) can show
// deadlines and send reminders. Values are copied as they are; nothing is added or estimated.
// Admin "colleges" entries still override these at run time (backend/my-list.js).
// Run after the directory changes:  node scripts/export-college-deadlines.mjs   (Node 23+, or
// Node 22 with --experimental-strip-types).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const { COLLEGES } = await import("../src/data/college-directory.ts");
const v = (fig) => (fig && fig.value != null ? fig.value : null);
const rows = COLLEGES.map((c) => ({
  slug: c.slug,
  name: c.name,
  type: c.type,
  asOf: c.asOf,
  applicants: v(c.applicants),
  admitted: v(c.admitted),
  intlAidPolicy: v(c.intlAidPolicy),
  ed1: v(c.ed1),
  ed2: v(c.ed2),
  ea: v(c.ea),
  rd: v(c.rd),
  deadlineNote: c.deadlineNote ?? null,
}));
const out = fileURLToPath(new URL("../backend/college-data.json", import.meta.url));
writeFileSync(out, JSON.stringify(rows, null, 1) + "\n");
console.log(`[OK] ${rows.length} colleges written to backend/college-data.json`);
