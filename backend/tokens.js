// Short-lived signed links (video playback, file downloads). HMAC with a key that lives only in this process,
// so links die on restart and can't be minted elsewhere. Callers also bind them to the signed-in user.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const KEY = randomBytes(32);
const sign = (payload) => createHmac("sha256", KEY).update(payload).digest("base64url");

export function makeToken(data, seconds, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ ...data, e: Math.floor(now / 1000) + seconds }),
  ).toString("base64url");
  return payload + "." + sign(payload);
}
export function readToken(token, now = Date.now()) {
  const [payload, mac] = String(token).split(".");
  if (!payload || !mac) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.e * 1000 > now ? data : null;
  } catch {
    return null;
  }
}
