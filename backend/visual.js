// Visual editor: the Super Admin clicks a text on the real website (shown in a frame) and changes it.
// Each change is saved AND published at once (live in about a minute, no deploy), with a revision kept
// for undo. Only the one Super Admin account may use it: role owner AND the configured SUPER_ADMIN_EMAIL.
import { z } from "zod";
import { contentValid, KINDS } from "./security.js";

export const superAdminEmail = (config) =>
  (config.SUPER_ADMIN_EMAIL || config.OWNER_EMAIL || "contact.scholarscafe@gmail.com")
    .trim()
    .toLowerCase();
export const isSuperAdmin = (actor, config) =>
  actor?.role === "owner" && String(actor.email || "").toLowerCase() === superAdminEmail(config);

const key = z.string().regex(/^[A-Za-z0-9_.~-]{1,200}$/);
const editInput = z
  .object({
    target: z.discriminatedUnion("type", [
      z.object({ type: z.literal("copy"), key }).strict(),
      z
        .object({
          type: z.literal("entry"),
          id: z
            .string()
            .regex(/^[a-zA-Z0-9_.-]+$/)
            .max(120),
          // A text field, or one line of a list field ("features.2").
          field: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}(\.\d{1,3})?$/),
        })
        .strict(),
    ]),
    value: z.string().max(20000),
  })
  .strict();
const json = (v) => (typeof v === "string" ? JSON.parse(v) : v);

export function installVisualRoutes(app, { store, fail, config }) {
  const q = (sql, args, c) => store.query(sql, args, c);
  const only = (req) => {
    if (!isSuperAdmin(req.actor, config))
      throw fail(403, "The visual editor is only available to the Super Admin account.");
  };

  app.post("/api/visual/edit", async (req, res) => {
    only(req);
    const { target, value } = editInput.parse(req.body);
    const changed = await store.transaction(async (c) => {
      // Re-read the account inside the transaction: a revoked owner can't keep editing.
      const [actor] = await q(
        "SELECT role,active,email FROM users WHERE id=? FOR UPDATE",
        [req.actor.id],
        c,
      );
      if (!actor?.active || !isSuperAdmin(actor, config))
        throw fail(403, "Your access was removed.");
      let row;
      if (target.type === "copy") {
        const rows = await q(
          "SELECT id,kind,draft,published,version FROM content WHERE kind='copy' AND deleted_at IS NULL ORDER BY id FOR UPDATE",
          [],
          c,
        );
        const has = (r, where) =>
          r[where] && Object.prototype.hasOwnProperty.call(json(r[where]), target.key);
        // The entry that already holds this text (live first), else the visual editor's own entry.
        row = rows.find((r) => has(r, "published")) || rows.find((r) => has(r, "draft")) || null;
        const draft = { ...(row ? json(row.draft) || {} : {}), [target.key]: value };
        const published = { ...(row ? json(row.published) || {} : {}), [target.key]: value };
        if (!contentValid("copy", draft) || !contentValid("copy", published))
          throw fail(400, "That text can't be saved.");
        if (row) {
          await q(
            "INSERT INTO revisions (content_id,actor_id,snapshot) VALUES (?,?,?)",
            [row.id, req.actor.id, JSON.stringify(json(row.draft))],
            c,
          );
          await q(
            "UPDATE content SET draft=?,published=?,version=version+1 WHERE id=?",
            [JSON.stringify(draft), JSON.stringify(published), row.id],
            c,
          );
        } else {
          const [existing] = await q(
            "SELECT id,deleted_at FROM content WHERE id='copy-visual-editor' FOR UPDATE",
            [],
            c,
          );
          if (existing)
            await q(
              "UPDATE content SET draft=?,published=?,deleted_at=NULL,version=version+1 WHERE id='copy-visual-editor'",
              [JSON.stringify(draft), JSON.stringify(published)],
              c,
            );
          else
            await q(
              "INSERT INTO content (id,kind,title,draft,published) VALUES ('copy-visual-editor','copy','Visual editor text',?,?)",
              [JSON.stringify(draft), JSON.stringify(published)],
              c,
            );
        }
        await store.audit(req.actor.id, "visual_edit", "copy:" + target.key, c);
        return { key: target.key };
      }
      [row] = await q(
        "SELECT id,kind,draft,published FROM content WHERE id=? AND deleted_at IS NULL FOR UPDATE",
        [target.id],
        c,
      );
      if (!row || !row.published || row.kind === "copy" || !KINDS.includes(row.kind))
        throw fail(404, "That item isn't on the website.");
      const live = json(row.published);
      const [name, index] = target.field.split(".");
      const put = (data) => {
        if (index === undefined) return { ...data, [name]: value };
        const list = Array.isArray(data[name]) ? [...data[name]] : [];
        list[Number(index)] = value;
        return { ...data, [name]: list };
      };
      const current =
        index === undefined
          ? live[name]
          : Array.isArray(live[name])
            ? live[name][Number(index)]
            : undefined;
      if (typeof current !== "string") throw fail(400, "Only text can be changed here.");
      const published = put(live);
      const draft = put(json(row.draft) || live);
      if (!contentValid(row.kind, published) || !contentValid(row.kind, draft))
        throw fail(
          400,
          "That value isn't allowed here (for example, links must start with https://).",
        );
      await q(
        "INSERT INTO revisions (content_id,actor_id,snapshot) VALUES (?,?,?)",
        [row.id, req.actor.id, JSON.stringify(json(row.draft))],
        c,
      );
      await q(
        "UPDATE content SET draft=?,published=?,version=version+1 WHERE id=?",
        [JSON.stringify(draft), JSON.stringify(published), row.id],
        c,
      );
      await store.audit(req.actor.id, "visual_edit", `${row.kind}:${row.id}:${target.field}`, c);
      return { id: row.id, field: target.field };
    });
    res.json({ ok: true, changed });
  });
}
