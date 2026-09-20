import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import { EMAIL as CMS_DEFAULT_EMAIL, PHONE as CMS_DEFAULT_PHONE, WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";
import { Mail, MessageCircle, MapPin, Check, Facebook, Instagram, Linkedin, Phone } from "lucide-react";

const INTERESTS = [
  "Full Scholarship Track", "General Admission Track", "File Opening",
  "Essay Review", "College List Building", "Visa Appointment Support",
  "CSS Profile / ISFAA", "Just Exploring",
];
const COUNTRIES = ["USA", "UK", "Canada", "Germany", "Sweden", "Netherlands", "Finland", "New Zealand", "Hungary", "South Korea", "Turkey", "Spain", "Other / Not Sure"];
const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Gap Year", "Other"];

export function Contact() {
 const cmsLabel = useCmsLookup();

  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const PHONE = useCmsValue("data.PHONE", CMS_DEFAULT_PHONE);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const [done, setDone] = useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');
    const endpoint=import.meta.env.VITE_CONTENT_API;
    if(!endpoint){setError('Online messages are being set up. Please contact us by WhatsApp or email.');return;}
    const data=new FormData(event.currentTarget);setSending(true);
    try{
      const message=['Interest: '+data.get("I'm Interested In"),'Country: '+data.get('Target Country'),'Grade: '+data.get('Current Grade / Year'),String(data.get('message')||'')].join('\n');
      const response=await fetch(endpoint+'/public/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({name:data.get('name'),email:data.get('email'),phone:data.get('phone'),message})});
      if(!response.ok)throw new Error('Unable to send. Please try again or contact us by WhatsApp.');
      setDone(true);
    }catch(e){setError(e instanceof Error?e.message:'Unable to send.');}finally{setSending(false);}
  }
  return (
    <section id="contact" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-sky"><CmsText id="Contact.3ee6cddb8ee0">Get In Touch</CmsText></span>
          <h2 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-navy"><CmsText id="Contact.231ff83a4896">
            Let's Plan Your Future Together
          </CmsText></h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600"><CmsText id="Contact.d939b4bf1168">
            Have a question? Ready to start? Just reach out. We respond within 24 hours and always give honest, personalized advice.
          </CmsText></p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left: contact info */}
          <Reveal className="space-y-6">
            <ContactItem icon={<Mail className="h-5 w-5" />} title={cmsLabel("Contact.label.969ccbd3cf63","Email")} value={EMAIL} sub={cmsLabel("Contact.label.fd1694902105","We respond within 24 hours on weekdays.")} href={`mailto:${EMAIL}`} />
            <ContactItem icon={<MessageCircle className="h-5 w-5" />} title={cmsLabel("Contact.label.6770004b0939","WhatsApp / Phone")} value={PHONE} sub={cmsLabel("Contact.label.bcc306679bf2","Chat with us anytime. WhatsApp is our fastest channel.")} href={WA_LINK} />
            <ContactItem icon={<MapPin className="h-5 w-5" />} title={cmsLabel("Contact.label.15b61974b270","Location")} value="Bangladesh" sub={cmsLabel("Contact.label.5b9d8fb22df4","We serve students nationwide + internationally. All consultations online.")} />

            <div>
              <div className="font-display text-lg font-bold text-navy"><CmsText id="Contact.bb8bb7523e6d">Follow Our Journey</CmsText></div>
              <p className="text-sm text-slate-500"><CmsText id="Contact.66567e0fc9b3">Weekly tips, scholarships, and student wins on social.</CmsText></p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Social href="https://www.facebook.com/profile.php?id=61571394902795" label={cmsLabel("Contact.label.d41f5b4977ee","Facebook")}><Facebook className="h-5 w-5" /></Social>
                <Social href="https://www.instagram.com/scholars_cafe_/" label={cmsLabel("Contact.label.bad57ef7837c","Instagram")}><Instagram className="h-5 w-5" /></Social>
                <Social href="https://www.linkedin.com/company/scholars-cafe09/" label={cmsLabel("Contact.label.dd84425b72da","LinkedIn")}><Linkedin className="h-5 w-5" /></Social>
                <Social href="https://www.tiktok.com/@scholars.cafe" label={cmsLabel("Contact.label.1bb6fcfbf136","TikTok")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.94a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/></svg>
                </Social>
                <Social href={WA_LINK} label={cmsLabel("Contact.label.6a40edf1fc87","WhatsApp")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487 2.981 1.287 2.981.858 3.518.804.537-.054 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
                </Social>
              </div>
            </div>

            <div className="rounded-3xl border-[1.5px] border-sky-tint bg-sky-soft p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-tint text-sky-deep">
                <Phone className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <div className="mt-3 font-display text-lg font-bold text-navy"><CmsText id="Contact.46454eeca3ea">Book a Free 30-Minute Consultation</CmsText></div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600"><CmsText id="Contact.253203ee4e24">
                No pressure. No commitment. Just honest guidance on your study abroad options from a real person who knows the process.
              </CmsText></p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-sky px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#335579] hover:shadow-button"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /><CmsText id="Contact.6262cd58b9d5">
                WhatsApp us now →
              </CmsText></a>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal>
            <div className="rounded-3xl border border-border bg-white p-8 shadow-card md:p-10">
              <h3 className="font-display text-xl font-extrabold text-navy"><CmsText id="Contact.19ecf8fecb75">Send Us a Message</CmsText></h3>
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-2xl bg-sky-soft p-7 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky text-white">
                    <Check className="h-6 w-6" strokeWidth={3} />
                  </div>
                  <div className="mt-4 font-display text-lg font-bold text-navy"><CmsText id="Contact.89602ec37891">Message received!</CmsText></div>
                  <p className="mt-2 text-sm text-slate-600"><CmsText id="Contact.056ee3330478">
                    We'll be in touch within 24 hours. In the meantime, feel free to WhatsApp us for faster response.
                  </CmsText></p>
                  <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-sky-deep hover:underline"><CmsText id="Contact.a75653166353">
                    Open WhatsApp →
                  </CmsText></a>
                </motion.div>
              ) : (
                <form
                  onSubmit={submit}
                  className="mt-6 space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={cmsLabel("Contact.label.8fec1bff94bf","Full Name *")} name="name" required />
                    <Field label={cmsLabel("Contact.label.80e341bf0403","Phone / WhatsApp *")} name="phone" required />
                  </div>
                  <Field label={cmsLabel("Contact.label.1b72562c828c","Email Address *")} name="email" type="email" required />
                  <SelectField label={cmsLabel("Contact.label.d07f5ef208e1","I'm Interested In")} options={INTERESTS} />
                  <SelectField label={cmsLabel("Contact.label.8270cf12a2cb","Target Country")} options={COUNTRIES} />
                  <SelectField label={cmsLabel("Contact.label.94504bf36254","Current Grade / Year")} options={GRADES} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-navy"><CmsText id="Contact.b5be5d4eaaf4">Your Message</CmsText></label>
                    <textarea
                      name="message"
                      maxLength={4000}
                      rows={5}
                      placeholder={cmsLabel("Contact.label.2acc8f94e428","Tell us about your background, goals, target universities, timeline, and any questions you have.")}
                      className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-full bg-navy py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-sky hover:shadow-button"
                  ><CmsText id="Contact.42d2a8b329f6">
                    Send Message →
                  </CmsText></button>
                </form>
              )}
              {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon, title, value, sub, href }: { icon: React.ReactNode; title: string; value: string; sub: string; href?: string }) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const PHONE = useCmsValue("data.PHONE", CMS_DEFAULT_PHONE);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const Inner = (
    <div className="flex items-start gap-4 rounded-2xl border border-border p-5 transition-all hover:border-sky hover:bg-sky-soft">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sky-tint text-sky-deep">{icon}</div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</div>
        <div className="mt-0.5 font-display text-base font-bold text-navy">{value}</div>
        <div className="mt-1 text-sm text-slate-500">{sub}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{Inner}</a> : Inner;
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const PHONE = useCmsValue("data.PHONE", CMS_DEFAULT_PHONE);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-white text-slate-600 transition-all hover:scale-110 hover:border-sky hover:bg-sky hover:text-white"
    >
      {children}
    </a>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const PHONE = useCmsValue("data.PHONE", CMS_DEFAULT_PHONE);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-navy">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15"
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  const EMAIL = useCmsValue("data.EMAIL", CMS_DEFAULT_EMAIL);
  const PHONE = useCmsValue("data.PHONE", CMS_DEFAULT_PHONE);
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-navy">{label}</label>
      <select name={label} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15">
        <option value=""><CmsText id="Contact.8e8522783c86">Select an option…</CmsText></option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const EMAIL = CMS_DEFAULT_EMAIL;
const PHONE = CMS_DEFAULT_PHONE;
const WA_LINK = CMS_DEFAULT_WA_LINK;
