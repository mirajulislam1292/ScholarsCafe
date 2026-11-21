// Helpers for the college directory (/colleges): rates, taka figures, freshness, and the admin's
// "colleges" entries merged over the built-in list in src/data/college-directory.ts.
import { useCmsList } from "@/lib/cms";
import {
  BDT_RATE,
  COLLEGES,
  type College,
  type CollegeType,
  type Deadline,
  type EnglishMin,
  type Fig,
} from "@/data/college-directory";
import type { AidPolicy, TestPolicy } from "@/data/state-universities";

export const NP = "Not published";

/** Percentage from two official counts (e.g. CDS C1 admitted / applicants), one decimal. */
export function rate(admitted: Fig<number>, applicants: Fig<number>): number | null {
  if (admitted.value == null || !applicants.value) return null;
  return Math.round((admitted.value / applicants.value) * 1000) / 10;
}
export const admitRate = (c: College) => rate(c.admitted, c.applicants);

export const usd = (n: number) => "$" + n.toLocaleString("en-US");
/** USD to taka at the one fixed Bangladesh Bank rate, rounded to the nearest taka. */
export const toBdt = (n: number) => Math.round(n * BDT_RATE.value);
export const bdt = (n: number) => "৳" + toBdt(n).toLocaleString("en-IN");

/** Tuition + fees + room and board, only when all three are published (no partial totals). */
export function stickerUsd(c: College): number | null {
  const parts = [c.tuition.value, c.fees.value, c.roomBoard.value];
  return parts.every((v) => v != null) ? (parts as number[]).reduce((a, b) => a + b, 0) : null;
}

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function fmtDeadline(d: Deadline | null) {
  if (d == null) return NP;
  if (d === "not-offered") return "Not offered";
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
export const fmtEnglish = (v: EnglishMin | null) =>
  v == null ? NP : v === "none" ? "No minimum" : String(v);

/** True when the figures were last checked more than 12 months before `now`. */
export function isStale(asOf: string, now: Date = new Date()) {
  const t = Date.parse(asOf + "T00:00:00Z");
  if (!Number.isFinite(t)) return true;
  const limit = new Date(now);
  limit.setUTCFullYear(limit.getUTCFullYear() - 1);
  return t < limit.getTime();
}

export type Band = "under-10" | "10-20" | "20-35" | "over-35" | "none";
export const BAND_LABEL: Record<Band, string> = {
  "under-10": "Under 10%",
  "10-20": "10% to 20%",
  "20-35": "20% to 35%",
  "over-35": "Over 35%",
  none: "Not published",
};
export function band(c: College): Band {
  const r = admitRate(c);
  if (r == null) return "none";
  return r < 10 ? "under-10" : r < 20 ? "10-20" : r < 35 ? "20-35" : "over-35";
}

// ---------- Admin entries (flat fields, see backend/security.js "colleges") ----------
type Flat = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const orNull = (v: unknown) => s(v) || null;
function flatFig<T>(d: Flat, key: string, parse: (raw: string) => T | null): Fig<T> {
  const raw = s(d[key]);
  const source = s(d[key + "Source"]);
  const value = raw && source ? parse(raw) : null;
  return value == null ? { value: null, source: null } : { value, source };
}
const int = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : null);
const text = (raw: string) => raw || null;
const eng = (raw: string): EnglishMin | null =>
  raw === "none" ? "none" : Number.isFinite(Number(raw)) ? Number(raw) : null;

export function fromCms(d: Flat): College & { hidden: boolean } {
  return {
    slug: s(d.slug),
    name: s(d.name),
    type: (s(d.collegeType) === "NU" ? "NU" : "LAC") as CollegeType,
    city: s(d.city),
    state: s(d.state),
    code: s(d.code),
    rank: { label: s(d.rankLabel), edition: s(d.rankEdition), source: s(d.rankSource) },
    asOf: s(d.asOf),
    cdsYear: orNull(d.cdsYear),
    applicants: flatFig(d, "applicants", int),
    admitted: flatFig(d, "admitted", int),
    edApplicants: flatFig(d, "edApplicants", int),
    edAdmitted: flatFig(d, "edAdmitted", int),
    eaApplicants: flatFig(d, "eaApplicants", int),
    eaAdmitted: flatFig(d, "eaAdmitted", int),
    earlyNote: orNull(d.earlyNote),
    sat: flatFig(d, "sat", text),
    act: flatFig(d, "act", text),
    testPolicy: flatFig(d, "testPolicy", (r) => r as TestPolicy),
    testNote: orNull(d.testNote),
    needBasedForIntl: flatFig(d, "needBasedForIntl", (r) =>
      r === "yes" ? true : r === "no" ? false : null,
    ),
    intlAidPolicy: flatFig(d, "intlAidPolicy", (r) => r as AidPolicy),
    policyQuote: orNull(d.policyQuote),
    intlAided: flatFig(d, "intlAided", int),
    intlAvgAward: flatFig(d, "intlAvgAward", int),
    intlNote: orNull(d.intlNote),
    costYear: orNull(d.costYear),
    tuition: flatFig(d, "tuition", int),
    fees: flatFig(d, "fees", int),
    roomBoard: flatFig(d, "roomBoard", int),
    costNote: orNull(d.costNote),
    ielts: flatFig(d, "ielts", eng),
    toefl: flatFig(d, "toefl", eng),
    duolingo: flatFig(d, "duolingo", eng),
    englishNote: orNull(d.englishNote),
    nationalCurriculum: flatFig(d, "nationalCurriculum", text),
    ed1: flatFig(d, "ed1", text),
    ed2: flatFig(d, "ed2", text),
    ea: flatFig(d, "ea", text),
    rd: flatFig(d, "rd", text),
    deadlineNote: orNull(d.deadlineNote),
    highlight: s(d.highlight),
    image:
      s(d.image) && s(d.imagePage) && s(d.imageLicence)
        ? {
            src: s(d.image),
            card: s(d.image),
            title: s(d.imageTitle) || s(d.imagePage),
            page: s(d.imagePage),
            author: s(d.imageAuthor) || "Unknown author",
            licence: s(d.imageLicence),
            licenceUrl: orNull(d.imageLicenceUrl),
          }
        : null,
    urls: {
      admissions: orNull(d.urlAdmissions),
      international: orNull(d.urlInternational),
      aid: orNull(d.urlAid),
      cds: orNull(d.urlCds),
    },
    hidden: d.hidden === true,
  };
}

/** Built-in colleges with the admin's published entries applied: same slug replaces, new slug adds, hidden removes. */
export function mergeColleges(base: College[], cms: (College & { hidden: boolean })[]): College[] {
  const bySlug = new Map(base.map((c) => [c.slug, c]));
  for (const c of cms) {
    if (!c.slug || !c.name) continue;
    if (c.hidden) bySlug.delete(c.slug);
    else bySlug.set(c.slug, c);
  }
  return [...bySlug.values()];
}

export function useColleges(): College[] {
  const cms = useCmsList("colleges", [] as (College & { hidden: boolean })[], (d) => fromCms(d));
  return mergeColleges(COLLEGES, cms);
}
