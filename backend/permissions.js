// The one permission map for SC Studio. Every server check (routes, row scopes, push recipients) and the
// dashboard (sidebar, screens, buttons) reads from here; /api/me sends the signed-in person's list.
//
// Roles: owner (one account, manages users and roles) > admin > executive > mentor. "executive" is
// stored as the existing database role "editor" (no migration); the dashboard shows it as Executive.
// Students use the student portal only and get none of these.
export const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  editor: "Executive",
  mentor: "Mentor",
  student: "Student",
};
export const STAFF_ROLES = ["owner", "admin", "editor", "mentor"];
const ALL = STAFF_ROLES;
const LEADERS = ["owner", "admin"];
const NOT_MENTOR = ["owner", "admin", "editor"];
const OWNER = ["owner"];

export const PERMISSIONS = {
  "studio.use": ALL, // sign in to SC Studio at all
  // Workspace
  "chat.team": ALL, // "Team SC"
  "chat.board": LEADERS, // "SC Board": no access at all for executives and mentors
  "chat.moderate": OWNER, // delete anyone's chat message
  "tasks.view": ALL, // own and shared tasks
  "tasks.manage": LEADERS, // create, assign, reassign, deadlines, delete
  "team.performance": LEADERS, // everyone's tasks done and active time
  // Operations
  "leads.view": NOT_MENTOR,
  "leads.assign": LEADERS,
  "leads.export": LEADERS,
  "bookings.view": ALL, // see and cancel bookings
  "bookings.settings": LEADERS, // when people can book
  "mail.send": ALL, // compose from contact@ (rate limited, logged)
  "mail.inbox": NOT_MENTOR, // read and reply to the contact@ inbox
  "inbox.admin": LEADERS, // forms, private feedback, newsletter, ECA alerts, delivery log, previews
  "agreements.manage": LEADERS, // agreement templates, sending, signed copies
  // Content: drafts by anyone with access; publishing and deleting stay with owners and admins.
  "content.write": ALL, // blog, resources, universities
  "content.publish": LEADERS,
  "content.delete": LEADERS,
  "site.manage": LEADERS, // visual editor and the website management modules, media library
  "site.advanced": OWNER, // website text & images, SEO, hero videos (Advanced Configuration)
  // Student management. Mentors stay limited to their own students by the row scopes in access.js.
  "students.view": ALL,
  "students.all": NOT_MENTOR, // row scope: every student (mentors: only students enrolled with them)
  "course.write": NOT_MENTOR,
  "lesson.write": NOT_MENTOR,
  "course.delete": LEADERS,
  "package.view": ALL,
  "package.write": LEADERS, // packages, assigning them, student access and mentor
  "enrollment.write": LEADERS,
  "resource.view": ALL,
  "resource.write": NOT_MENTOR, // student resources, announcements and videos
  "resource.delete": LEADERS,
  "file.upload": [...ALL, "student"], // into a reachable student's space; students need the feature
  "document.review": ALL, // mentors: their own students only
  "document.delete": LEADERS,
  "message.send": [...ALL, "student"], // within studentScope
  "message.moderate": LEADERS,
  "profile.write": [...LEADERS, "student"], // student: own row, not staff_notes
  "profile.notes": ALL, // mentor: own students only
  "progress.write": ["student"], // own lessons in open courses only
  "review.view": ALL, // mentors: their own students only
  "review.write": ["student"], // own, enrolled course, one per course
  "review.moderate": NOT_MENTOR,
  "review.feature": LEADERS, // turns a review into a website testimonial draft
  // Administration (Owner only)
  "users.manage": OWNER,
  "audit.view": OWNER,
  "settings.system": OWNER,
};

/** True when `role` (or an actor with a role) holds `permission`. Unknown permissions are refused. */
export function can(who, permission) {
  const role = typeof who === "string" ? who : who?.role;
  return Boolean(role && PERMISSIONS[permission]?.includes(role));
}
/** Every permission a role holds, for /api/me (the dashboard builds its menu and buttons from it). */
export const permissionsOf = (role) =>
  Object.keys(PERMISSIONS).filter((p) => PERMISSIONS[p].includes(role));

// Which permission edits each kind of website content (content table). Anything not listed is refused.
export const CONTENT_KIND_PERMISSION = {
  blogs: "content.write",
  resources: "content.write",
  universities: "content.write",
  sections: "site.manage",
  courses: "site.manage",
  team: "site.manage",
  teamSections: "site.manage",
  mentors: "site.manage",
  feedback: "site.manage",
  faqs: "site.manage",
  colleges: "site.manage",
  toolValues: "site.manage",
  prompts: "site.manage",
  promptAngles: "site.manage",
  links: "site.manage",
  copy: "site.advanced",
  seo: "site.advanced",
  hero: "site.advanced",
  countries: "site.advanced",
};
export const canEditKind = (who, kind) =>
  Boolean(CONTENT_KIND_PERMISSION[kind]) && can(who, CONTENT_KIND_PERMISSION[kind]);
/** Content kinds a role may open in the dashboard. */
export const kindsFor = (role) =>
  Object.keys(CONTENT_KIND_PERMISSION).filter((k) => canEditKind(role, k));

// API access by path, checked for every /api request before the route runs (default deny). Each route
// still checks its own finer permission and row scope; this map is the outer wall. `null` = any
// signed-in person (the route itself decides). The first matching prefix wins.
export const API_ROUTES = [
  ["/me", null],
  ["/logout", null],
  ["/password", null],
  ["/lms/", null], // row scopes in access.js decide (students, mentors, staff)
  ["/workspace/", "studio.use"],
  ["/push", "studio.use"],
  ["/leads", "leads.view"],
  ["/mentors", "leads.assign"],
  ["/booking", "bookings.view"],
  ["/inbox", "mail.send"],
  ["/content", "content.write"],
  ["/media", "content.write"],
  ["/visual/", "site.manage"],
  ["/links/", "site.manage"],
  ["/packages", "package.view"],
  ["/students/", "package.write"],
  ["/resources", "resource.view"],
  ["/videos", "resource.view"],
  ["/forms", "inbox.admin"],
  ["/agreements", "agreements.manage"],
  ["/eca/", "inbox.admin"],
  ["/email-previews", "inbox.admin"],
  ["/inquiries", "inbox.admin"],
  ["/submissions", "inbox.admin"],
  ["/mail-status", "inbox.admin"],
  ["/users", "users.manage"],
  ["/audit", "audit.view"],
  ["/settings", "settings.system"],
  ["/diagnostics/", "settings.system"],
];
/** The rule for an /api path (without the /api prefix), or undefined when no rule matches. */
// "/leads" matches /leads, /leads/… and /leads.csv, never /leadsx; "/lms/" matches everything under it.
export const apiRule = (path) =>
  API_ROUTES.find(([prefix]) =>
    prefix.endsWith("/")
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(prefix + "/") || path.startsWith(prefix + "."),
  );
/** May this actor call this /api path at all? Students only reach their own account and /lms. */
export function mayCallApi(actor, path) {
  const rule = apiRule(path);
  if (!rule) return false;
  const [, permission] = rule;
  if (actor?.role === "student") return permission === null;
  if (!STAFF_ROLES.includes(actor?.role)) return false;
  return permission === null || can(actor, permission);
}
