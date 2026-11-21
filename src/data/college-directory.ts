// College directory: the top National Liberal Arts Colleges and National Universities, with facts
// for international (Bangladeshi) applicants. Rank is used only to choose which colleges appear.
// Every figure is { value, source }. Sources are the college's own pages, its Common Data Set (CDS)
// or IPEDS. value null = the college does not publish it (or we could not verify it): the site shows
// "Not published", never an estimate. Each college has its own asOf date.
// The admin's "College directory" entries (kind "colleges") override these by slug, or add colleges.
import type { StateUniversity, TestPolicy, AidPolicy } from "@/data/state-universities";

export type CollegeType = "LAC" | "NU";
export type Fig<T> = { value: T | null; source: string | null };
/** ISO date "2026-11-01", or "not-offered". */
export type Deadline = string;
export type EnglishMin = number | "none";

export type College = {
  slug: string;
  name: string;
  type: CollegeType;
  city: string;
  state: string;
  code: string;
  rank: { label: string; edition: string; source: string };
  asOf: string;
  cdsYear: string | null;
  /** CDS C1 */
  applicants: Fig<number>;
  admitted: Fig<number>;
  /** CDS C21 (Early Decision) and C22 (Early Action) */
  edApplicants: Fig<number>;
  edAdmitted: Fig<number>;
  eaApplicants: Fig<number>;
  eaAdmitted: Fig<number>;
  earlyNote: string | null;
  /** CDS C9 middle 50%, e.g. "1500-1560" and "34-35" */
  sat: Fig<string>;
  act: Fig<string>;
  /** CDS C8 / admissions page */
  testPolicy: Fig<TestPolicy>;
  testNote: string | null;
  /** CDS H6 and the college's international aid page */
  needBasedForIntl: Fig<boolean>;
  intlAidPolicy: Fig<AidPolicy>;
  policyQuote: string | null;
  intlAided: Fig<number>;
  intlAvgAward: Fig<number>;
  intlNote: string | null;
  /** CDS G1 (or the college's newer cost page) */
  costYear: string | null;
  tuition: Fig<number>;
  fees: Fig<number>;
  roomBoard: Fig<number>;
  costNote: string | null;
  ielts: Fig<EnglishMin>;
  toefl: Fig<EnglishMin>;
  duolingo: Fig<EnglishMin>;
  englishNote: string | null;
  nationalCurriculum: Fig<string>;
  ed1: Fig<Deadline>;
  ed2: Fig<Deadline>;
  ea: Fig<Deadline>;
  rd: Fig<Deadline>;
  deadlineNote: string | null;
  /** Our own one line. */
  highlight: string;
  image: StateUniversity["image"];
  imagePosition?: string;
  urls: {
    admissions: string | null;
    international: string | null;
    aid: string | null;
    cds: string | null;
  };
};

export const COLLEGE_RANK_EDITION = "U.S. News 2027 (released September 2026)";
export const COLLEGE_RANK_RULE =
  "Top 35 in U.S. News Best National Liberal Arts Colleges and top 30 in Best National Universities, 2027 edition, ties included. The rank only decides which colleges appear here.";
export const TYPE_LABEL: Record<CollegeType, string> = {
  LAC: "Liberal arts college",
  NU: "National university",
};

/** One fixed USD to BDT rate for every taka figure on these pages. */
export const BDT_RATE = {
  value: 124.75,
  date: "2026-11-19",
  label: "Bangladesh Bank USD/BDT weighted average rate (WAR)",
  source: "https://www.bb.org.bd/en/index.php/econdata/exchangerate",
};

// BEGIN GENERATED DATA
export const COLLEGES: College[] = [
  {
    slug: "bowdoin-college",
    name: "Bowdoin College",
    type: "LAC",
    city: "Brunswick",
    state: "Maine",
    code: "ME",
    rank: {
      label: "#3 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 14045,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    admitted: {
      value: 957,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    edApplicants: {
      value: 1985,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    edAdmitted: {
      value: 296,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered (ED counts combined in CDS C21); no Early Action plan.",
    sat: {
      value: "1470-1540",
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    act: {
      value: "33-35",
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.bowdoin.edu/admissions/apply/testing-policy.html",
    },
    testNote:
      "Test-optional for 50+ years; applicants choose which test types to submit; SAT and ACT superscored. CDS: 35% submitted SAT, 17% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    policyQuote: "Bowdoin College is need blind for international students.",
    intlAided: {
      value: 102,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    intlAvgAward: {
      value: 84882,
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    intlNote:
      "Costs page: need-blind and meets full calculated need of all applicants, domestic and international, with scholarships (no loans). International transfers not eligible for aid.",
    costYear: "2026-2027",
    tuition: {
      value: 74268,
      source: "https://www.bowdoin.edu/admissions/costs-and-aid/",
    },
    fees: {
      value: 700,
      source: "https://www.bowdoin.edu/admissions/costs-and-aid/",
    },
    roomBoard: {
      value: 20432,
      source: "https://www.bowdoin.edu/admissions/costs-and-aid/",
    },
    costNote:
      "2026-27 housing $10,106 + food $10,326 summed. CDS G1 (2025-26): tuition $71,070, fees $670, food and housing $19,560.",
    ielts: {
      value: "none",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    toefl: {
      value: "none",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    duolingo: {
      value: "none",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    englishNote:
      "English proficiency test submission is optional; TOEFL, IELTS, DET and Cambridge accepted; no minimum qualifying score.",
    nationalCurriculum: {
      value:
        "Applicants from countries with national university entrance exams must submit official results; A-level/IB students in their final year submit predicted grades. Transcripts should be translated into English.",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    ea: {
      value: "not-offered",
      source: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
    rd: {
      value: "2027-01-05",
      source: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
    },
    deadlineNote:
      "Dates stated as November 15 (ED I) and January 5 (ED II and RD) without year; mapped to the 2026-27 cycle.",
    highlight:
      "Home to the Peary-MacMillan Arctic Museum, reflecting Bowdoin's long history of Arctic exploration.",
    image: null,
    urls: {
      admissions: "https://www.bowdoin.edu/admissions/",
      international: "https://www.bowdoin.edu/admissions/apply/international-students/index.html",
      aid: "https://www.bowdoin.edu/student-aid/apply-for-aid/international-students.html",
      cds: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    },
  },
  {
    slug: "claremont-mckenna-college",
    name: "Claremont McKenna College",
    type: "LAC",
    city: "Claremont",
    state: "California",
    code: "CA",
    rank: {
      label: "#3 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 6939,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    admitted: {
      value: 655,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    edApplicants: {
      value: 978,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    edAdmitted: {
      value: 216,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered (C21 counts combined); CDS C22 says no Early Action.",
    sat: {
      value: "1480-1540",
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    act: {
      value: "33-35",
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.cmc.edu/admission/first-year-application-instructions",
    },
    testNote:
      "Provisional test-optional policy extended through the Fall 2027 entry term; CMC returns to test-required for Fall 2028. Superscores SAT/ACT. CDS: 34% submitted SAT, 14% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.cmc.edu/financial-aid/prospective-and-new-students",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.cmc.edu/admission/international",
    },
    policyQuote:
      "Claremont McKenna College (CMC) is need-aware in its admission process for all international students",
    intlAided: {
      value: 53,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    intlAvgAward: {
      value: 64997,
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    intlNote:
      "International aid applicants must submit the CMC Financial Aid Form with the admission application (CSS Profile/ISFAA not accepted); students who do not apply for aid at admission cannot get need-based aid later. Merit scholarship priority: apply by December 1.",
    costYear: "2026-2027",
    tuition: {
      value: 75300,
      source: "https://www.cmc.edu/financial-aid/college-costs-and-payments",
    },
    fees: {
      value: 420,
      source: "https://www.cmc.edu/financial-aid/college-costs-and-payments",
    },
    roomBoard: {
      value: 23270,
      source: "https://www.cmc.edu/financial-aid/college-costs-and-payments",
    },
    costNote:
      "Housing $12,490 + food (19 meals) $10,780 summed; fees = ASCMC student activity fee; one-time $500 first-year orientation fee not included. CDS 2025-26 G1 left blank (costs pending).",
    ielts: {
      value: 7.5,
      source: "https://www.cmc.edu/admission/international",
    },
    toefl: {
      value: 100,
      source: "https://www.cmc.edu/admission/international",
    },
    duolingo: {
      value: 130,
      source: "https://www.cmc.edu/admission/international",
    },
    englishNote:
      "All are minimum RECOMMENDED scores. TOEFL 100 applies to tests taken before Jan 21, 2026; for tests after that date (new TOEFL scale) the page recommends 5.5. Cambridge C1/C2: 190. Official scores required for Duolingo.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.cmc.edu/admission/first-year-application-instructions",
    },
    ed2: {
      value: "2027-01-10",
      source: "https://www.cmc.edu/admission/first-year-application-instructions",
    },
    ea: {
      value: "not-offered",
      source: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
    rd: {
      value: "2027-01-10",
      source: "https://www.cmc.edu/admission/first-year-application-instructions",
    },
    deadlineNote:
      "Deadline table lists Nov 1 (ED I) and Jan 10 (ED II, RD) without a year; page's testing section references the Fall 2027 entry term.",
    highlight:
      "Part of the Claremont Colleges consortium, letting students cross-register at neighboring Pomona, Harvey Mudd and others.",
    image: null,
    urls: {
      admissions: "https://www.cmc.edu/admission/first-year-application-instructions",
      international: "https://www.cmc.edu/admission/international",
      aid: "https://www.cmc.edu/financial-aid/prospective-and-new-students",
      cds: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
  },
  {
    slug: "vassar-college",
    name: "Vassar College",
    type: "LAC",
    city: "Poughkeepsie",
    state: "New York",
    code: "NY",
    rank: {
      label: "#12 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 11118,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    admitted: {
      value: 2327,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    edApplicants: {
      value: 1046,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    edAdmitted: {
      value: 402,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote:
      "ED I and ED II offered (ED counts are combined); no Early Action plan (CDS C22 = No).",
    sat: {
      value: "1460-1520",
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    act: {
      value: "33-34",
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.vassar.edu/admission/apply/requirements/",
    },
    testNote:
      "Vassar does not require SAT or ACT scores. 32% of Fall 2025 enrollees submitted SAT, 14% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://offices.vassar.edu/student-financial-services/financial-aid-faq/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.vassar.edu/admission/apply/international/",
    },
    policyQuote:
      "Vassar meets the full demonstrated need of all admitted students who apply for financial aid at the time of their admission application. We are need aware when reviewing applications from international students.",
    intlAided: {
      value: 57,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    intlAvgAward: {
      value: 88709,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    intlNote:
      "International students must apply for aid (CSS Profile) at the time of admission application to be eligible at any point. No aid for international transfer applicants.",
    costYear: "2026-2027",
    tuition: {
      value: 76140,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    fees: {
      value: 1020,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    roomBoard: {
      value: 19800,
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-27 year.",
    ielts: {
      value: null,
      source: null,
    },
    toefl: {
      value: null,
      source: null,
    },
    duolingo: {
      value: null,
      source: null,
    },
    englishNote:
      "TOEFL iBT/PBT/Home Edition, IELTS Academic and Duolingo accepted; required if English is not your first language nor the language of instruction for the last three years. No minimum or recommended score published.",
    nationalCurriculum: {
      value:
        "Transcript should be a complete record of coursework and grades; results of any terminal high school exams (e.g., A levels, IB, French bacc, CBSE) are required for enrollment.",
      source: "https://www.vassar.edu/admission/apply/international/",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.vassar.edu/admission/apply/requirements/",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://www.vassar.edu/admission/apply/requirements/",
    },
    ea: {
      value: "not-offered",
      source:
        "https://offices.vassar.edu/institutional-research/wp-content/uploads/sites/23/2026/03/Vassar_College_CDS_2025-2026.pdf",
    },
    rd: {
      value: "2027-01-01",
      source: "https://www.vassar.edu/admission/apply/requirements/",
    },
    deadlineNote:
      "Requirements page lists Nov 15 / Jan 1 / Jan 1 without years; years inferred for the fall 2027 cycle (matches CDS dates).",
    highlight:
      "Its Main Building, designed by James Renwick Jr., is a National Historic Landmark that still houses both offices and student rooms.",
    image: null,
    urls: {
      admissions: "https://www.vassar.edu/admission/",
      international: "https://www.vassar.edu/admission/apply/international/",
      aid: "https://offices.vassar.edu/student-financial-services/financial-aid-faq/",
      cds: "https://offices.vassar.edu/institutional-research/data/common-data-set-2025-26/",
    },
  },
  {
    slug: "massachusetts-institute-of-technology",
    name: "Massachusetts Institute of Technology",
    type: "NU",
    city: "Cambridge",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#1 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 29281,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    admitted: {
      value: 1334,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    edApplicants: {
      value: null,
      source: null,
    },
    edAdmitted: {
      value: null,
      source: null,
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote:
      "No Early Decision (CDS C21 = No). Non-restrictive Early Action offered (C22), but the CDS does not report EA applicant/admit counts.",
    sat: {
      value: "1520-1570",
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    act: {
      value: "34-35",
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    testPolicy: {
      value: "required",
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
    },
    testNote:
      "SAT or ACT required for first-year applicants; must be taken before Nov 30 (EA) or Dec 31 (RA).",
    needBasedForIntl: {
      value: true,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://sfs.mit.edu/financial-aid-mit",
    },
    policyQuote:
      "We are proud to be one of the very few institutions in the United States that are need blind and full need for all of our undergraduate students, domestic and international",
    intlAided: {
      value: 411,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    intlAvgAward: {
      value: 81991,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    intlNote:
      "International aid applicants submit the CSS Profile plus parental income verification.",
    costYear: "2026-2027",
    tuition: {
      value: 66720,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    fees: {
      value: 420,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    roomBoard: {
      value: 22194,
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    costNote:
      "The 2025-26 CDS G1 reports figures for the full 2026-2027 academic year (food and housing, on campus).",
    ielts: {
      value: 7,
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
    },
    toefl: {
      value: 90,
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
    },
    duolingo: {
      value: 120,
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
    },
    englishNote:
      "Minimums (recommended in parentheses): IELTS 7 (7.5), TOEFL iBT 90 (100) for tests before 1/21/26 or 5 (5.5) on the new 1-6 scale, Duolingo 120 (125), PTE 65 (70). Test strongly recommended if English used fewer than five years or not spoken at home/school.",
    nationalCurriculum: {
      value:
        "Transcript should include three years of grades plus results of external examinations required for university entrance in the home country; predicted grades should be sent if available, and only admitted students send final grades.",
      source: "https://mitadmissions.org/apply/firstyear/international/",
    },
    ed1: {
      value: "not-offered",
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    ed2: {
      value: "not-offered",
      source: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
    ea: {
      value: "2026-11-01",
      source: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/",
    },
    deadlineNote:
      "Early Action is non-restrictive. Deadlines page states EA due November 1 and Regular Action due January 4 (year not printed; assumed current cycle).",
    highlight:
      "MIT's OneMIT Commencement and undergraduate degree ceremony are held outdoors in Killian Court.",
    image: null,
    urls: {
      admissions: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/",
      international: "https://mitadmissions.org/apply/firstyear/international/",
      aid: "https://sfs.mit.edu/undergraduate-students/apply-for-aid/international",
      cds: "https://ir.mit.edu/projects/2025-26-common-data-set/",
    },
  },
  {
    slug: "princeton-university",
    name: "Princeton University",
    type: "NU",
    city: "Princeton",
    state: "New Jersey",
    code: "NJ",
    rank: {
      label: "#2 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 42303,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    admitted: {
      value: 1868,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    edApplicants: {
      value: null,
      source: null,
    },
    edAdmitted: {
      value: null,
      source: null,
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote:
      "No Early Decision (CDS C21 = No). Restrictive single-choice Early Action offered (C22: closing 11/1, notification mid-December); CDS does not report EA applicant/admit counts.",
    sat: {
      value: "1490-1560",
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    act: {
      value: "34-35",
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admission.princeton.edu/apply/standardized-testing",
    },
    testNote:
      "Test optional for fall 2027 entry; SAT or ACT will be required for applicants seeking to enroll in fall 2028.",
    needBasedForIntl: {
      value: true,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://admission.princeton.edu/apply/international-students",
    },
    policyQuote:
      "The full need of all admitted international students is met the same as it is for students from the United States. Princeton admission is need-blind — there is no disadvantage in the admission process for financial aid applicants.",
    intlAided: {
      value: 597,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    intlAvgAward: {
      value: 86736,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    intlNote: "Aid is awarded as grants, not loans.",
    costYear: "2026-2027",
    tuition: {
      value: 68140,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    fees: {
      value: 314,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    roomBoard: {
      value: 22120,
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    costNote: "CDS 2025-26 G1 reports 2026-2027 costs; food and housing on campus.",
    ielts: {
      value: null,
      source: null,
    },
    toefl: {
      value: null,
      source: null,
    },
    duolingo: {
      value: null,
      source: null,
    },
    englishNote:
      "TOEFL, IELTS Academic, Duolingo English Test or PTE Academic required for non-native speakers unless at least three years at an English-medium secondary school; no minimum scores published.",
    nationalCurriculum: {
      value:
        "Transcript is evaluated in the context of the home education system; achieved marks from national leaving exams (e.g. Std X/XII) are part of the record, and predicted or achieved results should be sent as available. No GPA conversion expected.",
      source: "https://admission.princeton.edu/apply/international-students",
    },
    ed1: {
      value: "not-offered",
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    ed2: {
      value: "not-offered",
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    ea: {
      value: "2026-11-01",
      source: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines",
    },
    rd: {
      value: "2027-01-01",
      source: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines",
    },
    deadlineNote:
      "EA is single-choice (restrictive) early action. Dates page lists Nov. 1 and Jan. 1 (years not printed).",
    highlight:
      "Nassau Hall served as the meeting place of the Continental Congress in 1783, briefly making Princeton the US capital.",
    image: null,
    urls: {
      admissions: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines",
      international: "https://admission.princeton.edu/apply/international-students",
      aid: "https://admission.princeton.edu/apply/international-students",
      cds: "https://ir.princeton.edu/other-university-data/common-data-set",
    },
  },
];
// END GENERATED DATA

export const collegeBySlug = (slug: string) => COLLEGES.find((c) => c.slug === slug);
