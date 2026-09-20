import { useState } from "react";

export function FeedbackForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setStatus("");
    try {
      const response = await fetch(import.meta.env.VITE_CONTENT_API + "/public/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit",
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), message: data.get("message"), consent: data.get("consent") === "on", website: data.get("website") || "" }),
      });
      if (!response.ok) throw new Error("Unable to save feedback. Please try again later.");
      setStatus("Thank you. Your feedback has been sent privately to our team."); form.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to connect."); }
    finally { setBusy(false); }
  }
  return <section id="feedback" className="bg-sky-soft px-5 py-16">
    <details className="mx-auto max-w-2xl rounded-3xl border border-sky-light bg-white p-7">
      <summary className="cursor-pointer font-display text-xl font-bold text-navy">Share feedback with our team</summary>
      <p className="mt-4 text-sm text-slate-600">Tell us what worked well or what we can improve. Your feedback stays private.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Your name<input name="name" required maxLength={160} className="mt-2 block w-full rounded-xl border p-3" /></label>
        <label className="block text-sm font-semibold">Email<input name="email" type="email" required maxLength={254} className="mt-2 block w-full rounded-xl border p-3" /></label>
        <label className="block text-sm font-semibold">Feedback<textarea name="message" required maxLength={5000} rows={4} className="mt-2 block w-full rounded-xl border p-3" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <label className="flex items-start gap-3 text-sm"><input name="consent" type="checkbox" required className="mt-1" /><span>I agree that Scholars Cafe may store this feedback and contact me about it. <a href="/privacy" className="underline">Privacy policy</a></span></label>
        <button disabled={busy} className="rounded-full bg-sky px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Sending…" : "Send feedback"}</button>
        <p role="status" className="text-sm">{status}</p>
      </form>
    </details>
  </section>;
}
