CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  google_sub VARCHAR(255) UNIQUE,
  role ENUM('owner','admin','editor') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  csrf CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS oauth_attempts (
  state_hash CHAR(64) PRIMARY KEY,
  nonce VARCHAR(128) NOT NULL,
  verifier VARCHAR(128) NOT NULL,
  expires_at DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS content (
  id VARCHAR(120) PRIMARY KEY,
  kind VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  draft JSON NOT NULL,
  published JSON NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS revisions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content_id VARCHAR(120) NOT NULL,
  actor_id CHAR(36) NOT NULL,
  snapshot JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id CHAR(36) NULL,
  action VARCHAR(64) NOT NULL,
  target VARCHAR(254) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS inquiries (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS submissions (
  id CHAR(36) PRIMARY KEY,
  kind ENUM('feedback','newsletter') NOT NULL,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(160) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  consent_at DATETIME NULL,
  unsubscribed_at DATETIME NULL,
  dedupe_key VARCHAR(254) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX kind_created (kind,created_at)
);
CREATE TABLE IF NOT EXISTS mail_outbox (
  id CHAR(36) PRIMARY KEY,
  subject VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  reply_to VARCHAR(254) NULL,
  to_email VARCHAR(254) NULL,
  unsubscribe_url VARCHAR(400) NULL,
  from_contact BOOLEAN NOT NULL DEFAULT FALSE,
  in_reply_to VARCHAR(255) NULL,
  references_hdr TEXT NULL,
  attempts INT NOT NULL DEFAULT 0,
  sent_at DATETIME NULL,
  next_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS eca_subscribers (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  token CHAR(64) NOT NULL UNIQUE,
  consent_at DATETIME NOT NULL,
  unsubscribed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket CHAR(64) PRIMARY KEY,
  hits INT NOT NULL DEFAULT 1,
  expires_at DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  bytes MEDIUMBLOB NOT NULL,
  size INT UNSIGNED NOT NULL,
  actor_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS media_quota (
  id TINYINT PRIMARY KEY,
  used_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0
);
INSERT IGNORE INTO media_quota (id,used_bytes) VALUES (1,0);
CREATE TABLE IF NOT EXISTS email_codes (
  user_id CHAR(36) PRIMARY KEY,
  code_hash CHAR(64) NOT NULL,
  link_hash CHAR(64) NOT NULL UNIQUE,
  attempts INT NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- ---------- Student dashboard (Phase 5). Access rules for every table: access.js ----------
CREATE TABLE IF NOT EXISTS lms_courses (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at DATETIME NULL
);
CREATE TABLE IF NOT EXISTS lms_lessons (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  title VARCHAR(200) NOT NULL,
  body MEDIUMTEXT NULL,
  video_media_id CHAR(36) NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NULL,
  INDEX course_position (course_id, position),
  FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  mentor_id CHAR(36) NULL,
  status ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id),
  INDEX mentor (mentor_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL DEFAULT '',
  phone VARCHAR(80) NOT NULL DEFAULT '',
  target_intake VARCHAR(40) NOT NULL DEFAULT '',
  staff_notes TEXT NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id CHAR(36) NOT NULL,
  lesson_id CHAR(36) NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS messages (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  INDEX thread (student_id, created_at),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  rating TINYINT NOT NULL,
  body TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_per_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
);
-- Owner-only settings (Phase 1): e.g. student_signup = open | invite
CREATE TABLE IF NOT EXISTS settings (
  name VARCHAR(64) PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Packages (Phase 2): what a student buys. Assigning one enrolls the student in its courses.
CREATE TABLE IF NOT EXISTS packages (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price VARCHAR(80) NOT NULL DEFAULT '',
  description TEXT NULL,
  includes JSON NULL,
  features JSON NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at DATETIME NULL
);
CREATE TABLE IF NOT EXISTS package_courses (
  package_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  PRIMARY KEY (package_id, course_id),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_packages (
  user_id CHAR(36) NOT NULL,
  package_id CHAR(36) NOT NULL,
  granted_by CHAR(36) NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, package_id),
  INDEX package (package_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);
-- Lesson and resource videos (Phase 3): files on disk outside the web root, uploaded in chunks.
CREATE TABLE IF NOT EXISTS videos (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  mime VARCHAR(40) NOT NULL,
  size BIGINT UNSIGNED NOT NULL,
  received BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('uploading','ready') NOT NULL DEFAULT 'uploading',
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Where each student stopped in a lesson video (resume playback).
CREATE TABLE IF NOT EXISTS video_progress (
  user_id CHAR(36) NOT NULL,
  lesson_id CHAR(36) NOT NULL,
  seconds INT UNSIGNED NOT NULL DEFAULT 0,
  duration INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  INDEX recent (user_id, updated_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id) ON DELETE CASCADE
);
-- Student-only resources and announcements. No package rows = every student who has a package.
CREATE TABLE IF NOT EXISTS student_resources (
  id CHAR(36) PRIMARY KEY,
  type ENUM('announcement','live','video','guide','link') NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  url VARCHAR(2000) NOT NULL DEFAULT '',
  video_id CHAR(36) NULL,
  tags VARCHAR(300) NOT NULL DEFAULT '',
  country VARCHAR(80) NOT NULL DEFAULT '',
  starts_at DATETIME NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at DATETIME NULL,
  INDEX listing (published, deleted_at, type)
);
CREATE TABLE IF NOT EXISTS resource_packages (
  resource_id CHAR(36) NOT NULL,
  package_id CHAR(36) NOT NULL,
  PRIMARY KEY (resource_id, package_id),
  FOREIGN KEY (resource_id) REFERENCES student_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);
-- Student files (Phase 4): on disk under a random id, outside the web root. Name and type are metadata only.
CREATE TABLE IF NOT EXISTS files (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  purpose ENUM('message','document') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX student (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Document reviews: a student's essay, SOP, CV or transcript and the mentor's comments and status.
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  kind ENUM('essay','sop','cv','transcript','lor','other') NOT NULL,
  file_id CHAR(36) NOT NULL,
  note TEXT NULL,
  status ENUM('shared','submitted','in_review','changes_requested','approved') NOT NULL DEFAULT 'submitted',
  reviewer_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  INDEX student (student_id, status),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id)
);
CREATE TABLE IF NOT EXISTS document_comments (
  id CHAR(36) PRIMARY KEY,
  document_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  file_id CHAR(36) NULL,
  status VARCHAR(32) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX doc (document_id, created_at),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
-- Native forms (Phase 5). Submissions are rows in inquiries (form_id + data) so they use the leads CRM.
CREATE TABLE IF NOT EXISTS forms (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  intro TEXT NULL,
  success VARCHAR(500) NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  notify BOOLEAN NOT NULL DEFAULT TRUE,
  definition JSON NOT NULL,
  cover VARCHAR(500) NULL,
  receipt BOOLEAN NOT NULL DEFAULT TRUE,
  summary VARCHAR(300) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at DATETIME NULL,
  UNIQUE KEY slug (slug)
);
-- Files people attach to a form answer (resume, payment screenshot). Stored privately on disk like student
-- files. inquiry_id is set when the form is sent, and unsent uploads are removed after a day.
CREATE TABLE IF NOT EXISTS form_uploads (
  id CHAR(36) PRIMARY KEY,
  form_id CHAR(36) NOT NULL,
  field_id VARCHAR(40) NOT NULL,
  inquiry_id CHAR(36) NULL,
  name VARCHAR(150) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX form (form_id),
  INDEX inquiry (inquiry_id)
);
-- Clicks on the /links page, per link per day (no visitor data stored).
CREATE TABLE IF NOT EXISTS link_clicks (
  link_id VARCHAR(120) NOT NULL,
  day DATE NOT NULL,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (link_id, day)
);
-- 1-on-1 mentor session bookings (scholarscafe.com/book). One booking per Bangladesh date: day is UNIQUE and
-- set to NULL when a booking is cancelled, which frees the day. Times are UTC.
CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) PRIMARY KEY,
  day DATE NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  topic TEXT NOT NULL,
  status ENUM('booked','cancelled') NOT NULL DEFAULT 'booked',
  reminded_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_per_day (day),
  INDEX starts (status, starts_at)
);
-- Booking availability (open weekdays, time windows, slot length, days ahead, blocked dates, meeting link).
CREATE TABLE IF NOT EXISTS booking_settings (
  id TINYINT PRIMARY KEY,
  data JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Team workspace (admin dashboard, staff only): one staff group chat, a shared to-do list and activity streaks.
CREATE TABLE IF NOT EXISTS staff_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  pinned_at DATETIME NULL,
  pinned_by CHAR(36) NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX pinned (pinned_at),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS staff_tasks (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  details TEXT NULL,
  status ENUM('todo','doing','done') NOT NULL DEFAULT 'todo',
  due_at DATETIME NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  completed_at DATETIME NULL,
  deleted_at DATETIME NULL,
  INDEX due (due_at)
);
-- One row per person on a task. The reminder columns make each reminder email go out once.
CREATE TABLE IF NOT EXISTS staff_task_assignees (
  task_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  reminded_24h_at DATETIME NULL,
  reminded_2h_at DATETIME NULL,
  PRIMARY KEY (task_id, user_id),
  INDEX assignee (user_id),
  FOREIGN KEY (task_id) REFERENCES staff_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Approximate active minutes per staff member per Bangladesh calendar day (from the dashboard heartbeat).
CREATE TABLE IF NOT EXISTS staff_activity (
  user_id CHAR(36) NOT NULL,
  day DATE NOT NULL,
  minutes INT UNSIGNED NOT NULL DEFAULT 0,
  first_at DATETIME NOT NULL,
  last_at DATETIME NOT NULL,
  PRIMARY KEY (user_id, day),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Web Push (installable admin app): one row per signed-in staff device that turned notifications on.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  endpoint_hash CHAR(64) NOT NULL UNIQUE,
  endpoint VARCHAR(1000) NOT NULL,
  p256dh VARCHAR(200) NOT NULL,
  auth VARCHAR(100) NOT NULL,
  device VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_ok_at DATETIME NULL,
  last_status INT NULL,
  last_error VARCHAR(300) NULL,
  INDEX push_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Notifications waiting to be pushed (queued in the same transaction as the event, sent by the admin app).
CREATE TABLE IF NOT EXISTS push_outbox (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  payload VARCHAR(1000) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX push_pending (attempts, id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- The contact@scholarscafe.com mailbox, read over IMAP by the admin app. Bodies are stored sanitised.
CREATE TABLE IF NOT EXISTS contact_mail (
  id CHAR(36) PRIMARY KEY,
  direction ENUM('in','out') NOT NULL DEFAULT 'in',
  uidvalidity BIGINT UNSIGNED NULL,
  uid INT UNSIGNED NULL,
  message_id VARCHAR(255) NULL,
  in_reply_to VARCHAR(255) NULL,
  references_hdr TEXT NULL,
  from_name VARCHAR(200) NOT NULL DEFAULT '',
  from_email VARCHAR(254) NOT NULL DEFAULT '',
  to_text VARCHAR(500) NOT NULL DEFAULT '',
  subject VARCHAR(300) NOT NULL DEFAULT '',
  snippet VARCHAR(300) NOT NULL DEFAULT '',
  body_text MEDIUMTEXT NULL,
  body_html MEDIUMTEXT NULL,
  has_remote_images BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSON NULL,
  received_at DATETIME NOT NULL,
  read_at DATETIME NULL,
  replied_at DATETIME NULL,
  sent_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY imap_uid (uidvalidity, uid),
  INDEX mail_received (received_at),
  INDEX mail_message (message_id)
);
-- Recent alerts per staff member (the bell in the admin header, and the app icon badge count).
CREATE TABLE IF NOT EXISTS staff_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(80) NOT NULL,
  body VARCHAR(120) NOT NULL DEFAULT '',
  open VARCHAR(40) NOT NULL DEFAULT '',
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX alerts_user (user_id, read_at, id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- My College List: colleges a student saved from scholarscafe.com/colleges (at most 25, one row each).
CREATE TABLE IF NOT EXISTS college_list (
  user_id CHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  round ENUM('','ed1','ed2','ea','rd') NOT NULL DEFAULT '',
  status ENUM('researching','applying','submitted','decision') NOT NULL DEFAULT 'researching',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (user_id, slug),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Deadline reminders already sent: one per student, college, round and offset (14, 7 or 1 days).
CREATE TABLE IF NOT EXISTS college_reminders (
  user_id CHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  round ENUM('ed1','ed2','ea','rd') NOT NULL,
  offset_days TINYINT UNSIGNED NOT NULL,
  deadline DATE NOT NULL,
  channel ENUM('push','email') NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, slug, round, offset_days),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
