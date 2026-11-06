// TEST DATA ONLY. Fills a local or staging database with clearly labelled sample data so every feature can be
// tried, and removes it again with one command. It refuses to run against the live sites.
//
//   node seed-data.js --test-data          add the test data (prints the test students' password once)
//   node seed-data.js --test-data --clean  remove every test row and test file
//
// Everything it creates is marked: emails end in @example.test and titles/names start with "[TEST]".
// Reads the same environment as the app (DB_*, ADMIN_ORIGIN, PUBLIC_ORIGIN, VIDEO_DIR, FILE_DIR).
import { copyFile, mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "./auth.js";
import { INQUIRY_TEMPLATE } from "./forms.js";

export const TEST_DOMAIN = "@example.test";
const LIVE = /(^|\.)scholarscafe\.com$/i;

/** Throws unless this is clearly a test run against a non-live configuration. */
export function assertTestTarget(env, argv) {
  if (!argv.includes("--test-data"))
    throw new Error("Refusing to run: pass --test-data to confirm this is a test database.");
  for (const key of ["ADMIN_ORIGIN", "PUBLIC_ORIGIN", "STUDENT_ORIGIN"]) {
    const value = env[key];
    if (value && LIVE.test(new URL(value).hostname))
      throw new Error(
        `Refusing to run: ${key} points at the live site (${value}). Use a local or staging setup.`,
      );
  }
  if (env.NODE_ENV === "production") throw new Error("Refusing to run with NODE_ENV=production.");
  if (!env.DB_NAME) throw new Error("DB_NAME is not set.");
}

const tid = () => randomUUID(); // real UUIDs (columns and routes validate them); tests are found by their labels

export async function seed(store, env, log = console.log) {
  const q = (sql, args) => store.query(sql, args);
  const videoDir = env.VIDEO_DIR || join(homedir(), "sc-private", "videos");
  const fileDir = env.FILE_DIR || join(homedir(), "sc-private", "files");
  const password = "Test-" + randomBytes(9).toString("base64url");
  const hash = await hashPassword(password);
  const user = async (role, name, pw) => {
    const id = tid();
    await q("INSERT INTO users (id,email,role,active,password_hash) VALUES (?,?,?,?,?)", [
      id,
      `test-${name}${TEST_DOMAIN}`,
      role,
      1,
      pw ? hash : null,
    ]);
    return id;
  };
  const admin = await user("admin", "admin");
  await user("editor", "editor");
  const mentor = await user("mentor", "mentor");
  const s1 = await user("student", "student1", true);
  const s2 = await user("student", "student2", true);
  for (const [id, name] of [
    [s1, "[TEST] Student One"],
    [s2, "[TEST] Student Two"],
  ])
    await q(
      "INSERT INTO student_profiles (user_id,full_name,phone,target_intake) VALUES (?,?,?,?)",
      [id, name, "+880 1000 000000", "Fall 2027"],
    );

  // Course with two published lessons; lesson 1 has a private video (copied from the website's sample clip).
  const course = tid();
  await q("INSERT INTO lms_courses (id,title,summary,status,created_by) VALUES (?,?,?,?,?)", [
    course,
    "[TEST] USA applications",
    "Sample course for testing.",
    "published",
    admin,
  ]);
  const video = tid();
  await mkdir(videoDir, { recursive: true, mode: 0o700 });
  const sample = fileURLToPath(new URL("../public/media/hero/d2-columbia.mp4", import.meta.url));
  let videoId = null;
  try {
    await copyFile(sample, join(videoDir, video + ".mp4"));
    const { size } = await stat(sample);
    await q(
      "INSERT INTO videos (id,name,mime,size,received,status,created_by) VALUES (?,?,?,?,?,'ready',?)",
      [video, "[TEST] sample video.mp4", "video/mp4", size, size, admin],
    );
    videoId = video;
  } catch {
    log("(No sample clip found; lessons are created without a video.)");
  }
  const lesson1 = tid();
  const lesson2 = tid();
  await q(
    "INSERT INTO lms_lessons (id,course_id,position,title,body,video_id,published) VALUES (?,?,?,?,?,?,1),(?,?,?,?,?,NULL,1)",
    [
      lesson1,
      course,
      10,
      "[TEST] Lesson 1: choosing countries",
      "Sample lesson text.",
      videoId,
      lesson2,
      course,
      20,
      "[TEST] Lesson 2: budget",
      "Sample lesson text.",
    ],
  );

  // Two packages; student 1 gets the full one (with the mentor), student 2 the reviews-only one.
  const full = tid();
  const reviewsOnly = tid();
  await q(
    "INSERT INTO packages (id,name,price,description,includes,features,active,position) VALUES (?,?,?,?,?,?,1,10),(?,?,?,?,?,?,1,20)",
    [
      full,
      "[TEST] Full cohort",
      "TEST",
      "Everything, for testing.",
      JSON.stringify(["Course access", "Mentor messages", "Document reviews"]),
      JSON.stringify({ messaging: true, uploads: true, reviews: true, live: true }),
      reviewsOnly,
      "[TEST] Essay review only",
      "TEST",
      "Document reviews only.",
      JSON.stringify(["Document reviews"]),
      JSON.stringify({ messaging: false, uploads: false, reviews: true, live: false }),
    ],
  );
  await q("INSERT INTO package_courses (package_id,course_id) VALUES (?,?)", [full, course]);
  await q("INSERT INTO user_packages (user_id,package_id,granted_by) VALUES (?,?,?),(?,?,?)", [
    s1,
    full,
    admin,
    s2,
    reviewsOnly,
    admin,
  ]);
  await q("INSERT INTO enrollments (user_id,course_id,mentor_id,status) VALUES (?,?,?,'active')", [
    s1,
    course,
    mentor,
  ]);

  // Resources and an announcement for the full package.
  const announcement = tid();
  const live = tid();
  await q(
    `INSERT INTO student_resources (id,type,title,body,url,tags,country,starts_at,published,pinned,created_by)
     VALUES (?,?,?,?,?,?,?,NULL,1,1,?),(?,?,?,?,?,?,?,UTC_TIMESTAMP() + INTERVAL 7 DAY,1,0,?)`,
    [
      announcement,
      "announcement",
      "[TEST] Welcome announcement",
      "This is test data.",
      "",
      "",
      "",
      admin,
      live,
      "live",
      "[TEST] Live Q&A",
      "Sample live session.",
      "https://example.com/test-live",
      "sop",
      "USA",
      admin,
    ],
  );
  await q("INSERT INTO resource_packages (resource_id,package_id) VALUES (?,?)", [live, full]);

  // Messages, a file, a document under review and a mentor comment.
  for (const [sender, body] of [
    [s1, "[TEST] Hi, I have a question about my SOP."],
    [mentor, "[TEST] Sure, send me your draft under Documents."],
  ])
    await q("INSERT INTO messages (id,student_id,sender_id,body) VALUES (?,?,?,?)", [
      tid(),
      s1,
      sender,
      body,
    ]);
  const file = tid();
  const bytes = Buffer.from("[TEST] Sample essay text for the review workflow.\n");
  await mkdir(fileDir, { recursive: true, mode: 0o700 });
  await writeFile(join(fileDir, file), bytes, { mode: 0o600 });
  await q(
    "INSERT INTO files (id,student_id,uploaded_by,name,mime,size,sha256,purpose) VALUES (?,?,?,?,?,?,?,'document')",
    [
      file,
      s1,
      s1,
      "test-essay.txt",
      "text/plain",
      bytes.length,
      createHash("sha256").update(bytes).digest("hex"),
    ],
  );
  const doc = tid();
  await q(
    "INSERT INTO documents (id,student_id,title,kind,file_id,note,status,reviewer_id,updated_at) VALUES (?,?,?,?,?,?,'changes_requested',?,UTC_TIMESTAMP())",
    [doc, s1, "[TEST] Statement of purpose", "sop", file, "Test note.", mentor],
  );
  await q(
    "INSERT INTO document_comments (id,document_id,author_id,body,status) VALUES (?,?,?,?,'changes_requested')",
    [tid(), doc, mentor, "[TEST] Good start. Make the opening more specific."],
  );

  // A course review with consent, one form and one lead from it.
  await q(
    "INSERT INTO reviews (id,user_id,course_id,rating,body,status,public_consent) VALUES (?,?,?,5,?,'approved',1)",
    [tid(), s1, course, "[TEST] Clear, patient and fast. Sample review."],
  );
  const form = tid();
  await q(
    "INSERT INTO forms (id,slug,title,intro,success,published,notify,definition) VALUES (?,?,?,?,?,1,0,?)",
    [
      form,
      "test-inquiry",
      "[TEST] Inquiry form",
      INQUIRY_TEMPLATE.intro,
      INQUIRY_TEMPLATE.success,
      JSON.stringify(INQUIRY_TEMPLATE.definition),
    ],
  );
  await q(
    "INSERT INTO inquiries (id,name,email,phone,message,form_id,data) VALUES (?,?,?,?,?,?,?)",
    [
      tid(),
      "[TEST] Lead",
      "test-lead" + TEST_DOMAIN,
      "+880 1000 000001",
      "Full name: [TEST] Lead\nI'm interested in: Essay Review",
      form,
      JSON.stringify({ name: "[TEST] Lead", interest: "Essay Review" }),
    ],
  );
  log("Test data added.");
  log(
    `Student sign-in (student portal, password): test-student1${TEST_DOMAIN} / test-student2${TEST_DOMAIN}`,
  );
  log(`Test password for both (shown once): ${password}`);
  log(
    "Staff test accounts use @example.test and cannot use Google sign-in; to test a role, give a Google account you own that role in Users & roles.",
  );
  return { password, ids: { admin, s1, s2, mentor, course, full, reviewsOnly, form } };
}

/** Removes everything seed() created (by its labels), including the test files on disk. */
export async function clean(store, env, log = console.log) {
  const q = (sql, args) => store.query(sql, args);
  const videoDir = env.VIDEO_DIR || join(homedir(), "sc-private", "videos");
  const fileDir = env.FILE_DIR || join(homedir(), "sc-private", "files");
  const like = "%" + TEST_DOMAIN;
  const files = await q(
    "SELECT f.id FROM files f JOIN users u ON u.id=f.student_id WHERE u.email LIKE ?",
    [like],
  );
  const videos = await q("SELECT id,mime FROM videos WHERE name LIKE '[TEST]%'");
  // Order matters for foreign keys without cascades (documents → files).
  await q("DELETE d FROM documents d JOIN users u ON u.id=d.student_id WHERE u.email LIKE ?", [
    like,
  ]);
  await q("DELETE f FROM files f JOIN users u ON u.id=f.student_id WHERE u.email LIKE ?", [like]);
  await q("DELETE FROM inquiries WHERE email LIKE ? OR name LIKE '[TEST]%'", [like]);
  await q("DELETE FROM forms WHERE title LIKE '[TEST]%'");
  await q("DELETE FROM student_resources WHERE title LIKE '[TEST]%'");
  await q("DELETE FROM lms_lessons WHERE title LIKE '[TEST]%'");
  await q("DELETE FROM lms_courses WHERE title LIKE '[TEST]%'");
  await q("DELETE FROM packages WHERE name LIKE '[TEST]%'");
  await q("DELETE FROM videos WHERE name LIKE '[TEST]%'");
  await q("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)", [
    like,
  ]);
  await q("DELETE FROM users WHERE email LIKE ?", [like]); // cascades: profiles, enrollments, messages, reviews…
  for (const f of files) await unlink(join(fileDir, f.id)).catch(() => {});
  for (const v of videos)
    await unlink(join(videoDir, `${v.id}.${v.mime === "video/webm" ? "webm" : "mp4"}`)).catch(
      () => {},
    );
  log("Test data removed.");
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    assertTestTarget(process.env, process.argv);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const { Store } = await import("./store.js");
  const store = new Store(process.env);
  try {
    await store.initialize();
    if (process.argv.includes("--clean")) await clean(store, process.env);
    else {
      await clean(store, process.env, () => {}); // re-running starts fresh
      await seed(store, process.env);
    }
  } catch (e) {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  } finally {
    await store.pool.end();
  }
}
