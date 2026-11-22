// "Save to My List" from scholarscafe.com sends students to student.scholarscafe.com/my-list?add=<slug>
// &return=<page>. Only a page on our own website may be returned to (same-site allowlist), so the link
// can never be used to bounce someone to another site. Tested in my-list.test.js.

/** The website origin for this portal: https://student.scholarscafe.com -> https://scholarscafe.com. */
export function siteOrigins(portalOrigin) {
  try {
    const u = new URL(portalOrigin);
    const parts = u.hostname.split(".");
    if (u.protocol !== "https:" || parts.length < 3 || parts[0] !== "student") return [];
    return ["https://" + parts.slice(1).join(".")];
  } catch {
    return [];
  }
}

/** The return address if it is a /colleges page on an allowed origin, else null. */
export function safeReturn(raw, allowed) {
  if (typeof raw !== "string" || !raw || raw.length > 500) return null;
  let u;
  try {
    u = new URL(raw); // absolute only: a relative or protocol-relative value has no base and fails
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  if (!allowed.includes(u.origin)) return null;
  if (!/^\/colleges(\/[a-z0-9-]*)?\/?$/.test(u.pathname)) return null;
  return u.origin + u.pathname;
}

/** A college slug as used in /colleges/<slug>, else null. */
export const safeSlug = (raw) =>
  typeof raw === "string" && raw.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)
    ? raw
    : null;
