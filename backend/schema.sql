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
  attempts INT NOT NULL DEFAULT 0,
  sent_at DATETIME NULL,
  next_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
