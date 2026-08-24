import type { ScholarIconName } from "./scholar-icon-types";

export const WA_LINK = "https://wa.me/8801560001325";
export const EMAIL = "contact@scholarscafe.com";
export const PHONE = "+880 1560-001325";

export const COUNTRIES = [
  { flag: "🇺🇸", name: "USA", tag: "Primary focus", featured: true, note: "Need-based aid · Top-50 admissions" },
  { flag: "🇬🇧", name: "United Kingdom", tag: "UCAS Support", note: "Russell Group · Merit scholarships" },
  { flag: "🇨🇦", name: "Canada", tag: "SDS Visa", note: "U of T · UBC · McGill" },
  { flag: "🇩🇪", name: "Germany", tag: "Free Tuition", note: "TU Munich · RWTH · Heidelberg" },
  { flag: "🇸🇪", name: "Sweden", tag: "SI Scholarship", note: "Uppsala · Lund · KTH" },
  { flag: "🇳🇱", name: "Netherlands", tag: "English-Taught", note: "TU Delft · Amsterdam · Utrecht" },
  { flag: "🇫🇮", name: "Finland", tag: "Nordic Quality", note: "Aalto · Helsinki · Tampere" },
  { flag: "🇳🇿", name: "New Zealand", tag: "Student-Friendly", note: "Auckland · Otago · Victoria" },
  { flag: "🇭🇺", name: "Hungary", tag: "Stipendium Hungaricum", note: "Affordable · Government-funded" },
  { flag: "🇰🇷", name: "South Korea", tag: "GKS Full Scholarship", note: "Yonsei · KAIST · SNU" },
  { flag: "🇹🇷", name: "Turkey", tag: "Türkiye Burs", note: "Tuition + stipend covered" },
  { flag: "🇪🇸", name: "Spain", tag: "Cultural & Affordable", note: "Madrid · Barcelona · IE" },
];

export const STATS = [
  { value: 12, suffix: "+", label: "Study Destinations" },
  { value: 100, suffix: "%", label: "Dedicated Support" },
  { value: 30, suffix: " min", label: "Free Consultation" },
  { value: 500, suffix: "+", label: "Students Learning" },
];

export const PROGRAMS: { id: string; icon: ScholarIconName; badge: string; title: string; price: string; description: string; features: string[]; cta: string; featured: boolean }[] = [
  {
    id: "scholarship",
    icon: "trophy" satisfies ScholarIconName,
    badge: "Most popular",
    title: "Full Scholarship Track",
    price: "Custom pricing · Book a call for quote",
    description:
      "Our flagship program for students aiming at need-based and merit-based scholarships at elite universities, from Ivy League to top liberal arts colleges.",
    features: [
      "Personalized college list (15–20 universities)",
      "CSS Profile + ISFAA full guidance",
      "Common App + supplemental essays",
      "Teacher & counselor portal coordination",
      "Strategic financial aid positioning",
      "Mock interviews + scholarship interview prep",
    ],
    cta: "Apply for Scholarship Track",
    featured: true,
  },
  {
    id: "general",
    icon: "graduation-cap" satisfies ScholarIconName,
    badge: "Standard path",
    title: "General Admission Track",
    price: "Tiered packages · See pricing",
    description:
      "Structured, mentor-led admissions support for students applying to top universities worldwide, without the scholarship intensity.",
    features: [
      "University shortlisting (10–12 schools)",
      "Application form completion",
      "SOP & personal statement coaching",
      "Recommendation letter strategy",
      "Visa appointment guidance",
      "Post-acceptance support",
    ],
    cta: "Start General Admission",
    featured: false,
  },
  {
    id: "file",
    icon: "folder-open" satisfies ScholarIconName,
    badge: "Quick start",
    title: "File Opening Service",
    price: "Per-application pricing",
    description:
      "For students who know exactly where they want to apply but need expert hands to open and submit files cleanly, on time, every time.",
    features: [
      "Common App / UCAS account setup",
      "Document checklist & verification",
      "Form filling with full review",
      "Deadline tracking dashboard",
      "Submission confirmation",
      "Light essay polish",
    ],
    cta: "Open Your File",
    featured: false,
  },
];

export const SERVICES: { icon: ScholarIconName; title: string; desc: string }[] = [
  { icon: "target" satisfies ScholarIconName, title: "Personalized Pathway Planning", desc: "Tailored country, university and timeline strategy from day one." },
  { icon: "pen-line" satisfies ScholarIconName, title: "Essay & SOP Coaching", desc: "Multiple drafts, real feedback, voice that admissions remembers." },
  { icon: "banknote" satisfies ScholarIconName, title: "CSS Profile & ISFAA", desc: "Every field explained. Every document gathered. Done right." },
  { icon: "library" satisfies ScholarIconName, title: "College List Building", desc: "Reach, target, safety, calibrated to your profile and finances." },
  { icon: "school" satisfies ScholarIconName, title: "Teacher Portal Support", desc: "We walk your teachers through recommendation submissions." },
  { icon: "compass" satisfies ScholarIconName, title: "Counselor Portal Support", desc: "School counselor section coordination so nothing slips." },
  { icon: "stamp" satisfies ScholarIconName, title: "F-1 Visa Preparation", desc: "DS-160, SEVIS, financial docs, and full mock interviews." },
  { icon: "luggage" satisfies ScholarIconName, title: "Pre-Departure & Beyond", desc: "Housing, banking, packing, and your first weeks abroad." },
];

export const PROCESS: { n: number; icon: ScholarIconName; title: string; desc: string }[] = [
  { n: 1, icon: "message-circle" satisfies ScholarIconName, title: "Discovery Call", desc: "A free, honest conversation about your goals, profile, and realistic options." },
  { n: 2, icon: "compass" satisfies ScholarIconName, title: "Strategy & Roadmap", desc: "Country mix, college list, timeline, and a personalized prep plan." },
  { n: 3, icon: "trending-up" satisfies ScholarIconName, title: "Profile Building", desc: "Test prep, extracurricular shaping, and academic positioning." },
  { n: 4, icon: "file-text" satisfies ScholarIconName, title: "Application Preparation", desc: "Essays, forms, portals, financial aid, every part together step by step." },
  { n: 5, icon: "send" satisfies ScholarIconName, title: "Submit & Follow Up", desc: "On-time submissions, response tracking, and quick follow-ups." },
  { n: 6, icon: "party-popper" satisfies ScholarIconName, title: "Acceptance & Next Steps", desc: "Offer evaluation, aid negotiation, visa, departure." },
];

export const TESTS = [
  {
    abbr: "SAT",
    full: "Scholastic Aptitude Test",
    badge: "🇺🇸 Required for US Admission",
    accent: "#0EA5E9",
    description:
      "The SAT is the cornerstone of most US university applications. Our structured mentorship covers Math, Reading & Writing, vocabulary, and exam-day strategy, tailored to each student.",
    features: [
      "Math + Evidence-Based Reading & Writing",
      "Practice tests with performance analytics",
      "Artemis Critical Reading Program",
      "SAT vocabulary & comprehension building",
      "Timed mock exams",
      "Personalized 8 / 12 / 16-week schedules",
    ],
    target: "Our students regularly achieve 1450+",
  },
  {
    abbr: "IELTS",
    full: "International English Language Testing System",
    badge: "🇬🇧 UK · Canada · Australia · NZ",
    accent: "#8B5CF6",
    description:
      "Accepted by 11,000+ institutions worldwide. We coach all four bands so your overall score reflects what you're truly capable of.",
    features: [
      "Listening, Reading, Writing, Speaking",
      "Examiner-standard speaking mocks",
      "Task 1 + Task 2 writing templates",
      "Reading speed & comprehension",
      "Listening section strategies",
    ],
    target: "Target: Band 7.0+",
  },
  {
    abbr: "TOEFL",
    full: "Test of English as a Foreign Language (iBT)",
    badge: "USA · Europe · Global",
    accent: "#F59E0B",
    description:
      "TOEFL iBT is widely accepted at US universities. We focus on integrated tasks, note-taking, and academic English, what TOEFL rewards most.",
    features: [
      "Reading + Listening + Speaking + Writing",
      "Integrated task practice",
      "Speaking fluency & pronunciation",
      "Academic writing structure",
      "Full-length practice tests",
    ],
    target: "Target: 100+ iBT",
  },
  {
    abbr: "DET",
    full: "Duolingo English Test",
    badge: "Fast & affordable",
    accent: "#22C55E",
    description:
      "The modern alternative, taken online in 1 hour with results in 48 hours, accepted by 5,000+ institutions including many top US universities.",
    features: [
      "Full test format walkthrough",
      "Video interview preparation",
      "Writing sample coaching",
      "Adaptive test strategies",
      "Score interpretation & target planning",
    ],
    target: "Target: 120+",
  },
];

export type University = {
  name: string;
  country: string;
  flag: string;
  type: "Liberal Arts" | "Research" | "Technical/STEM" | "Arts & Design";
  scholarship: "Need-Based 100%" | "Need-Based" | "Merit-Based" | "Full Scholarship" | "Limited Aid" | "State University";
  tuition: "Free" | "$0-10k" | "$10-30k" | "$30k+";
  acceptance: string;
};

export const UNIVERSITIES: University[] = [
  // USA
  { name: "Harvard University", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Need-Based 100%", tuition: "$30k+", acceptance: "3%" },
  { name: "MIT", country: "USA", flag: "🇺🇸", type: "Technical/STEM", scholarship: "Need-Based 100%", tuition: "$30k+", acceptance: "4%" },
  { name: "Amherst College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based 100%", tuition: "$30k+", acceptance: "11%" },
  { name: "Grinnell College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based", tuition: "$30k+", acceptance: "16%" },
  { name: "Williams College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based 100%", tuition: "$30k+", acceptance: "9%" },
  { name: "Vassar College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based", tuition: "$30k+", acceptance: "25%" },
  { name: "Hamilton College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based", tuition: "$30k+", acceptance: "18%" },
  { name: "Macalester College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based", tuition: "$30k+", acceptance: "28%" },
  { name: "Bates College", country: "USA", flag: "🇺🇸", type: "Liberal Arts", scholarship: "Need-Based", tuition: "$30k+", acceptance: "14%" },
  { name: "NYU", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Limited Aid", tuition: "$30k+", acceptance: "13%" },
  { name: "UCLA", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "State University", tuition: "$30k+", acceptance: "9%" },
  { name: "UC Berkeley", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "State University", tuition: "$30k+", acceptance: "11%" },
  { name: "Johns Hopkins", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Need-Based", tuition: "$30k+", acceptance: "8%" },
  { name: "Northwestern University", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Need-Based", tuition: "$30k+", acceptance: "7%" },
  { name: "Tufts University", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Need-Based", tuition: "$30k+", acceptance: "11%" },
  { name: "Rice University", country: "USA", flag: "🇺🇸", type: "Research", scholarship: "Need-Based", tuition: "$30k+", acceptance: "9%" },
  // UK
  { name: "UCL", country: "UK", flag: "🇬🇧", type: "Research", scholarship: "Merit-Based", tuition: "$30k+", acceptance: "63%" },
  { name: "University of Edinburgh", country: "UK", flag: "🇬🇧", type: "Research", scholarship: "Merit-Based", tuition: "$30k+", acceptance: "40%" },
  { name: "Imperial College London", country: "UK", flag: "🇬🇧", type: "Technical/STEM", scholarship: "Merit-Based", tuition: "$30k+", acceptance: "14%" },
  { name: "University of Manchester", country: "UK", flag: "🇬🇧", type: "Research", scholarship: "Merit-Based", tuition: "$10-30k", acceptance: "57%" },
  // Canada
  { name: "University of Toronto", country: "Canada", flag: "🇨🇦", type: "Research", scholarship: "Limited Aid", tuition: "$30k+", acceptance: "43%" },
  { name: "UBC", country: "Canada", flag: "🇨🇦", type: "Research", scholarship: "Limited Aid", tuition: "$30k+", acceptance: "52%" },
  { name: "McGill University", country: "Canada", flag: "🇨🇦", type: "Research", scholarship: "Limited Aid", tuition: "$10-30k", acceptance: "46%" },
  // Germany
  { name: "TU Munich", country: "Germany", flag: "🇩🇪", type: "Technical/STEM", scholarship: "Full Scholarship", tuition: "Free", acceptance: "8%" },
  { name: "RWTH Aachen", country: "Germany", flag: "🇩🇪", type: "Technical/STEM", scholarship: "Full Scholarship", tuition: "Free", acceptance: "10%" },
  { name: "Heidelberg University", country: "Germany", flag: "🇩🇪", type: "Research", scholarship: "Full Scholarship", tuition: "Free", acceptance: "Open" },
  // Sweden
  { name: "Uppsala University", country: "Sweden", flag: "🇸🇪", type: "Research", scholarship: "Merit-Based", tuition: "$10-30k", acceptance: "Open" },
  { name: "Lund University", country: "Sweden", flag: "🇸🇪", type: "Research", scholarship: "Merit-Based", tuition: "$10-30k", acceptance: "Open" },
  { name: "KTH Royal Institute", country: "Sweden", flag: "🇸🇪", type: "Technical/STEM", scholarship: "Merit-Based", tuition: "$10-30k", acceptance: "Open" },
  // South Korea
  { name: "Yonsei University", country: "South Korea", flag: "🇰🇷", type: "Research", scholarship: "Full Scholarship", tuition: "$0-10k", acceptance: "Competitive" },
  { name: "KAIST", country: "South Korea", flag: "🇰🇷", type: "Technical/STEM", scholarship: "Full Scholarship", tuition: "$0-10k", acceptance: "Competitive" },
  { name: "Seoul National University", country: "South Korea", flag: "🇰🇷", type: "Research", scholarship: "Full Scholarship", tuition: "$0-10k", acceptance: "Competitive" },
];

export const TESTIMONIALS = [
  {
    initials: "RA",
    name: "Rafi Ahmed",
    destination: "🇺🇸 USA Liberal Arts College",
    year: "Class of 2024",
    quote:
      "I had no idea where to start with US college applications. Common App, CSS Profile, financial aid forms, it felt impossible. The team at Scholars Cafe broke everything down for me. My mentor was available whenever I had a question, and we worked through every essay together: five drafts, genuine feedback, real improvement. I ended up getting into a top liberal arts college with a need-based aid package that covers more than half my tuition. It changed my life.",
    outcome: "50%+ need-based financial aid",
    color: "from-sky to-navy",
  },
  {
    initials: "TI",
    name: "Tasfia Islam",
    destination: "🇬🇧 UK University",
    year: "Class of 2024",
    quote:
      "My IELTS score was holding me back. I had the grades, I had the motivation, but I kept scoring Band 6.5 on my own. After just 6 weeks of preparation with Scholars Cafe, I hit Band 7.5. Their speaking mocks were especially helpful, with feedback no online course ever gave me. I applied to UK universities and got an offer from my first-choice institution. The visa guidance was incredible, and I walked into my appointment completely calm.",
    outcome: "IELTS 7.5 · First-choice offer",
    color: "from-fuchsia-500 to-navy",
  },
  {
    initials: "MH",
    name: "Mahir Hasan",
    destination: "🇺🇸 Top 50 US University",
    year: "Class of 2024",
    quote:
      "CSS Profile and ISFAA looked like another language to me. I was ready to give up on schools that required them. My consultant at Scholars Cafe sat with me for hours, explained every single field, helped me gather the right documents, and reviewed the forms multiple times. The result? Over 70% in need-based aid at a top-50 US university. No Bangladeshi student should miss out because of a form.",
    outcome: "70%+ need-based aid awarded",
    color: "from-emerald-500 to-navy",
  },
  {
    initials: "NR",
    name: "Nadia Rahman",
    destination: "🇰🇷 South Korea (GKS)",
    year: "Class of 2024",
    quote:
      "I never thought South Korea was an option for me until Scholars Cafe introduced me to the GKS scholarship. They helped me with every part: language assessment, study plan, professor contact emails, everything. I got accepted with a full scholarship covering tuition, dormitory, and monthly stipend. This is a life I never imagined I could have.",
    outcome: "Full GKS scholarship",
    color: "from-amber-500 to-navy",
  },
];

export const FAQS = [
  {
    q: "Who is Scholars Cafe for?",
    a: "Scholars Cafe is for Bangladeshi students at any stage of the study abroad journey, from those just exploring options to students actively applying. We work with grades 9–12 and gap year students, and we also support parents who want to understand the process alongside their children.",
  },
  {
    q: "What countries do you support applications for?",
    a: "Our primary expertise is USA university admissions. We also support UK, Canada, Germany, Sweden, Netherlands, Finland, New Zealand, Hungary, South Korea, Turkey, and Spain. If you have a specific country not on this list, reach out. We can often still help.",
  },
  {
    q: "What is the Full Scholarship Track and who should apply?",
    a: "Our flagship program for students targeting need-based or merit-based scholarships at elite universities, particularly in the USA. It is best suited for students with a strong academic profile (GPA 3.5+ or equivalent) and demonstrated financial need, aiming for universities that meet 100% of demonstrated need, including liberal arts colleges and Ivy League schools.",
  },
  {
    q: "What is the difference between the CSS Profile and ISFAA?",
    a: "Both are financial aid application forms used by US universities. The CSS Profile (College Scholarship Service) is used by 400+ institutions and collects detailed family financial information. The ISFAA is an alternative used by institutions that don't require the CSS Profile. We guide students through both forms completely.",
  },
  {
    q: "Do I need a strong SAT score to apply to US universities?",
    a: "Many top US universities have moved to test-optional policies, but a strong SAT score (1450+) significantly strengthens applications and may be required for merit scholarships. We recommend all students preparing for US applications to take the SAT.",
  },
  {
    q: "Which English proficiency test should I take: IELTS, TOEFL, or DET?",
    a: "It depends on your target countries and universities. IELTS is widely used for UK, Canada, Australia, and New Zealand. TOEFL is preferred by many US universities. The DET is the most affordable and convenient and is accepted by 5,000+ institutions. During your free consultation, we help you decide.",
  },
  {
    q: "How much does Scholars Cafe charge for its services?",
    a: "Pricing depends on the services you select. Individual services are priced separately, and full program tracks are quoted based on your specific needs. Full transparency: you'll always know exactly what you're paying for. Book a free consultation to walk through all options with no pressure.",
  },
  {
    q: "When should I start working with Scholars Cafe?",
    a: "The earlier the better. Ideally, students should begin US applications in Grade 11 or early Grade 12 (August–September). For scholarship-focused tracks, starting in Grade 10 gives time to build extracurriculars and prepare for tests. Even if you're already in Grade 12, we can still help. Contact us immediately.",
  },
  {
    q: "Do you help with visa applications?",
    a: "Yes. After receiving your acceptance letter, we guide you through document preparation, DS-160, interview preparation, financial documentation, and SEVIS fee payment. You walk into your visa appointment with full confidence.",
  },
  {
    q: "Can I reach you on WhatsApp?",
    a: "Absolutely. WhatsApp is our primary communication channel: +880 1560-001325. Our team responds within 24 hours on weekdays.",
  },
];

export const VALUES: { icon: ScholarIconName; title: string; desc: string }[] = [
  { icon: "target" satisfies ScholarIconName, title: "Expert Mentorship", desc: "Consultants with deep US and global admissions knowledge. Not agents, but mentors who care about your outcome." },
  { icon: "globe" satisfies ScholarIconName, title: "International Reach", desc: "12+ countries. Hundreds of universities. A network built over years of real-world application experience." },
  { icon: "heart" satisfies ScholarIconName, title: "Student-First", desc: "Every student gets dedicated attention, honest advice, and real support. We never give generic guidance." },
  { icon: "unlock" satisfies ScholarIconName, title: "Free Knowledge", desc: "Our blog, social media, and free resources exist because we believe knowledge shouldn't be locked behind a paywall." },
];

export const TEAM = [
  { initials: "SK", name: "Sadia Khan", role: "Head of US Admissions", bio: "10+ years guiding students to Ivy League and liberal arts colleges." },
  { initials: "AR", name: "Arif Rahman", role: "Scholarship Strategist", bio: "Specialist in CSS Profile, ISFAA and need-based aid positioning." },
  { initials: "MH", name: "Maliha Hossain", role: "Test Prep Lead", bio: "SAT, IELTS, TOEFL, DET. Turns scores into stories." },
  { initials: "NF", name: "Nabil Faisal", role: "Visa & Departures", bio: "F-1, study permits, and that first month abroad, handled." },
];

export type ResourceCategory = "Essays" | "Applications" | "Scholarships" | "Test Prep" | "Visa" | "Compare";

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string; desc: string }[] = [
  { id: "Essays", label: "Essays & Personal Statements", desc: "Brainstorm, draft, and revise stories admissions remember." },
  { id: "Applications", label: "Applications & Strategy", desc: "Common App, UCAS, and country-specific portals without the panic." },
  { id: "Scholarships", label: "Scholarships & Financial Aid", desc: "Need-based, merit, and the forms that unlock them." },
  { id: "Test Prep", label: "Test Prep", desc: "SAT, IELTS, TOEFL, DET. Strategies that move the needle." },
  { id: "Visa", label: "Visa & Pre-Departure", desc: "From DS-160 to your first month abroad." },
  { id: "Compare", label: "Country & University Compare", desc: "Side-by-side breakdowns to help you choose." },
];

export type Resource = {
  tag: string;
  category: ResourceCategory;
  icon: ScholarIconName;
  title: string;
  teaser: string;
  readTime: string;
  featured?: boolean;
};

export const RESOURCES: Resource[] = [
  {
    tag: "🇺🇸 USA Flagship Guide",
    category: "Applications",
    icon: "map",
    title: "The Complete USA Application Guide for Bangladeshi Students",
    teaser:
      "From building a college list and writing essays to CSS Profile, ISFAA, and visa interviews, the only walkthrough you need, written specifically for students applying from Bangladesh.",
    readTime: "32 min read",
    featured: true,
  },
  {
    tag: "Essays",
    category: "Essays",
    icon: "pen-line",
    title: "How to Write a Personal Statement That Gets Remembered",
    teaser:
      "The Montage and Narrative structures explained, with the prompts that unlock the story only you can tell. Includes a full essay-brainstorm worksheet.",
    readTime: "18 min read",
  },
  {
    tag: "Essays",
    category: "Essays",
    icon: "pen-line",
    title: "21 Common App Essay Examples (and Why They Worked)",
    teaser:
      "Real successful essays broken down line by line: what made the opening hook, where the writer earned trust, and how the ending stuck the landing.",
    readTime: "24 min read",
  },
  {
    tag: "Scholarships",
    category: "Scholarships",
    icon: "gem",
    title: "The Bangladeshi Student's Scholarship Playbook",
    teaser:
      "Universities that meet 100% of demonstrated need for internationals, the merit awards worth applying to, and how to position your file to maximise aid.",
    readTime: "21 min read",
    featured: true,
  },
  {
    tag: "Scholarships",
    category: "Scholarships",
    icon: "banknote",
    title: "CSS Profile vs ISFAA: A Field-by-Field Walkthrough",
    teaser:
      "Both forms demystified with screenshots, currency-conversion tips, and the fields most Bangladeshi families get wrong on their first attempt.",
    readTime: "16 min read",
  },
  {
    tag: "Applications",
    category: "Applications",
    icon: "library",
    title: "Building a Smart College List: Reach, Target, Safety",
    teaser:
      "The 12-school framework we use with every Scholars Cafe student, calibrated to your academic profile, finances, and risk tolerance.",
    readTime: "14 min read",
  },
  {
    tag: "Test Prep",
    category: "Test Prep",
    icon: "trending-up",
    title: "SAT Prep Roadmap: 12 Weeks From Diagnostic to Target",
    teaser:
      "Week-by-week study schedule starting from a baseline score, with free Khan Academy + Bluebook resources sequenced for maximum gain.",
    readTime: "12 min read",
  },
  {
    tag: "Test Prep",
    category: "Test Prep",
    icon: "trending-up",
    title: "IELTS Band 7+: The Speaking & Writing Scripts That Work",
    teaser:
      "Our examiner-trained playbook for Tasks 1 & 2, plus the speaking framework that turned Band 6.5 students into 7.5 in six weeks.",
    readTime: "15 min read",
  },
  {
    tag: "Visa",
    category: "Visa",
    icon: "plane",
    title: "F-1 Student Visa: The Complete Interview Prep Guide",
    teaser:
      "DS-160 walkthrough, SEVIS payment, document checklist, and the 30 most-asked questions at the Dhaka US Embassy, with strong sample answers.",
    readTime: "20 min read",
  },
  {
    tag: "Compare",
    category: "Compare",
    icon: "scale",
    title: "USA vs UK vs Canada vs Germany: Which Is Right For You?",
    teaser:
      "True 4-year cost, scholarship reality, work rights after graduation, and quality-of-life, compared honestly for a Bangladeshi applicant in 2025.",
    readTime: "17 min read",
  },
  {
    tag: "Applications",
    category: "Applications",
    icon: "file-text",
    title: "Recommendation Letters: How to Brief Your Teachers",
    teaser:
      "The exact one-page brief our students hand to teachers and counselors so the letters land with specific stories and concrete strengths.",
    readTime: "9 min read",
  },
  {
    tag: "Visa",
    category: "Visa",
    icon: "luggage",
    title: "Pre-Departure Checklist: Your First 30 Days Abroad",
    teaser:
      "Banking, SIMs, dorms, course registration, and the small things nobody warns you about, built for first-time international students.",
    readTime: "11 min read",
  },
];

