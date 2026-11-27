// Row-level access rules for the student dashboard. MySQL has no row-level security, so EVERY query
// on student data must take its WHERE clause from here. Rules use the signed-in user's id from the
// session, never an id sent by the browser. Anything not listed is denied.
//
//                  | courses/lessons      | enrollments, profiles, progress, messages, reviews
// owner/admin      | all (read + write)   | all
// executive(editor)| all (read + write)   | all (no deleting, moderating or package access changes)
// mentor           | read (not deleted)   | only students enrolled with them as mentor
// student          | published + enrolled | only their own rows (staff notes hidden)
// Who may write what comes from permissions.js; this file only adds the row scopes.

import { can as hasPermission } from "./permissions.js";

const fail = (status, message) => Object.assign(new Error(message), { status });
const ROLES = new Set(["owner", "admin", "editor", "mentor", "student"]);
/** Staff whose row scope is every student (permissions.js "students.all"). */
export const isStaff = (actor) => hasPermission(actor, "students.all");

function check(actor) {
  if (!actor?.id || !ROLES.has(actor.role))
    throw fail(403, "Student dashboard access is not allowed for this account.");
}
const scoped = (sql, params = []) => ({ sql, params });
const ALL = scoped("1=1");
// Students a mentor looks after. Used inside every mentor rule.
const MY_STUDENTS = "SELECT e2.user_id FROM enrollments e2 WHERE e2.mentor_id=?";
// Courses a student may open: published, not deleted, enrolled and not paused.
const OPEN_COURSE = (col) =>
  `${col} IN (SELECT e3.course_id FROM enrollments e3 JOIN lms_courses c3 ON c3.id=e3.course_id
     WHERE e3.user_id=? AND e3.status<>'paused' AND c3.status='published' AND c3.deleted_at IS NULL)`;

/** WHERE fragment for `lms_courses c`. */
export function courseScope(actor) {
  check(actor);
  if (isStaff(actor)) return ALL;
  if (actor.role === "mentor") return scoped("c.deleted_at IS NULL");
  return scoped(OPEN_COURSE("c.id"), [actor.id]);
}
/** WHERE fragment for `lms_lessons l`. */
export function lessonScope(actor) {
  check(actor);
  if (isStaff(actor)) return ALL;
  if (actor.role === "mentor")
    return scoped("l.course_id IN (SELECT c4.id FROM lms_courses c4 WHERE c4.deleted_at IS NULL)");
  return scoped(`l.published=1 AND ${OPEN_COURSE("l.course_id")}`, [actor.id]);
}
/**
 * WHERE fragment for any table keyed by a student: enrollments e (user_id), student_profiles p (user_id),
 * lesson_progress g (user_id), messages m (student_id), reviews r (user_id), users u (id). Pass the qualified column.
 */
export function studentScope(actor, column) {
  check(actor);
  if (!/^[a-z]\.(user_id|student_id|id)$/.test(column)) throw new Error("Invalid scope column");
  if (isStaff(actor)) return ALL;
  if (actor.role === "mentor") return scoped(`${column} IN (${MY_STUDENTS})`, [actor.id]);
  return scoped(`${column}=?`, [actor.id]);
}
/**
 * WHERE fragment for `student_resources r` (resources and announcements).
 * Students: published, not deleted, and they hold a package that unlocks it. A resource with no package rows
 * is for every student who has at least one package; a student with no package sees nothing.
 * Staff see everything; mentors may read the list (writes are checked by each route).
 */
export function resourceScope(actor) {
  check(actor);
  if (isStaff(actor)) return ALL;
  if (hasPermission(actor, "resource.view")) return ALL; // mentors: read only (routes check writes)
  if (actor.role !== "student") throw fail(403, "Resources are managed by owners and admins.");
  return scoped(
    `r.published=1 AND r.deleted_at IS NULL
     AND EXISTS (SELECT 1 FROM user_packages up5 WHERE up5.user_id=?)
     AND (NOT EXISTS (SELECT 1 FROM resource_packages rp5 WHERE rp5.resource_id=r.id)
       OR EXISTS (SELECT 1 FROM resource_packages rp6 JOIN user_packages up6 ON up6.package_id=rp6.package_id
         WHERE rp6.resource_id=r.id AND up6.user_id=?))`,
    [actor.id, actor.id],
  );
}
/** Columns of student_profiles a role may read. Staff notes never reach students. */
export const profileColumns = (actor) =>
  actor.role === "student"
    ? "p.user_id,p.full_name,p.phone,p.target_intake"
    : "p.user_id,p.full_name,p.phone,p.target_intake,p.staff_notes";

// Write permissions come from permissions.js. Row ownership is still checked with the scopes above
// inside the same transaction.
export function can(actor, action) {
  return hasPermission(actor, action);
}
export function requireCan(actor, action) {
  check(actor);
  if (!can(actor, action)) throw fail(403, "You do not have permission for this action.");
}
/**
 * True when `actor` may act on the student `studentId` (send a message, add notes).
 * `query` is store.query; pass the transaction connection so the check and the write are atomic.
 */
export async function canReachStudent(actor, studentId, query, c) {
  check(actor);
  if (isStaff(actor)) return true;
  if (actor.role === "student") return actor.id === studentId;
  const rows = await query(
    "SELECT 1 FROM enrollments WHERE user_id=? AND mentor_id=? LIMIT 1",
    [studentId, actor.id],
    c,
  );
  return rows.length > 0;
}
