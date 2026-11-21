// Schemas for the /resources/tools CMS kinds: prompts, toolValues, promptAngles.
import test from "node:test";
import assert from "node:assert/strict";
import { recordInput, contentValid, KINDS } from "./security.js";

const ok = (kind, data) =>
  recordInput.safeParse({ id: "x", kind, title: "t", data, version: 0 }).success;
const prompt = () => ({
  college: "Example College",
  list: "lac",
  cycle: "2026-27",
  text: "Why are you interested in Example College?",
  wordLimit: 250,
  limitNote: "",
  required: "required",
  archetype: "why-us",
  source: "https://admission.example.edu/apply/writing",
  asOf: "2026-11-21",
  position: 0,
});

test("The three tools kinds are registered", () => {
  for (const kind of ["prompts", "toolValues", "promptAngles"]) assert.ok(KINDS.includes(kind));
});

test("A valid prompt is accepted, and a 'no supplement' entry is valid", () => {
  assert.equal(ok("prompts", prompt()), true);
  assert.equal(
    ok("prompts", {
      ...prompt(),
      text: "No supplemental essays",
      wordLimit: 0,
      required: "none",
      archetype: "other",
    }),
    true,
  );
});

test("A prompt without a source, or with an unsafe source, is rejected", () => {
  assert.equal(ok("prompts", { ...prompt(), source: "" }), false);
  const { source, ...noSource } = prompt();
  void source;
  assert.equal(ok("prompts", noSource), false);
  assert.equal(ok("prompts", { ...prompt(), source: "http://admission.example.edu" }), false);
  assert.equal(ok("prompts", { ...prompt(), source: "javascript:alert(1)" }), false);
  assert.equal(ok("prompts", { ...prompt(), source: "https://u:p@example.edu" }), false);
});

test("Prompt fields are checked: empty text, bad dates, unknown archetype, extra fields", () => {
  assert.equal(ok("prompts", { ...prompt(), text: "  " }), false);
  assert.equal(ok("prompts", { ...prompt(), asOf: "21/11/2026" }), false);
  assert.equal(ok("prompts", { ...prompt(), cycle: "next year" }), false);
  assert.equal(ok("prompts", { ...prompt(), archetype: "essay" }), false);
  assert.equal(ok("prompts", { ...prompt(), wordLimit: -5 }), false);
  assert.equal(ok("prompts", { ...prompt(), html: "<script>" }), false);
});

test("Value cards and essay angles validate", () => {
  assert.equal(contentValid("toolValues", { label: "Family", hint: "", position: 0 }), true);
  assert.equal(contentValid("toolValues", { label: "", hint: "", position: 0 }), false);
  assert.equal(contentValid("toolValues", { label: "x".repeat(61), hint: "" }), false);
  assert.equal(
    contentValid("promptAngles", { archetype: "community", angle: "Write about…", position: 1 }),
    true,
  );
  assert.equal(contentValid("promptAngles", { archetype: "community", angle: "" }), false);
  assert.equal(contentValid("promptAngles", { archetype: "nope", angle: "x" }), false);
});
