import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";

export class Store {
  constructor(config) {
    this.config = config;
    this.pool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      connectionLimit: 5,
      timezone: "Z",
      charset: "utf8mb4",
    });
    // The driver reads dates as UTC, so every session must store and return UTC too
    // (otherwise TIMESTAMP columns shift by the server's local offset).
    this.pool.pool.on("connection", (c) => c.query("SET time_zone='+00:00'"));
  }
  async query(sql, args = [], connection = this.pool) {
    const rows = (await connection.execute(sql, args))[0];
    // MariaDB can return JSON columns as strings; MySQL returns parsed objects.
    if (Array.isArray(rows))
      for (const row of rows)
        for (const key of ["data", "draft", "published", "snapshot"]) {
          if (typeof row[key] === "string") row[key] = JSON.parse(row[key]);
        }
    return rows;
  }
  async transaction(fn) {
    const c = await this.pool.getConnection();
    try {
      await c.beginTransaction();
      const result = await fn(c);
      await c.commit();
      return result;
    } catch (e) {
      await c.rollback();
      throw e;
    } finally {
      c.release();
    }
  }
  async initialize() {
    const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
    for (const sql of schema.split(";").filter((s) => s.trim())) await this.query(sql);
    await this.migrate();
    // Bootstrap only an empty account list. Never re-enable a revoked owner at restart.
    await this.query(
      "INSERT INTO users (id,email,role) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM users existing)",
      [
        randomUUID(),
        (
          this.config?.SUPER_ADMIN_EMAIL ||
          this.config?.OWNER_EMAIL ||
          "contact.scholarscafe@gmail.com"
        )
          .trim()
          .toLowerCase(),
        "owner",
      ],
    );
    const seed = JSON.parse(await readFile(new URL("./seed.json", import.meta.url), "utf8"));
    for (const item of seed)
      await this.query(
        "INSERT IGNORE INTO content (id,kind,title,draft,published) VALUES (?,?,?,?,?)",
        [
          item.id,
          item.kind,
          item.title,
          JSON.stringify(item.data),
          item.draftOnly ? null : JSON.stringify(item.data),
        ],
      );
  }
  /** Idempotent upgrades for databases created by older versions. Safe to run on every start. */
  async migrate() {
    const has = async (table, column) =>
      (
        await this.query(
          "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?",
          [table, column],
        )
      ).length > 0;
    const add = async (table, column, ddl) => {
      if (!(await has(table, column))) await this.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    };
    await this.query(
      "ALTER TABLE users MODIFY role ENUM('owner','admin','editor','mentor','student') NOT NULL",
    );
    await add("content", "deleted_at", "deleted_at DATETIME NULL");
    await add(
      "inquiries",
      "status",
      "status ENUM('new','contacted','enrolled','closed') NOT NULL DEFAULT 'new'",
    );
    await add("inquiries", "notes", "notes TEXT NULL");
    await add("inquiries", "assigned_to", "assigned_to CHAR(36) NULL");
    await add("inquiries", "updated_at", "updated_at TIMESTAMP NULL");
    await add("users", "password_hash", "password_hash VARCHAR(255) NULL");
    await add("users", "failed_logins", "failed_logins INT NOT NULL DEFAULT 0");
    await add("users", "locked_until", "locked_until DATETIME NULL");
    // Private media (lesson videos) is never served by the public media route.
    await add(
      "media",
      "visibility",
      "visibility ENUM('public','private') NOT NULL DEFAULT 'public'",
    );
    await add("media", "mime", "mime VARCHAR(40) NOT NULL DEFAULT 'image/webp'");
    // Phase 3: lessons use disk videos (videos table); video_media_id stays for older uploads.
    await add("lms_lessons", "video_id", "video_id CHAR(36) NULL");
    // Phase 4: message attachments and moderation; testimonial consent on course reviews.
    await add("messages", "file_id", "file_id CHAR(36) NULL");
    await add("messages", "deleted_at", "deleted_at DATETIME NULL");
    await add("messages", "deleted_by", "deleted_by CHAR(36) NULL");
    await add("reviews", "public_consent", "public_consent BOOLEAN NOT NULL DEFAULT FALSE");
    await add("reviews", "featured", "featured BOOLEAN NOT NULL DEFAULT FALSE");
  }
  async audit(actor, action, target, c = this.pool) {
    await this.query(
      "INSERT INTO audit (actor_id,action,target) VALUES (?,?,?)",
      [actor, action, target],
      c,
    );
  }
  async session(hash) {
    const rows = await this.query(
      "SELECT u.id,u.email,u.role,s.csrf,(u.password_hash IS NOT NULL) AS has_password FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.active=1",
      [hash],
    );
    return rows[0];
  }
  async clean() {
    await this.query("DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP()");
    await this.query("DELETE FROM oauth_attempts WHERE expires_at<UTC_TIMESTAMP()");
    await this.query("DELETE FROM email_codes WHERE expires_at<UTC_TIMESTAMP()");
    await this.query("DELETE FROM rate_limits WHERE expires_at<UTC_TIMESTAMP()");
  }
  async checkRateLimit(scope, identity, limit, seconds) {
    const window = Math.floor(Date.now() / (seconds * 1000));
    const key = createHash("sha256").update(`${scope}:${identity}:${window}`).digest("hex");
    await this.query(
      "INSERT INTO rate_limits (bucket,hits,expires_at) VALUES (?,1,FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE hits=hits+1",
      [key, (window + 1) * seconds],
    );
    const rows = await this.query("SELECT hits FROM rate_limits WHERE bucket=?", [key]);
    return rows[0].hits <= limit;
  }
}
