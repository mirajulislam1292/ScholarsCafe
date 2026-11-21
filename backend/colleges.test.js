import test from "node:test";
import assert from "node:assert/strict";
import { COLLEGE_FIGURES, contentValid, recordInput } from "./security.js";

// A blank "colleges" entry, as the admin's + Add entry creates it.
function blank() {
  const d = {
    slug: "test-college",
    name: "Test College",
    collegeType: "LAC",
    city: "Town",
    state: "Maine",
    code: "ME",
    rankLabel: "",
    rankEdition: "",
    rankSource: "",
    asOf: "2026-11-21",
    cdsYear: "",
    earlyNote: "",
    testNote: "",
    policyQuote: "",
    intlNote: "",
    costYear: "",
    costNote: "",
    englishNote: "",
    deadlineNote: "",
    highlight: "",
    image: "",
    imageTitle: "",
    imagePage: "",
    imageAuthor: "",
    imageLicence: "",
    imageLicenceUrl: "",
    urlAdmissions: "",
    urlInternational: "",
    urlAid: "",
    urlCds: "",
    hidden: false,
    position: 0,
  };
  for (const k of Object.keys(COLLEGE_FIGURES)) d[k] = d[k + "Source"] = "";
  return d;
}
const SRC = "https://www.example.edu/cds.pdf";

test("colleges: a blank entry is valid (every figure not published)", () => {
  assert.equal(contentValid("colleges", blank()), true);
});

test("colleges: a figure without a source is rejected", () => {
  assert.equal(contentValid("colleges", { ...blank(), applicants: "12000" }), false);
  assert.equal(contentValid("colleges", { ...blank(), testPolicy: "optional" }), false);
  assert.equal(
    contentValid("colleges", { ...blank(), applicants: "12000", applicantsSource: SRC }),
    true,
  );
});

test("colleges: sources and links must be HTTPS without credentials", () => {
  const bad = ["http://example.edu/x", "javascript:alert(1)", "https://u:p@example.edu/"];
  for (const url of bad) {
    assert.equal(contentValid("colleges", { ...blank(), sat: "1400-1500", satSource: url }), false);
    assert.equal(contentValid("colleges", { ...blank(), urlAid: url }), false);
  }
});

test("colleges: figure formats are checked (no estimates like '~10%')", () => {
  const ok = (patch) => contentValid("colleges", { ...blank(), ...patch });
  assert.equal(ok({ admitted: "~900", admittedSource: SRC }), false);
  assert.equal(ok({ sat: "1500", satSource: SRC }), false);
  assert.equal(ok({ ielts: "7.5", ieltsSource: SRC }), true);
  assert.equal(ok({ ielts: "none", ieltsSource: SRC }), true);
  assert.equal(ok({ ed1: "Nov 1", ed1Source: SRC }), false);
  assert.equal(ok({ ed2: "not-offered", ed2Source: SRC }), true);
  assert.equal(ok({ asOf: "" }), false);
  assert.equal(ok({ collegeType: "University" }), false);
});

test("colleges: a photo needs its Commons page and licence", () => {
  const photo = { image: "/media/colleges/x.webp" };
  assert.equal(contentValid("colleges", { ...blank(), ...photo }), false);
  assert.equal(
    contentValid("colleges", {
      ...blank(),
      ...photo,
      imagePage: "https://commons.wikimedia.org/wiki/File:X.jpg",
      imageLicence: "CC BY-SA 4.0",
    }),
    true,
  );
});

test("colleges: unknown fields are rejected and the kind is accepted by the editor API", () => {
  assert.equal(contentValid("colleges", { ...blank(), extra: "x" }), false);
  const rec = (data) =>
    recordInput.safeParse({ id: "c1", kind: "colleges", title: "Test", data, version: 0 }).success;
  assert.equal(rec(blank()), true);
  assert.equal(rec({ ...blank(), toefl: "100" }), false);
});
