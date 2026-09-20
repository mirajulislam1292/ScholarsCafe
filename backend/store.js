import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export class Store {
  constructor(config) {
    this.pool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      connectionLimit: 5,
      timezone: "Z",
      charset: "utf8mb4",
    });
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
    // Bootstrap only an empty account list. Never re-enable a revoked owner at restart.
    await this.query(
      "INSERT INTO users (id,email,role) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM users existing)",
      [randomUUID(), "contact.scholarscafe@gmail.com", "owner"],
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
  async audit(actor, action, target, c = this.pool) {
    await this.query(
      "INSERT INTO audit (actor_id,action,target) VALUES (?,?,?)",
      [actor, action, target],
      c,
    );
  }
  async session(hash) {
    const rows = await this.query(
      "SELECT u.id,u.email,u.role,s.csrf FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.active=1",
      [hash],
    );
    return rows[0];
  }
  async clean() {
    await this.query("DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP()");
    await this.query("DELETE FROM oauth_attempts WHERE expires_at<UTC_TIMESTAMP()");
  }
}
