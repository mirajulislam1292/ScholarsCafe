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
    slug: "williams-college",
    name: "Williams College",
    type: "LAC",
    city: "Williamstown",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#1 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 15520,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    admitted: {
      value: 1336,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    edApplicants: {
      value: 964,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    edAdmitted: {
      value: 256,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Single Early Decision round only; no Early Action.",
    sat: {
      value: "1490-1550",
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
    },
    testNote:
      "'Williams is truly test optional'; SAT/ACT superscored; scores may be self-reported; ACT science optional for enhanced ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.williams.edu/admission-aid/tuition-aid/requirements-and-deadlines/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.williams.edu/admission-aid/tuition-aid/requirements-and-deadlines/",
    },
    policyQuote:
      "Although Williams isn’t need-blind for international applicants, approximately 70% of international students receive financial aid from the college, with aid awards averaging more than $90,000 annually. ... Financial aid awards for international students are comprehensive, meet 100% of demonstrated need and are guaranteed for all four years.",
    intlAided: {
      value: 123,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    intlAvgAward: {
      value: 94807,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    intlNote:
      "International applicants who might ever seek aid must indicate intent to apply for financial aid on the admission application; aid materials are submitted after admission.",
    costYear: "2026-2027",
    tuition: {
      value: 76300,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    fees: {
      value: 340,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    roomBoard: {
      value: 19320,
      source:
        "https://www.williams.edu/institutional-research/files/2026/04/Williams-CDS-2025-2026-V2.pdf",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-2027 academic year (housing $9,830 + food $9,490).",
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
      "No minimum; these are the low ends of TYPICAL ranges for competitive applicants: TOEFL 5-6 (prior to Jan 2026, 100-120), IELTS 7.5-9, Duolingo 135-160. Scores encouraged if English is not the first language or language of instruction.",
    nationalCurriculum: {
      value:
        "The admission committee says it is familiar with school systems and curricula around the world; international applicants follow the same procedures as U.S. applicants with no additional forms or tests.",
      source:
        "https://www.williams.edu/admission-aid/how-to-apply/additional-applicant-information/international/",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
    },
    ed2: {
      value: "not-offered",
      source: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
    },
    ea: {
      value: "not-offered",
      source: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
    },
    deadlineNote:
      "Page lists ED deadline Nov. 15 and RD Jan. 4 without year; mapped to the 2026-27 cycle.",
    highlight:
      "Famous for its tutorial classes: two students and one professor meeting for in-depth, debate-style discussion.",
    image: {
      src: "/media/colleges/williams-college.webp",
      card: "/media/colleges/williams-college-card.webp",
      title: "Williams College - Thompson Memorial Chapel exterior view.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Williams_College_-_Thompson_Memorial_Chapel_exterior_view.JPG",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://www.williams.edu/admission-aid/how-to-apply/first-year/",
      international:
        "https://www.williams.edu/admission-aid/how-to-apply/additional-applicant-information/international/",
      aid: "https://www.williams.edu/admission-aid/tuition-aid/requirements-and-deadlines/",
      cds: "https://www.williams.edu/institutional-research/common-data-set/",
    },
  },
  {
    slug: "amherst-college",
    name: "Amherst College",
    type: "LAC",
    city: "Amherst",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#2 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 15819,
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    admitted: {
      value: 1222,
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    edApplicants: {
      value: 971,
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    edAdmitted: {
      value: 216,
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Single Early Decision round only; no Early Action.",
    sat: {
      value: "1470-1540",
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://www.amherst.edu/system/files/C.%20First-Time%20First-Year%20Admission%202025-26_0.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.amherst.edu/admission/apply/firstyear/testing",
    },
    testNote:
      "SAT/ACT optional for first-year and transfer, domestic and international; self-reported scores accepted; superscored. CDS: 40% submitted SAT, 16% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.amherst.edu/admission/apply/international",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://www.amherst.edu/admission/apply/international",
    },
    policyQuote:
      "Amherst College follows a need-blind admission policy for all students—domestic and international. ... In addition, Amherst meets 100% of calculated financial need for all international students who are admitted to the college and apply for need-based financial aid.",
    intlAided: {
      value: 204,
      source: "https://www.amherst.edu/system/files/H.%20Financial%20Aid%202025-26.pdf",
    },
    intlAvgAward: {
      value: 84590,
      source: "https://www.amherst.edu/system/files/H.%20Financial%20Aid%202025-26.pdf",
    },
    intlNote: null,
    costYear: "2026-2027",
    tuition: {
      value: 75330,
      source:
        "https://www.amherst.edu/offices/financialaid/forms_links/fees_2026-2027_academic_year",
    },
    fees: {
      value: 710,
      source:
        "https://www.amherst.edu/offices/financialaid/forms_links/fees_2026-2027_academic_year",
    },
    roomBoard: {
      value: 20320,
      source:
        "https://www.amherst.edu/offices/financialaid/forms_links/fees_2026-2027_academic_year",
    },
    costNote:
      "Housing $10,980 + meals $9,340 summed; fees = student activities fee (health and tuition insurance excluded). CDS 2025-26 G1: tuition $73,140, fees $690, food and housing $19,260.",
    ielts: {
      value: 7.5,
      source: "https://www.amherst.edu/admission/apply/international",
    },
    toefl: {
      value: 100,
      source: "https://www.amherst.edu/admission/apply/international",
    },
    duolingo: {
      value: 130,
      source: "https://www.amherst.edu/admission/apply/international",
    },
    englishNote:
      "Strongly recommended minimums. TOEFL 100 for tests before Jan 21, 2026, or 5.5 on the new scale. Required for non-native speakers unless the two most recent school years were taught in English.",
    nationalCurriculum: {
      value:
        "Committee is familiar with education systems worldwide and considers grades and comprehensive exam predictions or results alongside other parts of the application.",
      source: "https://www.amherst.edu/admission/apply/international",
    },
    ed1: {
      value: "2026-11-09",
      source: "https://www.amherst.edu/admission/apply/firstyear",
    },
    ed2: {
      value: "not-offered",
      source: "https://www.amherst.edu/admission/apply/firstyear",
    },
    ea: {
      value: "not-offered",
      source: "https://www.amherst.edu/admission/apply/firstyear",
    },
    rd: {
      value: "2027-01-05",
      source: "https://www.amherst.edu/admission/apply/firstyear",
    },
    deadlineNote:
      "Page states 'Early Decision - Deadline is Nov. 9, 2026' and 'Regular Decision - Deadline is Jan. 5, 2027'.",
    highlight:
      "Known for its open curriculum: beyond a first-year seminar, students choose their own courses with no distribution requirements.",
    image: {
      src: "/media/colleges/amherst-college.webp",
      card: "/media/colleges/amherst-college-card.webp",
      title: "Robert Frost Library Amherst College - IMG 6422.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Robert_Frost_Library_Amherst_College_-_IMG_6422.jpg",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://www.amherst.edu/admission/apply/firstyear",
      international: "https://www.amherst.edu/admission/apply/international",
      aid: "https://www.amherst.edu/offices/financialaid/international_students/costs_amherst",
      cds: "https://www.amherst.edu/about/facts/common_data_sets/2025",
    },
  },
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
    image: {
      src: "/media/colleges/bowdoin-college.webp",
      card: "/media/colleges/bowdoin-college-card.webp",
      title: "Massachusetts Hall, Bowdoin College.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Massachusetts_Hall,_Bowdoin_College.jpg",
      author: "Gerda Peterich",
      licence: "Public domain",
      licenceUrl: null,
    },
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
      "The Marian Miner Cook Athenaeum hosts speaker dinner programs several evenings a week, with student fellows moderating the Q&A.",
    image: {
      src: "/media/colleges/claremont-mckenna-college.webp",
      card: "/media/colleges/claremont-mckenna-college-card.webp",
      title: "Claremont McKenna College campus, looking east toward the Bauer Center.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Claremont_McKenna_College_campus,_looking_east_toward_the_Bauer_Center.jpg",
      author: "Sdkb",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.cmc.edu/admission/first-year-application-instructions",
      international: "https://www.cmc.edu/admission/international",
      aid: "https://www.cmc.edu/financial-aid/prospective-and-new-students",
      cds: "https://www.cmc.edu/sites/default/files/CDS_2025-26.pdf",
    },
  },
  {
    slug: "pomona-college",
    name: "Pomona College",
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
      value: 12470,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    admitted: {
      value: 890,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    edApplicants: {
      value: 1656,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    edAdmitted: {
      value: 227,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered (C21 counts combined); CDS C22: no Early Action.",
    sat: {
      value: "1490-1550",
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    act: {
      value: "32-34",
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/C_First-timeFirst-yearadmission",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.pomona.edu/admissions/paths-apply",
    },
    testNote:
      "Test-optional (made permanent in 2023); scores self-reported; ACT submitters must include the Science section. CDS: 37% submitted SAT, 12% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/H_FinancialAid",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.pomona.edu/admissions/apply/international-applicants",
    },
    policyQuote:
      "Admissions is need-aware for international applicants, but we meet the full need of every admitted international student.",
    intlAided: {
      value: 98,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/H_FinancialAid",
    },
    intlAvgAward: {
      value: 86889,
      source: "https://tableau.campus.pomona.edu/views/CDS2025-26/H_FinancialAid",
    },
    intlNote:
      "Need-based aid only (no merit or athletic scholarships); aid packages meet 100% of demonstrated need without loans.",
    costYear: "2026-2027",
    tuition: {
      value: 71660,
      source:
        "https://www.pomona.edu/administration/finance-office/student-accounts/tuition-and-costs",
    },
    fees: {
      value: 420,
      source:
        "https://www.pomona.edu/administration/finance-office/student-accounts/tuition-and-costs",
    },
    roomBoard: {
      value: 23590,
      source:
        "https://www.pomona.edu/administration/finance-office/student-accounts/tuition-and-costs",
    },
    costNote:
      "Comprehensive charge $95,670 for 2026-27; housing and food derived as total minus tuition and fees. Same figures appear in CDS 2025-26 G1.",
    ielts: {
      value: 7,
      source:
        "https://www.pomona.edu/admissions/apply/international-applicants/international-applicant-faqs",
    },
    toefl: {
      value: 100,
      source:
        "https://www.pomona.edu/admissions/apply/international-applicants/international-applicant-faqs",
    },
    duolingo: {
      value: 130,
      source:
        "https://www.pomona.edu/admissions/apply/international-applicants/international-applicant-faqs",
    },
    englishNote:
      "Required only if English is not the primary language of instruction. Minimums: TOEFL iBT 100, IELTS 7, DET 130 (FAQ); no sub-score minimums. The main international page lists 'Minimum TOEFL 5' (new 2026 TOEFL band scale).",
    nationalCurriculum: {
      value:
        "Non-English transcripts need official English translations; if secondary school is 3 years (grades 10-12) applicants also submit grade 9 transcripts; no need to recalculate GPA. Applicants are evaluated in their local context.",
      source:
        "https://www.pomona.edu/admissions/apply/international-applicants/international-applicant-faqs",
    },
    ed1: {
      value: "2026-11-08",
      source: "https://www.pomona.edu/admissions/paths-apply",
    },
    ed2: {
      value: "2027-01-08",
      source: "https://www.pomona.edu/admissions/paths-apply",
    },
    ea: {
      value: "not-offered",
      source: "https://www.pomona.edu/admissions/paths-apply",
    },
    rd: {
      value: "2027-01-08",
      source: "https://www.pomona.edu/admissions/paths-apply",
    },
    deadlineNote:
      "Table lists Nov. 8 (ED I), Jan. 8 (ED II and RD) without a year; mapped to the 2026-27 cycle.",
    highlight:
      "One of the five undergraduate Claremont Colleges; students can cross-register for over 2,700 classes at Scripps, CMC, Harvey Mudd and Pitzer.",
    image: {
      src: "/media/colleges/pomona-college.webp",
      card: "/media/colleges/pomona-college-card.webp",
      title: "Bridges Hall of Music, Pomona College in November 2021.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Bridges_Hall_of_Music,_Pomona_College_in_November_2021.jpg",
      author: "Adam Jones",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    urls: {
      admissions: "https://www.pomona.edu/admissions/paths-apply",
      international: "https://www.pomona.edu/admissions/apply/international-applicants",
      aid: "https://www.pomona.edu/admissions/apply/international-applicants",
      cds: "https://tableau.campus.pomona.edu/views/CDS2025-26/A_GeneralInformation",
    },
  },
  {
    slug: "swarthmore-college",
    name: "Swarthmore College",
    type: "LAC",
    city: "Swarthmore",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#3 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 12995,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    admitted: {
      value: 977,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    edApplicants: {
      value: 1281,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    edAdmitted: {
      value: 228,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
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
      "Fall ED and Winter ED offered (C21 counts combined); no Early Action (CDS C22: No).",
    sat: {
      value: "1480-1550",
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.swarthmore.edu/admissions-aid/standardized-testing-policy",
    },
    testNote:
      "Admissions page: submitting SAT/ACT is optional with no penalty; writing sections not considered. CDS C8 text says the testing requirement was suspended for the 2026-27 cycle. CDS: 40% submitted SAT, 15% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.swarthmore.edu/admissions-aid/international-students",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.swarthmore.edu/admissions-aid/international-students",
    },
    policyQuote:
      "Admission to Swarthmore is need-aware for international citizens (excluding Permanent Residents, dual U.S. citizens, and DACA and undocumented students as well as those in the Asylee/Refugee application process who are graduating from a U.S. high school).",
    intlAided: {
      value: 75,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    intlAvgAward: {
      value: 87434,
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    intlNote:
      "Meets 100% of institutionally-determined need for admitted international students with no loans; must indicate intent to apply for aid on the admission application. Page: average aid decision for admitted international students in the Class of 2030 was more than $93,000.",
    costYear: "2026-2027",
    tuition: {
      value: 72722,
      source: "https://www.swarthmore.edu/student-accounts-office/tuition-housing-food-fees",
    },
    fees: {
      value: 482,
      source: "https://www.swarthmore.edu/student-accounts-office/tuition-housing-food-fees",
    },
    roomBoard: {
      value: 22566,
      source: "https://www.swarthmore.edu/student-accounts-office/tuition-housing-food-fees",
    },
    costNote:
      "Housing $11,676 + food $10,890 summed; fees = student activities fee; tuition includes an $800 textbook credit. CDS 2025-26 G1: tuition $68,766, fees $460, food and housing $21,466.",
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
      "TOEFL, IELTS or Duolingo (official) encouraged if most education was in a non-English curriculum; highest single-sitting score considered. No minimum or typical score published.",
    nationalCurriculum: {
      value:
        "Official score reports are expected for national exams taken during high school (e.g., O-levels, IGCSE, GCSE, Secondary School Certificate Examination); graduates must also submit leaving exam results (e.g., A-levels, IB, WASSCE) if available.",
      source: "https://www.swarthmore.edu/admissions-aid/international-students",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.swarthmore.edu/admissions-aid/application-materials-deadlines",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://www.swarthmore.edu/admissions-aid/application-materials-deadlines",
    },
    ea: {
      value: "not-offered",
      source:
        "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
    rd: {
      value: "2027-01-04",
      source: "https://www.swarthmore.edu/admissions-aid/application-materials-deadlines",
    },
    deadlineNote:
      "Called Fall Early Decision (Nov 15) and Winter Early Decision (Jan 4); page gives no year, mapped to the 2026-27 cycle.",
    highlight:
      "The whole campus is the Scott Arboretum, a public garden with curated trees and plant collections.",
    image: {
      src: "/media/colleges/swarthmore-college.webp",
      card: "/media/colleges/swarthmore-college-card.webp",
      title: "Swarthmore Parrish Hall.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Swarthmore_Parrish_Hall.jpg",
      author: "Kungming2",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
    },
    urls: {
      admissions: "https://www.swarthmore.edu/admissions-aid/application-materials-deadlines",
      international: "https://www.swarthmore.edu/admissions-aid/international-students",
      aid: "https://www.swarthmore.edu/admissions-aid/international-students",
      cds: "https://www.swarthmore.edu/sites/default/files/assets/documents/institutional-effectiveness-research-assessment/Swarthmore-CDS-2025-26.pdf",
    },
  },
  {
    slug: "united-states-naval-academy",
    name: "United States Naval Academy",
    type: "LAC",
    city: "Annapolis",
    state: "Maryland",
    code: "MD",
    rank: {
      label: "#3 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: null,
    applicants: {
      value: null,
      source: null,
    },
    admitted: {
      value: null,
      source: null,
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
    earlyNote: "Service academy: no Early Decision or Early Action plans.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: null,
      source: null,
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote:
      "Class of 2030 portrait reports only section-level middle-50% ranges: SAT Verbal 620-720, SAT Math 620-730, ACT English+Reading 52-67 and ACT Math 26-32 (ACT-equivalent); no composite published. Test policy for international (sponsored) candidates not published.",
    needBasedForIntl: {
      value: null,
      source: null,
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: null,
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "By law USNA may accept up to 60 international students officially sponsored by their governments; foreign nationals request application procedures from the Naval Attaché at the U.S. Embassy in their country. Class of 2030 included 14 international students. Not open to direct application by Bangladeshi students without government sponsorship.",
    costYear: null,
    tuition: {
      value: null,
      source: null,
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: null,
      source: null,
    },
    costNote:
      "Cost figures for sponsored international midshipmen not published on the pages checked; a USNA instruction states foreign national midshipmen are not eligible for USNA scholarship programs and funding.",
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
    englishNote: null,
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: null,
      source: null,
    },
    ed2: {
      value: null,
      source: null,
    },
    ea: {
      value: null,
      source: null,
    },
    rd: {
      value: null,
      source: null,
    },
    deadlineNote:
      "International candidates apply through their own government/U.S. Embassy; no deadline published for them.",
    highlight:
      "All midshipmen live in Bancroft Hall, considered the largest single college dormitory in the world.",
    image: {
      src: "/media/colleges/united-states-naval-academy.webp",
      card: "/media/colleges/united-states-naval-academy-card.webp",
      title: "United States Naval Academy Chapel, exterior (31640508524).jpg",
      page: "https://commons.wikimedia.org/wiki/File:United_States_Naval_Academy_Chapel,_exterior_(31640508524).jpg",
      author: "Preservation Maryland",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    urls: {
      admissions: "https://www.usna.edu/Admissions/",
      international: "https://www.usna.edu/Admissions/Apply/FAQ.php",
      aid: null,
      cds: null,
    },
  },
  {
    slug: "harvey-mudd-college",
    name: "Harvey Mudd College",
    type: "LAC",
    city: "Claremont",
    state: "California",
    code: "CA",
    rank: {
      label: "#8 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 5217,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    admitted: {
      value: 643,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    edApplicants: {
      value: 594,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    edAdmitted: {
      value: 109,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered (C21 counts combined); no Early Action.",
    sat: {
      value: "1500-1560",
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    act: {
      value: "35-36",
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.hmc.edu/admission/apply/first-year-students/application-deadlines/",
    },
    testNote:
      "Test-optional for Fall 2027 applicants; HMC returns to requiring standardized testing for the Fall 2028 cycle. Scores may be self-reported. CDS: 55% submitted SAT, 21% ACT.",
    needBasedForIntl: {
      value: true,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.hmc.edu/admission/apply/international-applicants/",
    },
    policyQuote:
      "Because funding for international students is limited, your level of financial need may affect your chances for admission if you apply for financial aid. ... We are able to meet 100% of a family's demonstrated need for only a handful of international students.",
    intlAided: {
      value: 38,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    intlAvgAward: {
      value: 32564,
      source:
        "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
    intlNote:
      "Aid offered to a small number of admitted international applicants; CDS H6 marks both need-based and non-need-based institutional aid available to nonresidents. Students who enter without aid cannot apply later; no aid for international transfers.",
    costYear: "2026-2027",
    tuition: {
      value: 76879,
      source: "https://www.hmc.edu/admission/afford/cost-of-attendance/",
    },
    fees: {
      value: 401,
      source: "https://www.hmc.edu/admission/afford/cost-of-attendance/",
    },
    roomBoard: {
      value: 24782,
      source: "https://www.hmc.edu/admission/afford/cost-of-attendance/",
    },
    costNote:
      "Housing $13,293 + 19-meal food plan $11,489 summed; fees = student body fee. CDS 2025-26 G1: tuition $72,669, fees $401, food and housing $23,434.",
    ielts: {
      value: 7.5,
      source: "https://www.hmc.edu/admission/apply/international-applicants/",
    },
    toefl: {
      value: 100,
      source: "https://www.hmc.edu/admission/apply/international-applicants/",
    },
    duolingo: {
      value: 130,
      source: "https://www.hmc.edu/admission/apply/international-applicants/",
    },
    englishNote:
      "Stated minimums (IELTS Academic 7.5; TOEFL iBT 100; DET 130; Cambridge C1 190 / C2 200). Waived if the school's primary language of instruction is English (only after applying). Self-report allowed.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.hmc.edu/admission/apply/first-year-students/application-deadlines/",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.hmc.edu/admission/apply/first-year-students/application-deadlines/",
    },
    ea: {
      value: "not-offered",
      source: "https://www.hmc.edu/admission/apply/first-year-students/application-deadlines/",
    },
    rd: {
      value: "2027-01-05",
      source: "https://www.hmc.edu/admission/apply/first-year-students/application-deadlines/",
    },
    deadlineNote:
      "Table gives Nov. 15 (ED I), Jan. 5 (ED II, RD) without a year; same page references Fall 2027 applicants.",
    highlight:
      "Its Clinic Program puts student teams on real, sponsor-funded engineering and science projects.",
    image: {
      src: "/media/colleges/harvey-mudd-college.webp",
      card: "/media/colleges/harvey-mudd-college-card.webp",
      title: "Harvey mudd campus photo.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Harvey_mudd_campus_photo.jpg",
      author: "Hmc5555",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.hmc.edu/admission/apply/first-year-students/",
      international: "https://www.hmc.edu/admission/apply/international-applicants/",
      aid: "https://www.hmc.edu/admission/afford/international-student-financial-aid/",
      cds: "https://www.hmc.edu/institutional-research/wp-content/uploads/sites/42/2026/03/CDS-HMC-2025.2026_shared.pdf",
    },
  },
  {
    slug: "united-states-military-academy-at-west-point",
    name: "United States Military Academy at West Point",
    type: "LAC",
    city: "West Point",
    state: "New York",
    code: "NY",
    rank: {
      label: "#9 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: null,
    applicants: {
      value: null,
      source: null,
    },
    admitted: {
      value: null,
      source: null,
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
    earlyNote: "Service academy: no Early Decision or Early Action plans.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: null,
      source: null,
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote: null,
    needBasedForIntl: {
      value: null,
      source: null,
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: null,
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "International students cannot apply directly; they must be nominated/sponsored by their own national government via the U.S. Defense Attaché Office at the U.S. Embassy (countries invited annually; up to 60 international cadets at a time). Class of 2030 included 19 international cadets entering under the sponsorship of their countries.",
    costYear: null,
    tuition: {
      value: null,
      source: null,
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: null,
      source: null,
    },
    costNote: null,
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
    englishNote: null,
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: null,
      source: null,
    },
    ed2: {
      value: null,
      source: null,
    },
    ea: {
      value: null,
      source: null,
    },
    rd: {
      value: null,
      source: null,
    },
    deadlineNote:
      "International candidates apply through their own government/U.S. Embassy; no deadline published for them.",
    highlight:
      "Founded in 1802 as America's first college of engineering, located 50 miles north of New York City.",
    image: {
      src: "/media/colleges/united-states-military-academy-at-west-point.webp",
      card: "/media/colleges/united-states-military-academy-at-west-point-card.webp",
      title: "Cadet Chapel USMA.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Cadet_Chapel_USMA.JPG",
      author: "Ahodges7",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://www.westpoint.edu/admissions",
      international: "https://www.westpoint.edu/admissions/prospective-cadets/international-cadets",
      aid: null,
      cds: null,
    },
  },
  {
    slug: "wellesley-college",
    name: "Wellesley College",
    type: "LAC",
    city: "Wellesley",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#10 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8506,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    admitted: {
      value: 1258,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    edApplicants: {
      value: 1023,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    edAdmitted: {
      value: 301,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered (C21 counts combined); CDS C22: no Early Action.",
    sat: {
      value: "1460-1540",
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote:
      "Wellesley states it will continue to be test optional for those applying for entry in fall 2027.",
    needBasedForIntl: {
      value: true,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: null,
    intlAided: {
      value: 71,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    intlAvgAward: {
      value: 94053,
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    intlNote:
      "Wellesley describes admission as not need-blind (need-sensitive) for non-US citizens/permanent residents; it funds full calculated need of admitted international aid applicants but only a limited number each year. Aid must be requested with the admission application; students admitted without aid cannot get aid later.",
    costYear: "2026-2027",
    tuition: {
      value: null,
      source: null,
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: null,
      source: null,
    },
    costNote:
      "Housing $12,020 + meals $11,186 summed; fees = student activity fee. CDS 2025-26 G1 left blank.",
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
      "English proficiency exam not required; recommended (TOEFL, Duolingo, IELTS, Cambridge, InitialView/Vericant) for non-native speakers with fewer than four years in an English-based curriculum. No minimum score seen.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: null,
      source: null,
    },
    ed2: {
      value: null,
      source: null,
    },
    ea: {
      value: "not-offered",
      source:
        "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
    rd: {
      value: null,
      source: null,
    },
    deadlineNote: "Nov 1 (ED I), Jan 5 (ED II), Jan 8 (RD); mapped to the 2026-27 cycle.",
    highlight:
      "Its campus wraps around Lake Waban, with lakeside paths running past the residence halls.",
    image: {
      src: "/media/colleges/wellesley-college.webp",
      card: "/media/colleges/wellesley-college-card.webp",
      title: "Green Hall, Wellesley College, Wellesley MA.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Green_Hall,_Wellesley_College,_Wellesley_MA.jpg",
      author: "John Phelan",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    urls: {
      admissions: "https://www.wellesley.edu/admission-aid/apply/first-year-applicants",
      international: "https://www.wellesley.edu/admission/apply/international/instructions",
      aid: "https://www.wellesley.edu/admission-aid/student-financial-services/understanding-financial-aid/apply-for-aid/international-students",
      cds: "https://wellesley-college.files.svdcdn.com/production/administrative-departments/OIR/CDS_2025-2026-FINAL.pdf",
    },
  },
  {
    slug: "united-states-air-force-academy",
    name: "United States Air Force Academy",
    type: "LAC",
    city: "USAF Academy",
    state: "Colorado",
    code: "CO",
    rank: {
      label: "#11 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: null,
    applicants: {
      value: null,
      source: null,
    },
    admitted: {
      value: null,
      source: null,
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
    earlyNote: "Service academy: no Early Decision or Early Action plans.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: null,
      source: null,
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote: null,
    needBasedForIntl: {
      value: null,
      source: null,
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: null,
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "International cadets attend through the Secretary of Defense Four-Year International Cadet Program, which admits appointees from foreign nations (e.g., nominated by their defense ministry); a USAFA article reported 60 international cadets from 30 countries. No direct application route for Bangladeshi students without government appointment.",
    costYear: null,
    tuition: {
      value: null,
      source: null,
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: null,
      source: null,
    },
    costNote: null,
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
    englishNote: null,
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: null,
      source: null,
    },
    ed2: {
      value: null,
      source: null,
    },
    ea: {
      value: null,
      source: null,
    },
    rd: {
      value: null,
      source: null,
    },
    deadlineNote:
      "International candidates are appointed through their own government; no deadline published for them.",
    highlight:
      "Its Cadet Chapel, an aluminum, glass and steel building with 17 spires rising 150 feet, is the Academy's most recognizable landmark (closed for renovation until about 2028).",
    image: {
      src: "/media/colleges/united-states-air-force-academy.webp",
      card: "/media/colleges/united-states-air-force-academy-card.webp",
      title: "Air Force Academy Chapel, Colorado Springs, CO 04090u original.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Air_Force_Academy_Chapel,_Colorado_Springs,_CO_04090u_original.jpg",
      author: "Carol M. Highsmith",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://www.academyadmissions.com/",
      international:
        "https://www.usafa.edu/vietnamese-citizen-takes-part-in-dod-air-force-academy-international-programs/",
      aid: null,
      cds: null,
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
    image: {
      src: "/media/colleges/vassar-college.webp",
      card: "/media/colleges/vassar-college-card.webp",
      title: "Vassar College Main Building.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Vassar_College_Main_Building.jpg",
      author: "Akarenbon",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.vassar.edu/admission/",
      international: "https://www.vassar.edu/admission/apply/international/",
      aid: "https://offices.vassar.edu/student-financial-services/financial-aid-faq/",
      cds: "https://offices.vassar.edu/institutional-research/data/common-data-set-2025-26/",
    },
  },
  {
    slug: "washington-and-lee-university",
    name: "Washington and Lee University",
    type: "LAC",
    city: "Lexington",
    state: "Virginia",
    code: "VA",
    rank: {
      label: "#12 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8963,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    admitted: {
      value: 1214,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    edApplicants: {
      value: 1048,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    edAdmitted: {
      value: 289,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Binding ED I and ED II (counts combined); no Early Action (CDS C22 = No).",
    sat: {
      value: "1430-1530",
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    act: {
      value: "33-34",
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.wlu.edu/admissions/apply/for-international-applicants",
    },
    testNote:
      "SAT/ACT optional for the Class of 2031; scores encouraged for national-curriculum students. ~30% of Fall 2025 enrollees submitted SAT, 22% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.wlu.edu/admissions/financial-aid",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "All First-Year applicants, including domestic, international and undocumented students, are eligible and encouraged to apply for need-based financial aid. Need Blind — W&L admits students without considering their ability to pay.",
    intlAided: {
      value: 160,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    intlAvgAward: {
      value: 90617,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    intlNote:
      "Both need-based and merit (e.g., Johnson Scholarship) aid open to international students. Meets 100% of demonstrated need with grants and work, no loans.",
    costYear: "2026-2027",
    tuition: {
      value: 73575,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    fees: {
      value: 1285,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    roomBoard: {
      value: 20575,
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-27 year.",
    ielts: {
      value: 7,
      source:
        "https://www.wlu.edu/admissions/apply/for-international-applicants/english-proficiency-policy",
    },
    toefl: {
      value: 100,
      source:
        "https://www.wlu.edu/admissions/apply/for-international-applicants/english-proficiency-policy",
    },
    duolingo: {
      value: 130,
      source:
        "https://www.wlu.edu/admissions/apply/for-international-applicants/english-proficiency-policy",
    },
    englishNote:
      "Typical benchmarks, not minimums: successful applicants usually report DET 130, IELTS 7, TOEFL iBT 100 (or 5 on the post-January-2026 TOEFL scale); scores read in context.",
    nationalCurriculum: {
      value:
        "Requires the internal secondary school transcript, official results of completed external exams (examples listed include IGCSE, CBSE, SSC, WASSCE) and any predicted scores for upcoming exams; documents vary by curriculum. SAT/ACT encouraged for national-curriculum students.",
      source: "https://www.wlu.edu/admissions/apply/for-international-applicants",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.wlu.edu/admissions/apply/for-international-applicants",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.wlu.edu/admissions/apply/for-international-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://my.wlu.edu/document/2025-common-data-set",
    },
    rd: {
      value: "2027-01-05",
      source: "https://www.wlu.edu/admissions/apply/for-international-applicants",
    },
    deadlineNote:
      "Application deadlines; supplemental materials due later (ED I Nov 15, ED II Jan 15, RD Feb 1). Johnson Scholarship application Dec 1. Page lists dates without years.",
    highlight:
      "The Colonnade, a row of five front-campus halls dating from 1824 to 1935, is a National Historic Landmark.",
    image: {
      src: "/media/colleges/washington-and-lee-university.webp",
      card: "/media/colleges/washington-and-lee-university-card.webp",
      title: "2008-0831-WashingtonandLeeUniversity.jpg",
      page: "https://commons.wikimedia.org/wiki/File:2008-0831-WashingtonandLeeUniversity.jpg",
      author: "Bobak Ha'Eri",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
    },
    urls: {
      admissions: "https://admissions.wlu.edu/",
      international: "https://www.wlu.edu/admissions/apply/for-international-applicants",
      aid: "https://www.wlu.edu/admissions/financial-aid",
      cds: "https://my.wlu.edu/accreditation-and-institutional-research/common-data-set",
    },
  },
  {
    slug: "hamilton-college",
    name: "Hamilton College",
    type: "LAC",
    city: "Clinton",
    state: "New York",
    code: "NY",
    rank: {
      label: "#14 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8904,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    admitted: {
      value: 1210,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    edApplicants: {
      value: 1120,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    edAdmitted: {
      value: 315,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Binding ED I and ED II (counts combined); no Early Action (CDS C22 = No).",
    sat: {
      value: "1440-1510",
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    act: {
      value: "33-35",
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.hamilton.edu/admission/apply/international",
    },
    testNote:
      "Applicants may submit SAT/ACT but they are not required. 35% of Fall 2025 enrollees submitted SAT, 13% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.hamilton.edu/admission/finaid/international",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.hamilton.edu/admission/finaid/international",
    },
    policyQuote:
      "Although Hamilton has one of the most generous international financial aid programs in the U.S., the College is not need-blind in admission for non-U.S. citizens.",
    intlAided: {
      value: 71,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    intlAvgAward: {
      value: 74400,
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    intlNote:
      "Meets full demonstrated need for international students who applied for aid at the time of admission. Certification of Finances required of all international applicants; CSS Profile for aid applicants.",
    costYear: "2026-2027",
    tuition: {
      value: 75210,
      source: "https://www.hamilton.edu/admission/tuition",
    },
    fees: {
      value: 750,
      source: "https://www.hamilton.edu/admission/tuition",
    },
    roomBoard: {
      value: 19290,
      source: "https://www.hamilton.edu/admission/tuition",
    },
    costNote:
      "Room/board = housing $10,540 + food $8,750 (listed separately on the tuition page and in CDS G1; combined line blank in CDS). Fees = student activity fee.",
    ielts: {
      value: 7.5,
      source: "https://www.hamilton.edu/admission/apply/international/english-language-proficiency",
    },
    toefl: {
      value: 100,
      source: "https://www.hamilton.edu/admission/apply/international/english-language-proficiency",
    },
    duolingo: {
      value: 130,
      source: "https://www.hamilton.edu/admission/apply/international/english-language-proficiency",
    },
    englishNote:
      "Page says Hamilton has no specific score requirement; competitive applicants typically score at or above IELTS 7.5, TOEFL 100 (pre-Jan 2026; 5.0 min / 5.5 recommended on new scale), DET 130. Waived for English-medium secondary school.",
    nationalCurriculum: {
      value:
        "No specific national-exam guidance: applications are evaluated in the context of the applicant's education system and school; credential evaluations not required, but certified translations of non-English documents are.",
      source: "https://www.hamilton.edu/admission/apply/international",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.hamilton.edu/admission/apply/first-year",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://www.hamilton.edu/admission/apply/first-year",
    },
    ea: {
      value: "not-offered",
      source: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
    rd: {
      value: "2027-01-04",
      source: "https://www.hamilton.edu/admission/apply/first-year",
    },
    deadlineNote: "Dates shown without years; RD applicants may convert to ED II before Feb 1.",
    highlight:
      "Hamilton has an open curriculum, so students choose their own courses without distribution requirements.",
    image: {
      src: "/media/colleges/hamilton-college.webp",
      card: "/media/colleges/hamilton-college-card.webp",
      title: "Hamilton College Chapel in the Sun (cropped).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Hamilton_College_Chapel_in_the_Sun_(cropped).jpg",
      author: "ProfessorGhostface",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.hamilton.edu/admission",
      international: "https://www.hamilton.edu/admission/apply/international",
      aid: "https://www.hamilton.edu/admission/finaid/international",
      cds: "https://www.hamilton.edu/offices/oir/common-data-sets/cds-2025-26",
    },
  },
  {
    slug: "wesleyan-university",
    name: "Wesleyan University",
    type: "LAC",
    city: "Middletown",
    state: "Connecticut",
    code: "CT",
    rank: {
      label: "#14 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: null,
    applicants: {
      value: 14389,
      source: "https://nces.ed.gov/collegenavigator/?id=130697",
    },
    admitted: {
      value: null,
      source: null,
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
      "ED I and ED II offered; no Early Action listed. ED counts not available (CDS not publicly accessible).",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: "33-35",
      source: "https://nces.ed.gov/collegenavigator/?id=130697",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/first-year.html",
    },
    testNote:
      "Test-optional (homeschoolers must submit). SAT/ACT encouraged for students from non-exam-based international curricula. IPEDS Fall 2024 sections only: SAT EBRW 705-760, Math 710-780; ACT from IPEDS Fall 2024.",
    needBasedForIntl: {
      value: true,
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/first-year.html",
    },
    policyQuote:
      "Financial aid for international applicants is available; however, it is limited, so admission for this group is extremely selective.",
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "Meets 100% of demonstrated need for admitted students; internationals must apply for aid at time of admission (CSS Profile or ISFAA). Full four-year scholarships include the Freeman Asian Scholarship and African Scholars Program. No aid for international transfers.",
    costYear: "2026-2027",
    tuition: {
      value: 75916,
      source: "https://www.wesleyan.edu/admission/affordability-and-aid/cost-of-attendance.html",
    },
    fees: {
      value: 404,
      source: "https://www.wesleyan.edu/admission/affordability-and-aid/cost-of-attendance.html",
    },
    roomBoard: {
      value: 21660,
      source: "https://www.wesleyan.edu/admission/affordability-and-aid/cost-of-attendance.html",
    },
    costNote:
      "Fees = student activity fee; new students also pay a one-time $300 matriculation fee.",
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
      "English proficiency testing is optional but strongly recommended for non-native speakers; no scores published. SAT/ACT may be used to demonstrate proficiency.",
    nationalCurriculum: {
      value:
        "Students in exam-based curricula (examples: A level, IB, French Bacc, ISC, WASSCE) must provide actual or predicted results via the school, then actual results when available; those in non-exam-based curricula are encouraged to submit SAT/ACT.",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
    },
    ea: {
      value: "not-offered",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/first-year.html",
    },
    rd: {
      value: "2027-01-01",
      source: "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
    },
    deadlineNote:
      "Page: RD due January 1; ED due November 15 or January 1 (no years). Aid deadlines listed there still show last cycle's dates.",
    highlight:
      "Wesleyan offers full four-year scholarships for some international students, including the Freeman Asian Scholarship and the African Scholars Program.",
    image: {
      src: "/media/colleges/wesleyan-university.webp",
      card: "/media/colleges/wesleyan-university-card.webp",
      title: "Wesleyan University - College Row 01.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Wesleyan_University_-_College_Row_01.jpg",
      author: "Joe Mabel",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    urls: {
      admissions: "https://www.wesleyan.edu/admission/index.html",
      international:
        "https://www.wesleyan.edu/admission/undergraduate-admission/international/index.html",
      aid: "https://www.wesleyan.edu/admission/affordability-and-aid/applying-for-aid.html",
      cds: "https://www.wesleyan.edu/ir/common-data-sets.html",
    },
  },
  {
    slug: "carleton-college",
    name: "Carleton College",
    type: "LAC",
    city: "Northfield",
    state: "Minnesota",
    code: "MN",
    rank: {
      label: "#16 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 6796,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    admitted: {
      value: 1480,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    edApplicants: {
      value: 760,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    edAdmitted: {
      value: 263,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Fall ED and Winter ED (binding; counts combined); no Early Action (CDS C22 = No).",
    sat: {
      value: "1460-1530",
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    act: {
      value: "32-35",
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.carleton.edu/admissions/apply/steps/materials/",
    },
    testNote:
      "Permanent test-optional policy adopted in 2025; scores may be self-reported. 39% of Fall 2025 enrollees submitted SAT, 25% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.carleton.edu/admissions/apply/steps/international/",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "Carleton meets 100% of your demonstrated financial need, without loans. ... We have limited funding available to international students. As a result, we will not consider a new or revised application for aid once you have been offered admission.",
    intlAided: {
      value: 63,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    intlAvgAward: {
      value: 81596,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    intlNote:
      "Certification of Finances required of all internationals; aid applicants submit CSS Profile or free ISAFA. A very limited number of international scholarships awarded in ED.",
    costYear: "2026-2027",
    tuition: {
      value: 75186,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    fees: {
      value: 486,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    roomBoard: {
      value: 19314,
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-27 year.",
    ielts: {
      value: 7,
      source: "https://www.carleton.edu/admissions/apply/steps/international/",
    },
    toefl: {
      value: 100,
      source: "https://www.carleton.edu/admissions/apply/steps/international/",
    },
    duolingo: {
      value: 130,
      source: "https://www.carleton.edu/admissions/apply/steps/international/",
    },
    englishNote:
      "Not hard minimums: page says students with these scores are best prepared (TOEFL iBT 100+ before 2026 / 5.5+ new scale, IELTS 7.0+, DET 130+). Needed if English is not spoken at home and classes were not in English for the last four years.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.carleton.edu/admissions/apply/steps/materials/",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.carleton.edu/admissions/apply/steps/materials/",
    },
    ea: {
      value: "not-offered",
      source:
        "https://carleton-wp-production.s3.amazonaws.com/uploads/sites/292/2026/06/CDS-PDF-2025-2026_PDF_Carleton_06242026.pdf",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.carleton.edu/admissions/apply/steps/materials/",
    },
    deadlineNote:
      "Fall ED Nov 15, Winter ED Jan 15, RD Jan 15 (page shows no years). No application fee.",
    highlight:
      "Campus borders the 800-acre Cowling Arboretum, known as 'The Arb', used as an outdoor classroom.",
    image: {
      src: "/media/colleges/carleton-college.webp",
      card: "/media/colleges/carleton-college-card.webp",
      title: "Collegiate Gothic - Northfield, MN - Carleton College (Margaret Evans Hall) (1).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Collegiate_Gothic_-_Northfield,_MN_-_Carleton_College_(Margaret_Evans_Hall)_(1).jpg",
      author: "Bmzuckerman",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    urls: {
      admissions: "https://www.carleton.edu/admissions/",
      international: "https://www.carleton.edu/admissions/apply/steps/international/",
      aid: "https://www.carleton.edu/admissions/apply/steps/international/",
      cds: "https://www.carleton.edu/ira/institutional-data/cds1/",
    },
  },
  {
    slug: "davidson-college",
    name: "Davidson College",
    type: "LAC",
    city: "Davidson",
    state: "North Carolina",
    code: "NC",
    rank: {
      label: "#16 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8933,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    admitted: {
      value: 1127,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    edApplicants: {
      value: 1232,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    edAdmitted: {
      value: 358,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (counts combined); no Early Action (CDS C22 = No).",
    sat: {
      value: "1410-1500",
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    act: {
      value: "32-34",
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    testPolicy: {
      value: "optional",
      source:
        "https://www.davidson.edu/admission-and-financial-aid/admission-process-help/testing-policy",
    },
    testNote:
      "Permanently test-optional since 2020, including for international applicants. 25% of Fall 2025 enrollees submitted SAT, 24% ACT.",
    needBasedForIntl: {
      value: true,
      source:
        "https://www.davidson.edu/admission-and-financial-aid/admission-process-help/frequently-asked-questions/international-admission-aid-faqs",
    },
    intlAidPolicy: {
      value: "need-aware",
      source:
        "https://www.davidson.edu/admission-and-financial-aid/admission-process-help/frequently-asked-questions/international-admission-aid-faqs",
    },
    policyQuote:
      "While we consider financial need during the admission process and are need-aware for applicants who are not citizens of the United States, we meet 100% of the calculated need for all admitted students.",
    intlAided: {
      value: 201,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    intlAvgAward: {
      value: 60298,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    intlNote:
      "International aid is limited and competitive; must apply at time of admission. All international aid applicants considered for the Alvarez Scholars Program. CDS H6 shows both need-based and non-need-based aid available.",
    costYear: "2026-2027",
    tuition: {
      value: 73090,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    fees: {
      value: 900,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    roomBoard: {
      value: 18780,
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-27 year.",
    ielts: {
      value: 7,
      source: "https://www.davidson.edu/admission-and-financial-aid/apply/international-applicants",
    },
    toefl: {
      value: 100,
      source: "https://www.davidson.edu/admission-and-financial-aid/apply/international-applicants",
    },
    duolingo: {
      value: 130,
      source: "https://www.davidson.edu/admission-and-financial-aid/apply/international-applicants",
    },
    englishNote:
      "Recommended, not hard minimums: students at or above TOEFL iBT 100 (5.0 on 1-6 scale), IELTS 7, DET 130 are 'best prepared'. SAT/ACT do not satisfy the requirement; InitialView/Vericant strongly recommended.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.davidson.edu/admission-and-financial-aid/admission-aid-timeline",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://www.davidson.edu/admission-and-financial-aid/admission-aid-timeline",
    },
    ea: {
      value: "not-offered",
      source: "https://www.davidson.edu/media/9718/download?attachment=",
    },
    rd: {
      value: "2027-01-11",
      source: "https://www.davidson.edu/admission-and-financial-aid/admission-aid-timeline",
    },
    deadlineNote: "Admission and aid application deadlines are the same date per round.",
    highlight: "Davidson builds its financial aid packages without loans.",
    image: {
      src: "/media/colleges/davidson-college.webp",
      card: "/media/colleges/davidson-college-card.webp",
      title: "Chambers Building, Davidson College (Davidson, North Carolina).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Chambers_Building,_Davidson_College_(Davidson,_North_Carolina).jpg",
      author: "Dacoslett at English Wikipedia",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://www.davidson.edu/admission-and-financial-aid",
      international:
        "https://www.davidson.edu/admission-and-financial-aid/apply/international-applicants",
      aid: "https://www.davidson.edu/admission-and-financial-aid/financial-aid/applying-aid/international-students",
      cds: "https://www.davidson.edu/offices-and-services/institutional-effectiveness/common-data-set",
    },
  },
  {
    slug: "grinnell-college",
    name: "Grinnell College",
    type: "LAC",
    city: "Grinnell",
    state: "Iowa",
    code: "IA",
    rank: {
      label: "#16 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2024-2025",
    applicants: {
      value: 9758,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    admitted: {
      value: 1416,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    edApplicants: {
      value: 828,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    edAdmitted: {
      value: 283,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (counts combined, Fall 2024 class); no Early Action (CDS C22 = N).",
    sat: {
      value: "1430-1520",
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    act: {
      value: "31-34",
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    testNote:
      "Test-optional; self-reported scores accepted, official score required before enrolling. 29% of Fall 2024 enrollees submitted SAT, 21% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    policyQuote: null,
    intlAided: {
      value: 243,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    intlAvgAward: {
      value: 56853,
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    intlNote:
      "Full need met for admitted internationals who file an aid application by the deadline.",
    costYear: "2026-2027",
    tuition: {
      value: 73582,
      source: "https://www.grinnell.edu/admission/financial-aid/cost-attendance",
    },
    fees: {
      value: 572,
      source: "https://www.grinnell.edu/admission/financial-aid/cost-attendance",
    },
    roomBoard: {
      value: 17784,
      source: "https://www.grinnell.edu/admission/financial-aid/cost-attendance",
    },
    costNote:
      "Room/board = basic room $8,316 + full meal plan $9,468. Fees = activity fee; student health insurance $2,769 also billed (waivable only with qualifying Iowa plan). Tuition includes required books.",
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
      "DET, IELTS or TOEFL (official score report) required if native language/instruction is not English; no minimum or recommended scores published.",
    nationalCurriculum: {
      value:
        "Requires external exams per country system (e.g., O-Level, A-Level, SSSCE, IB); O/A-Level-system students must continue through A-Level or equivalent to be eligible. Transcript/mark sheets for each high school year required.",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    ea: {
      value: "not-offered",
      source:
        "https://www.grinnell.edu/sites/default/files/docs/2025-03/Grinnell-2024-2025-Common-Data-Set.pdf",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.grinnell.edu/admission/apply/international",
    },
    deadlineNote:
      "Application and financial aid deadlines are the same; page lists dates without years.",
    highlight: "Grinnell's tuition includes required books and course materials.",
    image: {
      src: "/media/colleges/grinnell-college.webp",
      card: "/media/colleges/grinnell-college-card.webp",
      title: "Goodnow Hall Grinnell IA.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Goodnow_Hall_Grinnell_IA.jpg",
      author: "Smallbones",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.grinnell.edu/admission",
      international: "https://www.grinnell.edu/admission/apply/international",
      aid: "https://www.grinnell.edu/admission/financial-aid/apply-aid/prospective-students",
      cds: "https://www.grinnell.edu/about/leadership/offices-services/institutional-research/common-data-set",
    },
  },
  {
    slug: "barnard-college",
    name: "Barnard College",
    type: "LAC",
    city: "New York",
    state: "New York",
    code: "NY",
    rank: {
      label: "#19 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 10426,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    admitted: {
      value: 1048,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    edApplicants: {
      value: 1437,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    edAdmitted: {
      value: 476,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Single binding ED round (no ED II); no Early Action (CDS C22 = No).",
    sat: {
      value: "1480-1540",
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    act: {
      value: "32-35",
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    testNote:
      "SAT/ACT optional through the 2027 first-year cycle; self-reported scores accepted, official scores required on enrollment. ~38% of Fall 2025 enrollees submitted SAT, 16% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    policyQuote:
      "Barnard will meet 100% of the financial need of admitted students. For those students seeking financial aid, we are need-blind for U.S. citizens and permanent residents. We are need-aware for non-U.S. citizens and non-permanent residents.",
    intlAided: {
      value: 31,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    intlAvgAward: {
      value: 80574,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    intlNote: null,
    costYear: "2026-2027",
    tuition: {
      value: 73120,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    fees: {
      value: 2472,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    roomBoard: {
      value: 23258,
      source: "https://barnard.edu/sites/default/files/2026-09/Barnard_CDS_2025-2026.pdf",
    },
    costNote: "CDS 2025-26 G1 reports the 2026-27 year.",
    ielts: {
      value: 7.5,
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    toefl: {
      value: 105,
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    duolingo: {
      value: 135,
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    englishNote:
      "Typical, not minimums: 'most competitive candidates' generally score IELTS 7.5+, TOEFL 105+ (5.5+ for tests from Jan 20, 2026), DET 135+. Waived for English-taught IB/A Level, SAT EBRW 700+ or ACT English/Reading 29+.",
    nationalCurriculum: {
      value:
        "Students who took external national or board examinations must submit exam results plus transcripts for each year of secondary study, and state the certificate expected and when; certificates themselves should not be sent.",
      source: "https://barnard.edu/admissions/internationalstudents",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://barnard.edu/admissions/the-application-process",
    },
    ed2: {
      value: "not-offered",
      source: "https://barnard.edu/admissions/the-application-process",
    },
    ea: {
      value: "not-offered",
      source: "https://barnard.edu/admissions/the-application-process",
    },
    rd: {
      value: "2027-01-01",
      source: "https://barnard.edu/admissions/the-application-process",
    },
    deadlineNote: "Two rounds only (ED Nov 1, RD Jan 1); page lists dates without years.",
    highlight:
      "A women's college across the street from Columbia University, sharing academic resources, athletic fields and even dining halls.",
    image: {
      src: "/media/colleges/barnard-college.webp",
      card: "/media/colleges/barnard-college-card.webp",
      title: "Milstein front.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Milstein_front.jpg",
      author: "Mollywollydoodle",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://barnard.edu/admissions-aid",
      international: "https://barnard.edu/admissions/internationalstudents",
      aid: "https://barnard.edu/costs-and-aid",
      cds: "https://barnard.edu/institutional-effectiveness/common-data-set",
    },
  },
  {
    slug: "middlebury-college",
    name: "Middlebury College",
    type: "LAC",
    city: "Middlebury",
    state: "Vermont",
    code: "VT",
    rank: {
      label: "#19 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 11831,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    admitted: {
      value: 1511,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    edApplicants: {
      value: 1179,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    edAdmitted: {
      value: 460,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
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
      "ED I and ED II (counts combined; ED admits exclude February admits); no Early Action.",
    sat: {
      value: "1460-1530",
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    act: {
      value: "33-35",
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    testPolicy: {
      value: "optional",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    testNote:
      "Test optional; self-reported scores accepted. 33% of Fall 2025 enrollees submitted SAT, 16% ACT.",
    needBasedForIntl: {
      value: true,
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    intlAidPolicy: {
      value: "need-aware",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    policyQuote:
      "We are need aware in our admission of international students. If you are seeking financial assistance, you must apply for aid when you apply for admission, no later than the deadlines indicated on our website.",
    intlAided: {
      value: 198,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    intlAvgAward: {
      value: 83697,
      source:
        "https://www.middlebury.edu/sites/default/files/2026-11/Fall%202025%20CDS%20FINAL.pdf?fv=2jux9jym",
    },
    intlNote: "Middlebury meets all admitted students' demonstrated need (financial-aid page).",
    costYear: "2026-2027",
    tuition: {
      value: 72924,
      source:
        "https://www.middlebury.edu/office/student-financial-services/tuition-fees-and-payment/tuition-and-fees",
    },
    fees: {
      value: 542,
      source:
        "https://www.middlebury.edu/office/student-financial-services/tuition-fees-and-payment/tuition-and-fees",
    },
    roomBoard: {
      value: 20920,
      source:
        "https://www.middlebury.edu/office/student-financial-services/tuition-fees-and-payment/tuition-and-fees",
    },
    costNote: "Fees = student activity fee; health insurance coverage also required.",
    ielts: {
      value: 7,
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    toefl: {
      value: 105,
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    duolingo: {
      value: 130,
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    englishNote:
      "'Recommended minimum' scores: TOEFL iBT 105 (5.5 for tests from Jan 21, 2026), DET 130, IELTS 7.0, or Cambridge C1 Advanced. Exemptions apply.",
    nationalCurriculum: {
      value:
        "General note only: some requested information may not apply to all international systems; schools should forward all appropriate transcripts, standardized tests and recommendations.",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
    },
    ed1: {
      value: "2026-11-02",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines/student-admissions-options",
    },
    ed2: {
      value: "2027-01-04",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines/student-admissions-options",
    },
    ea: {
      value: "not-offered",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines/student-admissions-options",
    },
    rd: {
      value: "2027-01-04",
      source:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines/student-admissions-options",
    },
    deadlineNote:
      "ED I aid application due Nov 15. Dates listed without years. Applicants may choose September or February entry.",
    highlight:
      "About 100 students a year begin in February as 'Febs', with their own orientation and registration.",
    image: {
      src: "/media/colleges/middlebury-college.webp",
      card: "/media/colleges/middlebury-college-card.webp",
      title: "MiddleburyCollege MeadChapelOblique 20160929.jpg",
      page: "https://commons.wikimedia.org/wiki/File:MiddleburyCollege_MeadChapelOblique_20160929.jpg",
      author: "Niranjan Arminius",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.middlebury.edu/college/admissions",
      international:
        "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines",
      aid: "https://www.middlebury.edu/college/admissions/financial-aid",
      cds: "https://www.middlebury.edu/assessment-institutional-research/institutional-data/historical-data",
    },
  },
  {
    slug: "university-of-richmond",
    name: "University of Richmond",
    type: "LAC",
    city: "Richmond",
    state: "Virginia",
    code: "VA",
    rank: {
      label: "#21 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 16560,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
    },
    admitted: {
      value: 3683,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
    },
    edApplicants: {
      value: 1154,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
    },
    edAdmitted: {
      value: 421,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
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
      "ED I, ED II (counts combined) and non-binding Early Action offered; CDS C22 does not report EA applicant/admit counts.",
    sat: {
      value: "1420-1490",
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
    },
    act: {
      value: "33-34",
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionC.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admission.richmond.edu/process/materials/test-optional.html",
    },
    testNote:
      "Test optional for first-years entering in 2027; homeschooled/online-school students must submit SAT/ACT. ~19% of Fall 2025 enrollees submitted SAT, 15% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://admission.richmond.edu/process/international/index.html",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admission.richmond.edu/process/international/index.html",
    },
    policyQuote: null,
    intlAided: {
      value: 187,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionH.pdf",
    },
    intlAvgAward: {
      value: 67911,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionH.pdf",
    },
    intlNote:
      "Need-based aid for non-US citizens is limited; all non-citizens submit a Certification of Financial Responsibility. Internationals advised to apply by the Dec 1 Richmond Scholars merit deadline.",
    costYear: "2026-2027",
    tuition: {
      value: 70725,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionG.pdf",
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: 18815,
      source: "https://ifx.richmond.edu/pdfs/CDS2025-2026SectionG.pdf",
    },
    costNote: "CDS G1 (2026-27) says required fees are included in tuition.",
    ielts: {
      value: 7.5,
      source: "https://admission.richmond.edu/process/international/english-proficiency.html",
    },
    toefl: {
      value: 100,
      source: "https://admission.richmond.edu/process/international/english-proficiency.html",
    },
    duolingo: {
      value: 135,
      source: "https://admission.richmond.edu/process/international/english-proficiency.html",
    },
    englishNote:
      "Published scores are 'competitive scores, not minimum required scores' (TOEFL 100 or 5.5 new scale, IELTS 7.5, DET 135). Waivers for 4 years in English-medium school, qualifying SAT/ACT, or strong AP/IB/A-level English.",
    nationalCurriculum: {
      value:
        "Translated transcripts are evaluated for progress in both national and internationally recognized curricula (e.g., AP, IB, A-levels); no specific national-exam requirements published.",
      source: "https://admission.richmond.edu/process/international/index.html",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admission.richmond.edu/process/index.html",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://admission.richmond.edu/process/index.html",
    },
    ea: {
      value: "2026-11-01",
      source: "https://admission.richmond.edu/process/index.html",
    },
    rd: {
      value: "2027-01-01",
      source: "https://admission.richmond.edu/process/index.html",
    },
    deadlineNote:
      "Early Action is non-binding (not restrictive per CDS C22). Dates listed without years. Richmond Scholars merit application Dec 1.",
    highlight:
      "International applicants can be considered for the Richmond Scholars merit scholarship program, which has a December 1 application deadline.",
    image: {
      src: "/media/colleges/university-of-richmond.webp",
      card: "/media/colleges/university-of-richmond-card.webp",
      title: "University of Richmond.jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Richmond.jpg",
      author: "Andrij Bulba from Slovakia",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    urls: {
      admissions: "https://admission.richmond.edu/",
      international: "https://admission.richmond.edu/process/international/index.html",
      aid: "https://admission.richmond.edu/process/international/index.html",
      cds: "https://ifx.richmond.edu/research/common-data.html",
    },
  },
  {
    slug: "colby-college",
    name: "Colby College",
    type: "LAC",
    city: "Waterville",
    state: "Maine",
    code: "ME",
    rank: {
      label: "#22 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: null,
    applicants: {
      value: 21065,
      source: "https://afa.colby.edu/apply/college-profile/",
    },
    admitted: {
      value: null,
      source: null,
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
    earlyNote: "ED I and ED II offered; no Early Action. ED counts unavailable (no public CDS).",
    sat: {
      value: "1430-1520",
      source: "https://afa.colby.edu/apply/college-profile/",
    },
    act: {
      value: "33-34",
      source: "https://afa.colby.edu/apply/college-profile/",
    },
    testPolicy: {
      value: "optional",
      source: "https://afa.colby.edu/apply/requirements/",
    },
    testNote:
      "Test optional; self-reported scores accepted, superscored. SAT/ACT ranges are the college profile's 'middle 50%' for the Class of 2030 (not CDS).",
    needBasedForIntl: {
      value: true,
      source: "https://afa.colby.edu/apply/requirements/international-applicants/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://afa.colby.edu/apply/faq/",
    },
    policyQuote:
      "Colby meets 100 percent of demonstrated need for all admitted students, including international students. ... Is Colby need blind or need aware? Colby is need aware.",
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "International aid applicants file the CSS Profile (fee waiver available). Students who do not apply for aid before admission wait two years for Colby grant eligibility. Application is free.",
    costYear: "2026-2027",
    tuition: {
      value: 75790,
      source: "https://afa.colby.edu/cost-and-aid/tuition-and-fees/",
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: 19480,
      source: "https://afa.colby.edu/cost-and-aid/tuition-and-fees/",
    },
    costNote:
      "Colby lists tuition and fees combined ($75,790); first-years also billed a $500 orientation-trip (COOT) fee.",
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
      "TOEFL iBT/Home, IELTS Academic or DET required if English is neither first language nor language of instruction; self-reporting allowed, TOEFL superscored. No minimum or recommended scores published.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://afa.colby.edu/apply/requirements/",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://afa.colby.edu/apply/requirements/",
    },
    ea: {
      value: "not-offered",
      source: "https://afa.colby.edu/apply/requirements/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://afa.colby.edu/apply/requirements/",
    },
    deadlineNote:
      "Dates shown without years. International CSS Profile due Nov 15 / Jan 4 / Jan 15 (ED I / ED II / RD).",
    highlight:
      "Colby runs a 4-1-4 calendar with a January term called Jan Plan between the fall and spring semesters.",
    image: {
      src: "/media/colleges/colby-college.webp",
      card: "/media/colleges/colby-college-card.webp",
      title: "Colby miller library.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Colby_miller_library.jpg",
      author: "Nickline4 at English Wikipedia",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://afa.colby.edu/",
      international: "https://afa.colby.edu/apply/requirements/international-applicants/",
      aid: "https://afa.colby.edu/apply/applying-for-aid/",
      cds: null,
    },
  },
  {
    slug: "colgate-university",
    name: "Colgate University",
    type: "LAC",
    city: "Hamilton",
    state: "New York",
    code: "NY",
    rank: {
      label: "#22 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 17310,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    admitted: {
      value: 3030,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    edApplicants: {
      value: 1342,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    edAdmitted: {
      value: 477,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
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
      "Binding ED I and ED II; no Early Action (CDS C22 = No). ED counts are ED I and ED II combined as reported in C21.",
    sat: {
      value: "1450-1510",
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    act: {
      value: "33-35",
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.colgate.edu/admission-aid/apply/first-year-applicants",
    },
    testNote:
      "SAT/ACT optional with no disadvantage for non-submitters; self-reported scores accepted; superscores both. 23% submitted SAT and 16% ACT (CDS C9).",
    needBasedForIntl: {
      value: true,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    policyQuote:
      "Colgate meets 100% of demonstrated financial need for every admitted student, including those who would require a full financial package. ... We consider financial need during the review process for all applicants.",
    intlAided: {
      value: 119,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    intlAvgAward: {
      value: 86649,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    intlNote:
      "International applicants must submit the CSS Profile by the deadline (Nov 1 ED I; Jan 22 ED II/RD per the international page). Application is fee-free for international students. CDS H6 checks both need-based and non-need-based aid.",
    costYear: "2026-2027",
    tuition: {
      value: 73206,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    fees: {
      value: 440,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    roomBoard: {
      value: 18446,
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year), first-year column; food and housing on campus is 19,192 for other undergraduates.",
    ielts: {
      value: 7,
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    toefl: {
      value: null,
      source: null,
    },
    duolingo: {
      value: 130,
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    englishNote:
      "Minimums for non-native speakers not at an English-medium school. TOEFL iBT minimum is stated as 4.5, i.e. on the new 1-6 band scale, not the old 0-120 total. No waiver based on SAT; interviews via InitialView or Vericant encouraged.",
    nationalCurriculum: {
      value:
        "Results of external national or international exams must be sent by the testing agency or a school official; seniors send mid-year grades or, if the school has none, predicted final grades, then a final transcript.",
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://www.colgate.edu/sites/default/files/2026-07/CDS-PDF-2025-2026.pdf",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.colgate.edu/admission-aid/apply/international-applicants",
    },
    deadlineNote:
      "Deadlines page lists Nov. 1 (ED I) and Jan. 15 (ED II, RD) without a year; taken as the 2026-27 cycle. Notifications mid-Dec, mid-Feb, late March.",
    highlight:
      "Colgate's lucky number is 13, after the 13 men who founded it in Hamilton with 13 dollars and 13 prayers.",
    image: {
      src: "/media/colleges/colgate-university.webp",
      card: "/media/colleges/colgate-university-card.webp",
      title: "Colgate University Across Taylor Lake.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Colgate_University_Across_Taylor_Lake.jpg",
      author: "Balon Greyjoy",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.colgate.edu/admission-aid/apply/first-year-applicants",
      international: "https://www.colgate.edu/admission-aid/apply/international-applicants",
      aid: "https://www.colgate.edu/admission-aid/apply/international-applicants",
      cds: "https://www.colgate.edu/about/offices-centers-institutes/office-institutional-analysis/common-data-set",
    },
  },
  {
    slug: "college-of-the-holy-cross",
    name: "College of the Holy Cross",
    type: "LAC",
    city: "Worcester",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#22 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2023-2024",
    applicants: {
      value: 8670,
      source: "https://www.holycross.edu/document/common-data-set-20232024",
    },
    admitted: {
      value: 1829,
      source: "https://www.holycross.edu/document/common-data-set-20232024",
    },
    edApplicants: {
      value: 761,
      source: "https://www.holycross.edu/document/common-data-set-20232024",
    },
    edAdmitted: {
      value: 511,
      source: "https://www.holycross.edu/document/common-data-set-20232024",
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
      "Binding ED I and ED II; no Early Action (CDS C22 = No; admissions page confirms). ED counts are for the Fall 2023 entering class.",
    sat: {
      value: "1270-1420",
      source: "https://www.holycross.edu/document/common-data-set-20232024",
    },
    act: {
      value: "28-32",
      source: "https://www.holycross.edu/document/common-data-set-20232024",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply",
    },
    testNote:
      "Submitting SAT/ACT is entirely optional with no disadvantage; self-reported scores accepted; superscores SAT and ACT. Fall 2023: 35% submitted SAT, 19% ACT (CDS C9).",
    needBasedForIntl: {
      value: true,
      source: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/financial-aid",
    },
    intlAidPolicy: {
      value: "limited",
      source: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/financial-aid",
    },
    policyQuote:
      "Holy Cross meets 100% of demonstrated financial need at time of admission for all admitted international students. Funding is limited, so financial aid for international applicants is very competitive.",
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "International aid applicants file the CSS Profile for International Students; all international applicants also submit the Holy Cross Certification of Finances and a bank letter or affidavit. Pages do not say need-blind or need-aware.",
    costYear: "2026-2027",
    tuition: {
      value: 70220,
      source: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/tuition-fees",
    },
    fees: {
      value: 930,
      source: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/tuition-fees",
    },
    roomBoard: {
      value: 20590,
      source: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/tuition-fees",
    },
    costNote:
      "College tuition page for 2026-2027: fees = health service 470 + activity fee 460; food and housing = standard housing 11,500 + resident food plan 9,090. CDS 2023-24 G1 was left blank.",
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
      "Not minimums: the page says the most competitive applicants score TOEFL 100+, IELTS 7+ or DET 120. Required for non-native speakers not at an English-speaking high school. Duolingo can replace an interview.",
    nationalCurriculum: {
      value:
        "Originals or notarized copies of all secondary school records are required, with certified English translations if needed.",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
    },
    ea: {
      value: "not-offered",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
    },
    deadlineNote:
      "Same deadlines for international applicants: ED I Nov 15, ED II Jan 15, RD Jan 15 (no year printed; taken as the 2026-27 cycle). No Early Action.",
    highlight:
      "Founded by the Jesuits in 1843, Holy Cross calls itself the only exclusively undergraduate Jesuit, Catholic liberal arts college in the US.",
    image: {
      src: "/media/colleges/college-of-the-holy-cross.webp",
      card: "/media/colleges/college-of-the-holy-cross-card.webp",
      title: "College of the Holy Cross.jpg",
      page: "https://commons.wikimedia.org/wiki/File:College_of_the_Holy_Cross.jpg",
      author: "Quintin Soloviev",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    urls: {
      admissions: "https://www.holycross.edu/admissions-aid/how-to-apply",
      international: "https://www.holycross.edu/admissions-aid/how-to-apply/international-students",
      aid: "https://www.holycross.edu/admissions-aid/tuition-financial-aid/financial-aid",
      cds: "https://www.holycross.edu/about-holy-cross/offices-services/office-of-institutional-research-analytics",
    },
  },
  {
    slug: "smith-college",
    name: "Smith College",
    type: "LAC",
    city: "Northampton",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#22 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8102,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    admitted: {
      value: 1816,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    edApplicants: {
      value: 1107,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    edAdmitted: {
      value: 371,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
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
      "Binding ED I and ED II; no Early Action (CDS C22 = No). ED counts are for the Fall 2025 entering class, both rounds combined.",
    sat: {
      value: "1420-1520",
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    act: {
      value: "32-34",
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.smith.edu/admission-aid/apply-smith/standardized-testing-policy",
    },
    testNote:
      "Test-optional since 2009; SAT/ACT optional for all applicants including international citizens. 30% (SAT) and 15% (ACT) of enrolled first-years submitted (CDS C9).",
    needBasedForIntl: {
      value: true,
      source: "https://www.smith.edu/admission-aid/tuition-aid-applicants/international-applicants",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://catalog.smith.edu/smith-college/fees-expenses-financial-aid/",
    },
    policyQuote:
      "The college does operate under a need-sensitive admission policy that typically affects only a small fraction of our applicant pool. ... However, the college may choose to consider a student's level of financial need when making the final admission decision.",
    intlAided: {
      value: 155,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    intlAvgAward: {
      value: 89103,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    intlNote:
      "Smith meets full documented need of admitted students who apply for aid by the deadlines, with no loans in need-based packages. Internationals must apply for aid before admission (CSS Profile plus tax/income statements; CSS due Nov 15 ED I, Jan 6 ED II, Jan 25 RD) or are never eligible. Family contribution is fixed for all four years. CDS H6 checks both need-based and non-need-based aid.",
    costYear: "2026-2027",
    tuition: {
      value: 70460,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    fees: {
      value: 308,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    roomBoard: {
      value: 24520,
      source: "https://drive.google.com/file/d/1qDhlH43IbOCQzP6xtUHMzTmgEss1I-68/view",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year); food and housing on campus (housing 12,300 + food 12,300).",
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
      "TOEFL, IELTS, PTE or Duolingo required for international citizens whose first language is not English and who did not attend an English-medium school; exemptions include IB Diploma or A levels taught in English. No minimum scores published for undergraduates. TOEFL MyBest accepted.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.smith.edu/admission-aid/apply-smith/first-year-applicants",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.smith.edu/admission-aid/apply-smith/first-year-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://www.smith.edu/admission-aid/apply-smith/first-year-applicants",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.smith.edu/admission-aid/apply-smith/first-year-applicants",
    },
    deadlineNote:
      "Admission page: ED I Nov 15, ED II Jan 5, RD Jan 15 (no year printed). The 2026-27 catalog separately says the international undergraduate RD deadline is January 25, which matches the international CSS Profile deadline; the admission page date is used here.",
    highlight:
      "Smith's Picker Engineering Program produced the first graduates of an ABET-accredited engineering program at a women's college, in 2004.",
    image: {
      src: "/media/colleges/smith-college.webp",
      card: "/media/colleges/smith-college-card.webp",
      title: "College Hall - Smith College - Northampton, MA - DSC02109.jpg",
      page: "https://commons.wikimedia.org/wiki/File:College_Hall_-_Smith_College_-_Northampton,_MA_-_DSC02109.jpg",
      author: "Daderot",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.smith.edu/admission-aid/apply-smith/first-year-applicants",
      international: "https://www.smith.edu/admission-aid/apply-smith/standardized-testing-policy",
      aid: "https://www.smith.edu/admission-aid/tuition-aid-applicants/international-applicants",
      cds: "https://www.smith.edu/your-campus/offices-services/institutional-research/data-about-smith",
    },
  },
  {
    slug: "bates-college",
    name: "Bates College",
    type: "LAC",
    city: "Lewiston",
    state: "Maine",
    code: "ME",
    rank: {
      label: "#26 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 9660,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    admitted: {
      value: 1433,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    edApplicants: {
      value: 949,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    edAdmitted: {
      value: 318,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
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
      "Binding ED I and ED II; no Early Action (CDS C22 = No). ED counts are both rounds combined as reported in C21.",
    sat: {
      value: "1325-1510",
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    act: {
      value: "31-34",
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.bates.edu/admission/apply/",
    },
    testNote:
      "SAT/ACT optional for all applicants, including internationals, since 1984; official or self-reported scores accepted. Only 13% (SAT) and 8% (ACT) of enrolled first-years submitted (CDS C9).",
    needBasedForIntl: {
      value: true,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.bates.edu/admission/apply/international-students/",
    },
    policyQuote:
      "Bates meets the full calculated financial need for all admitted students, regardless of citizenship status. Bates is not need-blind when evaluating applications; however, the college offers one of the most generous and inclusive financial aid programs in the United States.",
    intlAided: {
      value: 106,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    intlAvgAward: {
      value: 84952,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    intlNote:
      "Need-based aid only (no merit scholarships). Non-US citizens apply with the Bates International Student Application for Financial Aid (BISAFA), not the CSS Profile, and must state intent to apply for aid before the admission decision; no later requests. Aid is grant plus campus work, no loans. Application is free.",
    costYear: "2026-2027",
    tuition: {
      value: 73760,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    fees: {
      value: 475,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    roomBoard: {
      value: 20800,
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year), first-year column; required fee 475 for first-years (0 for other undergraduates); food and housing on campus.",
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
      "TOEFL, IELTS or Duolingo English Test required if English is neither the native language nor the main language of secondary instruction; official scores only, best score accepted. No minimum scores published. InitialView/Vericant interview encouraged.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.bates.edu/admission/apply/application-options/",
    },
    ed2: {
      value: "2027-01-10",
      source: "https://www.bates.edu/admission/apply/application-options/",
    },
    ea: {
      value: "not-offered",
      source: "https://www.bates.edu/research/files/2026/06/CDS_2025-2026.pdf",
    },
    rd: {
      value: "2027-01-10",
      source: "https://www.bates.edu/admission/apply/application-options/",
    },
    deadlineNote:
      "Application deadlines ED I Nov 15, ED II Jan 10, RD Jan 10 (page gives no year; taken as the 2026-27 cycle). Supporting materials may follow by Nov 20 (ED I) and Jan 15 (ED II/RD).",
    highlight: "Bates has let every applicant choose whether to send SAT or ACT scores since 1984.",
    image: {
      src: "/media/colleges/bates-college.webp",
      card: "/media/colleges/bates-college-card.webp",
      title: "Bates College Campus.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Bates_College_Campus.jpg",
      author: "Josh Kuckens",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.bates.edu/admission/apply/",
      international: "https://www.bates.edu/admission/apply/international-students/",
      aid: "https://www.bates.edu/admission/apply/international-students/",
      cds: "https://www.bates.edu/research/common-data-set/",
    },
  },
  {
    slug: "haverford-college",
    name: "Haverford College",
    type: "LAC",
    city: "Haverford",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#26 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 6730,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    admitted: {
      value: 896,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    edApplicants: {
      value: 702,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    edAdmitted: {
      value: 229,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
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
      "Binding ED I and ED II; no Early Action (CDS C22 = No). ED counts are for the Fall 2025 entering class, both rounds combined.",
    sat: {
      value: "1460-1530",
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    act: {
      value: "33-35",
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.haverford.edu/admission/applying/international-students",
    },
    testNote:
      "Test-optional with no negative impact either way; self-reported or official SAT/ACT accepted (official required after enrolling).",
    needBasedForIntl: {
      value: true,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    intlAidPolicy: {
      value: "limited",
      source:
        "https://www.haverford.edu/financial-aid/frequently-asked-questions/international-students-faq",
    },
    policyQuote:
      "There is limited aid available for international students, making admission for such students especially competitive; however, we do meet 100% of the demonstrated need of all admitted students.",
    intlAided: {
      value: 55,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    intlAvgAward: {
      value: 92126,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    intlNote:
      "All aid is need-based; aid for a limited number of international students per class. Internationals abroad file the 2027-2028 CSS Profile (or Haverford's own international aid form), no FAFSA; aid deadlines Nov 15, 2026 (ED I), Jan 5, 2027 (ED II), Jan 10, 2027 (RD). No aid in later years if none at entry; none for international transfers. CDS H6: need-based only.",
    costYear: "2026-2027",
    tuition: {
      value: 74930,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    fees: {
      value: 863,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    roomBoard: {
      value: 20554,
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year), first-year column; required fees 552 for other undergraduates; food and housing on campus (housing 12,458 + food 8,096).",
    ielts: {
      value: 7,
      source: "https://www.haverford.edu/admission/applying/international-students",
    },
    toefl: {
      value: 100,
      source: "https://www.haverford.edu/admission/applying/international-students",
    },
    duolingo: {
      value: 130,
      source: "https://www.haverford.edu/admission/applying/international-students",
    },
    englishNote:
      "Stated minimums for applicants whose first language is not English and who never attended an English-medium secondary school: TOEFL iBT 100 (old 0-120 scale) or 5 (new 1-6 scale), IELTS Academic 7.0, DET 130. No preferred test.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.haverford.edu/admission/applying/application-timeline",
    },
    ed2: {
      value: "2027-01-05",
      source: "https://www.haverford.edu/admission/applying/application-timeline",
    },
    ea: {
      value: "not-offered",
      source: "https://www.haverford.edu/sites/default/files/Office/President/CDS-2025-26.pdf",
    },
    rd: {
      value: "2027-01-10",
      source: "https://www.haverford.edu/admission/applying/application-timeline",
    },
    deadlineNote:
      "International students have the same deadlines as all applicants. Timeline page gives no year; the international aid page dates the matching aid deadlines Nov 15, 2026 / Jan 5, 2027 / Jan 10, 2027.",
    highlight:
      "Haverford's Honor Code shapes student life from the start, and admitted students are not asked for an enrollment deposit.",
    image: {
      src: "/media/colleges/haverford-college.webp",
      card: "/media/colleges/haverford-college-card.webp",
      title: "Roberts, Union, and Loyd - panoramio.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Roberts,_Union,_and_Loyd_-_panoramio.jpg",
      author: "anonypanor",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
    },
    urls: {
      admissions: "https://www.haverford.edu/admission/applying/application-timeline",
      international: "https://www.haverford.edu/admission/applying/international-students",
      aid: "https://www.haverford.edu/financial-aid/international-applicants",
      cds: "https://www.haverford.edu/president/institutional-effectiveness/institutional-research-and-effectiveness",
    },
  },
  {
    slug: "macalester-college",
    name: "Macalester College",
    type: "LAC",
    city: "Saint Paul",
    state: "Minnesota",
    code: "MN",
    rank: {
      label: "#28 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 8819,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    admitted: {
      value: 2481,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    edApplicants: {
      value: 479,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    edAdmitted: {
      value: 201,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
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
      "Offers ED I, ED II and non-restrictive Early Action. CDS C21 gives ED counts (labelled 'For the Fall 2024 entering class' on the 2025-26 form); CDS C22 does not report EA counts.",
    sat: {
      value: "1350-1480",
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    act: {
      value: "30-33",
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.macalester.edu/admissions/international/first-year/",
    },
    testNote:
      "Test-optional; no minimum SAT/ACT. IB students must submit IB exam scores. 35% of enrolled first-years submitted SAT, 24% ACT (CDS).",
    needBasedForIntl: {
      value: true,
      source: "https://www.macalester.edu/admissions/international/faq/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.macalester.edu/admissions/international/faq/",
    },
    policyQuote:
      "Financial need also plays a role in admission decisions. This is necessary in order for Macalester to make sure our financial aid budget meets our promise of meeting 100% of demonstrated need for every student we admit.",
    intlAided: {
      value: 287,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    intlAvgAward: {
      value: 59839,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    intlNote:
      "International FAQ: students with the highest need (family contribution under $40,000) face the most competition; extra consideration for high-need internationals applying Early Decision. Aid interest must be stated at application (CSS Profile or ISAFA plus Macalester Financial Declaration); no aid can be awarded after admission.",
    costYear: "2026-2027",
    tuition: {
      value: 70632,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    fees: {
      value: 230,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    roomBoard: {
      value: 16476,
      source:
        "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
    costNote: "CDS G1 is reported for 2026-2027; tuition includes required course materials.",
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
      "English tests are optional and there are no minimums; these are the scores of the 'most successful' submitters (TOEFL 100 for tests before Jan 2026, 5.0 on the new TOEFL scale after). Recommended for non-native speakers with under two years of English-medium schooling; InitialView/Vericant also accepted.",
    nationalCurriculum: {
      value:
        "Transcripts should cover years 9-12/13 with available external exam results; applicants who have not sat final exams send predicted results. O Levels alone are not enough; A Level (and similar exam-based systems) applicants send O, AS and A Level results or predictions.",
      source: "https://www.macalester.edu/admissions/international/faq/",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.macalester.edu/admissions/international/first-year/",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://www.macalester.edu/admissions/international/first-year/",
    },
    ea: {
      value: "2026-11-01",
      source: "https://www.macalester.edu/admissions/international/first-year/",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.macalester.edu/admissions/international/first-year/",
    },
    deadlineNote:
      "Early Action is non-restrictive (CDS C22). Page lists month/day only; years inferred from the current (2027-28 aid form) cycle.",
    highlight:
      "Macalester has flown the United Nations flag on campus every day since 1950, a symbol of its internationalism.",
    image: {
      src: "/media/colleges/macalester-college.webp",
      card: "/media/colleges/macalester-college-card.webp",
      title: "Macalester Weyerhauser Hall 2007.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Macalester_Weyerhauser_Hall_2007.JPG",
      author: "SEWilco",
      licence: "CC BY-SA 3.0",
      licenceUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
    },
    urls: {
      admissions: "https://www.macalester.edu/admissions/",
      international: "https://www.macalester.edu/admissions/international/first-year/",
      aid: "https://www.macalester.edu/admissions/international/understanding-your-financial-aid-package/",
      cds: "https://www.macalester.edu/institutional-research/wp-content/uploads/sites/515/CDS_2025-2026_Macalester-College_completed-1.pdf",
    },
  },
  {
    slug: "bucknell-university",
    name: "Bucknell University",
    type: "LAC",
    city: "Lewisburg",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#29 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 11561,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    admitted: {
      value: 3723,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    edApplicants: {
      value: 1200,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    edAdmitted: {
      value: 656,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
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
      "ED I and ED II only; no Early Action (CDS C22: No). ED counts in C21 combine both ED rounds.",
    sat: {
      value: "1170-1360",
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    act: {
      value: "25-32",
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.bucknell.edu/admissions-aid/admissions-dates-deadlines",
    },
    testNote:
      "CDS C8 (for Fall 2027): SAT/ACT not required but considered if submitted. Deadlines page describes a test-optional pilot: enrolling students who took the SAT/ACT must later send verified scores (research use only, does not change the decision). 68% of enrolled first-years submitted SAT, 18% ACT.",
    needBasedForIntl: {
      value: true,
      source:
        "https://www.bucknell.edu/admissions-aid/tuition-fees-financial-aid/apply-financial-aid/financial-aid-international-students",
    },
    intlAidPolicy: {
      value: "need-aware",
      source:
        "https://www.bucknell.edu/admissions-aid/tuition-fees-financial-aid/apply-financial-aid/financial-aid-international-students",
    },
    policyQuote:
      'Please be aware that competition is higher for applicants with higher financial need. Bucknell is currently not "need-blind" for international students.',
    intlAided: {
      value: 130,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    intlAvgAward: {
      value: 71387,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    intlNote:
      "International aid is described as limited and competitive. Aid applicants submit the free ISAFA (CSS Profile accepted, no CSS fee waivers) plus a certified bank statement or Financial Certification Document, due Nov 1 (ED I) or Jan 10 (ED II/RD). Bucknell's general aid page says it is not able to meet full financial need.",
    costYear: "2026-2027",
    tuition: {
      value: 72600,
      source:
        "https://www.bucknell.edu/admissions-aid/tuition-fees-financial-aid/apply-financial-aid/financial-aid-international-students",
    },
    fees: {
      value: 900,
      source:
        "https://www.bucknell.edu/admissions-aid/tuition-fees-financial-aid/apply-financial-aid/financial-aid-international-students",
    },
    roomBoard: {
      value: 18380,
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    costNote:
      "International aid page 2026-27 budget: tuition $72,600, student fee $900, housing $11,400 + food $6,980 (= CDS G1 food and housing $18,380).",
    ielts: {
      value: 7,
      source:
        "https://www.bucknell.edu/admissions-aid/apply-bucknell/undergraduate-admission-requirements/admission-requirements-international-students",
    },
    toefl: {
      value: 100,
      source:
        "https://www.bucknell.edu/admissions-aid/apply-bucknell/undergraduate-admission-requirements/admission-requirements-international-students",
    },
    duolingo: {
      value: 130,
      source:
        "https://www.bucknell.edu/admissions-aid/apply-bucknell/undergraduate-admission-requirements/admission-requirements-international-students",
    },
    englishNote:
      "Minimums: TOEFL 5 on the new scale (100 if taken before Jan 21, 2026), IELTS 7, PTE 68, DET 130. Required if English is not the first language or schooling was not in English for at least three years; waiver possible on written request from the school.",
    nationalCurriculum: {
      value:
        "Official secondary school transcripts, certificates and academic results (with certified English translations) must come from the school or testing agency; grades for the three most recently completed years plus final-year courses are required for review.",
      source:
        "https://www.bucknell.edu/admissions-aid/apply-bucknell/undergraduate-admission-requirements/admission-requirements-international-students",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.bucknell.edu/admissions-aid/admissions-dates-deadlines",
    },
    ed2: {
      value: "2027-01-10",
      source: "https://www.bucknell.edu/admissions-aid/admissions-dates-deadlines",
    },
    ea: {
      value: "not-offered",
      source:
        "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
    rd: {
      value: "2027-01-10",
      source: "https://www.bucknell.edu/admissions-aid/admissions-dates-deadlines",
    },
    deadlineNote: null,
    highlight:
      "A liberal arts university that also houses its own College of Engineering and Freeman College of Management.",
    image: {
      src: "/media/colleges/bucknell-university.webp",
      card: "/media/colleges/bucknell-university-card.webp",
      title: "Cherry blossoms on academic quad.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Cherry_blossoms_on_academic_quad.jpg",
      author: "Dbl228",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.bucknell.edu/admissions-aid",
      international:
        "https://www.bucknell.edu/admissions-aid/apply-bucknell/undergraduate-admission-requirements/admission-requirements-international-students",
      aid: "https://www.bucknell.edu/admissions-aid/tuition-fees-financial-aid/apply-financial-aid/financial-aid-international-students",
      cds: "https://www.bucknell.edu/sites/default/files/institutional-research/common_data_set_2025-26.pdf",
    },
  },
  {
    slug: "lafayette-college",
    name: "Lafayette College",
    type: "LAC",
    city: "Easton",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#30 National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 10556,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    admitted: {
      value: 3289,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    edApplicants: {
      value: 937,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    edAdmitted: {
      value: 356,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II only; no Early Action (CDS C22: No). ED counts combine both rounds.",
    sat: {
      value: "1360-1490",
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    act: {
      value: "30.5-33",
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    testNote:
      "SAT/ACT optional for fall 2027 and fall 2028 entry; self-reported scores accepted, official scores required on enrolment. CDS reports ACT 25th percentile as 30.5. 27% of enrolled first-years submitted SAT, 9% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    policyQuote:
      "Lafayette is proud to be one of only a select few colleges in the United States to guarantee to meet full demonstrated financial need of all admitted students, both domestic and international. ... Lafayette College is need aware and considers a student’s financial situation when making admission decisions.",
    intlAided: {
      value: 111,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    intlAvgAward: {
      value: 64791,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    intlNote:
      "International aid applicants submit the CSS Profile (an alternative International Financial Aid Form if the family contribution is under $20,000/yr and the CSS fee is a hardship; ISFAA not accepted). FAQ: aid is awarded on an extremely competitive basis; internationals who do not qualify for aid in their first year cannot receive it later.",
    costYear: "2026-2027",
    tuition: {
      value: 70486,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    fees: {
      value: 1110,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    roomBoard: {
      value: 20896,
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    costNote:
      "CDS G1 first-year column for 2026-27; required fees are $1,110 for first-years vs $360 for other undergraduates.",
    ielts: {
      value: 7,
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    toefl: {
      value: 100,
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    duolingo: {
      value: 130,
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    englishNote:
      "English test required; Lafayette 'typically looks for' minimums of TOEFL 100 (new TOEFL 5), IELTS 7, Duolingo 130. Waiver form if English is the first language or instruction has been in English for the past 3 years.",
    nationalCurriculum: {
      value:
        "Official transcript and school report must come directly from the school, with mid-year grades. The international page says national examination programs (e.g. GCE A-level) are considered individually for college credit on receipt of certified results; nothing specific on national-curriculum admission requirements.",
      source: "https://admissions.lafayette.edu/apply/international-students/",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://admissions.lafayette.edu/deadlines-and-forms/",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://admissions.lafayette.edu/deadlines-and-forms/",
    },
    ea: {
      value: "not-offered",
      source: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
    rd: {
      value: "2027-01-15",
      source: "https://admissions.lafayette.edu/deadlines-and-forms/",
    },
    deadlineNote:
      "Regular Decision applicants who applied by Jan 15 may convert to ED II until Feb 1. Pages give month/day only.",
    highlight:
      "Chartered in 1826 and named for the Marquis de Lafayette, it pairs a liberal arts college with a nationally recognised engineering program.",
    image: {
      src: "/media/colleges/lafayette-college.webp",
      card: "/media/colleges/lafayette-college-card.webp",
      title: "Lafayette College Easton PA 10 Scott Hall.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Lafayette_College_Easton_PA_10_Scott_Hall.jpg",
      author: "Tomwsulcer",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://admissions.lafayette.edu/",
      international: "https://admissions.lafayette.edu/apply/international-students/",
      aid: "https://admissions.lafayette.edu/apply/international-students/international-student-faq/",
      cds: "https://oir.lafayette.edu/wp-content/uploads/sites/196/2026/01/CDS2025-2026.pdf",
    },
  },
  {
    slug: "bryn-mawr-college",
    name: "Bryn Mawr College",
    type: "LAC",
    city: "Bryn Mawr",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#31 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 4260,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    admitted: {
      value: 1199,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    edApplicants: {
      value: 470,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    edAdmitted: {
      value: 194,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
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
      "ED I and ED II only; no Early Action (CDS C22: No). CDS C21 ED counts are labelled 'For the Fall 2024 entering class' on the 2025-26 form.",
    sat: {
      value: "1300-1470",
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    act: {
      value: "29-33",
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.brynmawr.edu/admissions-aid/policies-resources/admissions-policies",
    },
    testNote:
      "Test-optional; highest section scores considered (superscore); self-reported scores accepted. Policy page also says scores sent after admission are used only for advising/placement. 65% of enrolled first-years submitted SAT, 23% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.brynmawr.edu/admissions-aid/tuition-financial-aid",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://www.brynmawr.edu/admissions-aid/tuition-financial-aid",
    },
    policyQuote:
      "Bryn Mawr is need-aware, which means the amount of aid a student requests of the College may affect the admission decision. ... The College meets 100% of calculated financial need for admitted undergraduate students.",
    intlAided: {
      value: 110,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    intlAvgAward: {
      value: 80407,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    intlNote:
      "The aid page's need-aware statement is general (all applicants); the international-applicant section of the How to Apply page calls Bryn Mawr 'a need-sensitive institution' that meets full calculated need with limited funds. Internationals apply for aid only once, at admission; family contribution stays fixed for four years. CDS H6 ticks both need-based and non-need-based aid for nonresidents.",
    costYear: "2026-2027",
    tuition: {
      value: 71290,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    fees: {
      value: 1120,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    roomBoard: {
      value: 21440,
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    costNote: "CDS G1 undergraduate column (first-year column left blank).",
    ielts: {
      value: 7,
      source: "https://www.brynmawr.edu/admissions-aid/policies-resources/admissions-policies",
    },
    toefl: {
      value: 100,
      source: "https://www.brynmawr.edu/admissions-aid/policies-resources/admissions-policies",
    },
    duolingo: {
      value: 130,
      source: "https://www.brynmawr.edu/admissions-aid/policies-resources/admissions-policies",
    },
    englishNote:
      "Minimums: TOEFL 5 on the new scale (100 legacy), IELTS 7, Duolingo 130. Waiver possible after full English-medium instruction for grades 9-12, but proof is strongly recommended for all internationals; preference to Duolingo or InitialView recorded interviews.",
    nationalCurriculum: {
      value:
        "Requires copies of all external exam results that are part of the school or national curriculum (official IGCSE results, school-leaving certificates for IB, A-Level or another national curriculum); applicants not yet graduated give intended exam dates. Mid-year report may be predicted grades for some curricula.",
      source: "https://brynmawr.edu/admissions/undergraduate-admissions/apply",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://brynmawr.edu/admissions/undergraduate-admissions/apply",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://brynmawr.edu/admissions/undergraduate-admissions/apply",
    },
    ea: {
      value: "not-offered",
      source:
        "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
    rd: {
      value: "2027-01-15",
      source: "https://brynmawr.edu/admissions/undergraduate-admissions/apply",
    },
    deadlineNote:
      "Page lists month/day for the 2026-2027 application cycle (essay prompt labelled 2026-2027).",
    highlight:
      "A women's college founded in 1885 whose campus pioneered the American Collegiate Gothic style of architecture.",
    image: {
      src: "/media/colleges/bryn-mawr-college.webp",
      card: "/media/colleges/bryn-mawr-college-card.webp",
      title: "Bryn Mawr College Rock Dorm.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Bryn_Mawr_College_Rock_Dorm.jpg",
      author: "Montgomery County Planning Commission",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    urls: {
      admissions: "https://www.brynmawr.edu/admissions-aid",
      international: "https://brynmawr.edu/admissions/undergraduate-admissions/apply",
      aid: "https://www.brynmawr.edu/admissions-aid/tuition-financial-aid",
      cds: "https://www.brynmawr.edu/sites/default/files/media/documents/2026-04/CDS%202025-26%20Bryn%20Mawr%20Read%20Only.pdf",
    },
  },
  {
    slug: "denison-university",
    name: "Denison University",
    type: "LAC",
    city: "Granville",
    state: "Ohio",
    code: "OH",
    rank: {
      label: "#31 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 12202,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    admitted: {
      value: 2385,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    edApplicants: {
      value: 1589,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    edAdmitted: {
      value: 394,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
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
      "ED 1 and ED 2 only; no Early Action (CDS C22: No). ED counts (Fall 2025 class) combine both rounds.",
    sat: {
      value: "1270-1420",
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    act: {
      value: "28-33",
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://denison.edu/campus/admission/international-applicants",
    },
    testNote:
      "Test-optional since 2008; submitted scores are superscored and may be self-reported. 26.6% of enrolled first-years submitted SAT, 18.6% ACT. No application fee and no supplemental essay.",
    needBasedForIntl: {
      value: true,
      source: "https://denison.edu/campus/admission/international-applicant-financial-aid",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://denison.edu/campus/admission/international-applicant-financial-aid",
    },
    policyQuote:
      "Denison is need-aware in the application process as this allows us to meet 100% of demonstrated need for all admitted students.",
    intlAided: {
      value: 358,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    intlAvgAward: {
      value: 55613,
      source:
        "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
    intlNote:
      "Quote answers the page's question 'Is Denison need-aware for international students?'. Internationals get the same need-based aid and merit scholarships ($5,000/yr to full tuition, automatic) as domestic students. Aid uses the free Denison Certification of Finances (CSS Profile not accepted); need-based aid can only be requested at admission. The income-based Denison Commitment is for US citizens/permanent residents only.",
    costYear: "2026-2027",
    tuition: {
      value: 74000,
      source: "https://denison.edu/campus/finances/tuition-fees",
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: 18400,
      source: "https://denison.edu/campus/finances/tuition-fees",
    },
    costNote:
      "Cost page itemises 2026-27 charges of $92,400 as tuition $74,000 + housing & food $18,400 (same in CDS G1); no separate required fee is listed and the CDS fee row is blank.",
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
      "English proficiency demonstration is required; the international page lists TOEFL iBT, IELTS, Duolingo, SAT Reading, ACT English, English-medium schooling or an interview as considerations, with waivers case by case, but gives no score minimums. The course catalog (which may list scores) could not be loaded (catalog.denison.edu unreachable).",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://denison.edu/campus/admission/international-applicants",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://denison.edu/campus/admission/international-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://denison.edu/campus/admission/international-applicants",
    },
    rd: {
      value: "2027-01-15",
      source: "https://denison.edu/campus/admission/international-applicants",
    },
    deadlineNote:
      "Page states first-year rounds are early decision and regular decision only; month/day given, years inferred. Financial aid (Certification of Finances) deadlines match.",
    highlight:
      "Founded in 1831, it keeps a 350-acre Biological Reserve of forest, orchards, fields and ponds used for research.",
    image: {
      src: "/media/colleges/denison-university.webp",
      card: "/media/colleges/denison-university-card.webp",
      title: "AcademicQuadDenisonUniversity.JPG",
      page: "https://commons.wikimedia.org/wiki/File:AcademicQuadDenisonUniversity.JPG",
      author: "Pbass1956",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    urls: {
      admissions: "https://denison.edu/campus/admission",
      international: "https://denison.edu/campus/admission/international-applicants",
      aid: "https://denison.edu/campus/admission/international-applicant-financial-aid",
      cds: "https://denison.edu/sites/default/files/forms/2026-08/cds_du_20252026_published_updated2026.08.14.pdf",
    },
  },
  {
    slug: "trinity-college",
    name: "Trinity College",
    type: "LAC",
    city: "Hartford",
    state: "Connecticut",
    code: "CT",
    rank: {
      label: "#31 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 7273,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    admitted: {
      value: 2148,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    edApplicants: {
      value: 643,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    edAdmitted: {
      value: 261,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II offered; no Early Action (CDS C22: No).",
    sat: {
      value: "1350-1460",
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    act: {
      value: "30.5-32.5",
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    testNote:
      "Test-optional; SAT or ACT not required. Only 9% of enrolled Fall 2025 first-years submitted SAT, 4% ACT (CDS C9).",
    needBasedForIntl: {
      value: true,
      source: "https://www.trincoll.edu/admissions/finaid/international-students/",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: "If you are admitted to Trinity, we will meet your full, demonstrated need.",
    intlAided: {
      value: 295,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    intlAvgAward: {
      value: 70437,
      source:
        "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
    intlNote:
      "International aid page says it meets full demonstrated need of admitted students but does not state need-blind or need-aware. International aid applicants file the CSS Profile; non-aid applicants file a Statement of Finances Form.",
    costYear: "2026-2027",
    tuition: {
      value: 72820,
      source: "https://www.trincoll.edu/student-accounts/tuition-and-fees/",
    },
    fees: {
      value: 3330,
      source: "https://www.trincoll.edu/student-accounts/tuition-and-fees/",
    },
    roomBoard: {
      value: 20330,
      source: "https://www.trincoll.edu/student-accounts/tuition-and-fees/",
    },
    costNote:
      "2026-27 billing page: General Fee $2,900 + Student Activity Fee $430 = fees; Standard Room $13,150 + first-year meal plan $7,180 = room and board. Same figures appear in CDS 2025-2026 G1.",
    ielts: {
      value: "none",
      source:
        "https://www.trincoll.edu/admissions/international-admissions/english-proficiency-exams/",
    },
    toefl: {
      value: "none",
      source:
        "https://www.trincoll.edu/admissions/international-admissions/english-proficiency-exams/",
    },
    duolingo: {
      value: "none",
      source:
        "https://www.trincoll.edu/admissions/international-admissions/english-proficiency-exams/",
    },
    englishNote:
      "Page says Trinity has no minimum score cutoffs. Recommended scores: Duolingo 130+, IELTS 7.0 (bands 6.5)+, TOEFL iBT listed as 5.5 (subsections 5.5)+ (new TOEFL band scale). An English test or a waiver is required.",
    nationalCurriculum: {
      value:
        "Requires high school transcripts (grades 9-12); any non-English documents need certified translations. Nothing specific on national exam results published.",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    ea: {
      value: "not-offered",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
    },
    deadlineNote:
      "Page lists '2026-27 Deadlines': ED I Nov 15, ED II Jan 15, RD Jan 15. RD applicants may convert to ED II by Feb 1.",
    highlight:
      "Its brownstone Long Walk and Chapel were listed in 2024 on the National Register of Historic Places as a historic district.",
    image: {
      src: "/media/colleges/trinity-college.webp",
      card: "/media/colleges/trinity-college-card.webp",
      title: "TrinCollHartfordChap.jpg",
      page: "https://commons.wikimedia.org/wiki/File:TrinCollHartfordChap.jpg",
      author: "ragesoss - user on Flickr.com",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    urls: {
      admissions:
        "https://www.trincoll.edu/admissions/undergraduate-admissions/application-process/",
      international: "https://www.trincoll.edu/admissions/international-admissions/",
      aid: "https://www.trincoll.edu/admissions/finaid/international-students/",
      cds: "https://www.trincoll.edu/asic/wp-content/uploads/sites/125/2026/06/CDS-2025-2026-Trinity-College.pdf",
    },
  },
  {
    slug: "colorado-college",
    name: "Colorado College",
    type: "LAC",
    city: "Colorado Springs",
    state: "Colorado",
    code: "CO",
    rank: {
      label: "#34 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 8822,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    admitted: {
      value: 1949,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
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
      "Offers ED I, ED II and Early Action, but the 2025-26 CDS leaves the C21/C22 counts blank.",
    sat: {
      value: "1240-1430",
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    act: {
      value: "28-34",
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    testNote:
      "Test-optional; scores are used only if they strengthen the application. CDS: 28% submitted SAT, 12% ACT.",
    needBasedForIntl: {
      value: true,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "International applicants seeking financial aid comprise our most competitive group of applicants each year. We are only able to fully fund a handful of students out of thousands of applicants.",
    intlAided: {
      value: 73,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    intlAvgAward: {
      value: 52713,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    intlNote:
      "The international page does not say need-blind or need-aware. Aid must be requested when applying; CSS Profile or the college's ISFAA form.",
    costYear: "2026-2027",
    tuition: {
      value: 75702,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    fees: {
      value: 528,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    roomBoard: {
      value: 17360,
      source: "https://www.coloradocollege.edu/offices/ipe/documents/CDS-2025-2026_PDF_Final.pdf",
    },
    costNote: "CDS G1 for 2026-27: housing $9,616 + food $7,744.",
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
      "English proficiency evidence is required for non-native speakers, but no minimum is set. Students at or above TOEFL 5.0 (100 on the previous scale), IELTS 7.0 or Duolingo 130 are described as best prepared.",
    nationalCurriculum: {
      value:
        "Transcripts through the second-to-last year of secondary school are needed when applying, then midyear and final grades. Transcripts not in English must be translated by a certified translator.",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    ea: {
      value: "2026-11-01",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.coloradocollege.edu/admission/apply/international-students.html",
    },
    deadlineNote:
      "The page gives November 1 and January 15 without a year; mapped to the 2026-27 cycle. The last round is called Regular Action.",
    highlight:
      "Runs on the Block Plan: students take one course at a time, each lasting three and a half weeks.",
    image: {
      src: "/media/colleges/colorado-college.webp",
      card: "/media/colleges/colorado-college-card.webp",
      title:
        "The Colorado College campus from on top of Shove Chapel, facing towards Pikes Peak..jpg",
      page: "https://commons.wikimedia.org/wiki/File:The_Colorado_College_campus_from_on_top_of_Shove_Chapel,_facing_towards_Pikes_Peak..jpg",
      author: "Mark Lee",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    urls: {
      admissions: "https://www.coloradocollege.edu/admission/apply/first-year-students.html",
      international: "https://www.coloradocollege.edu/admission/apply/international-students.html",
      aid: "https://www.coloradocollege.edu/admission/cost-and-aid/",
      cds: "https://www.coloradocollege.edu/offices/ipe/common-data-set.html",
    },
  },
  {
    slug: "franklin-and-marshall-college",
    name: "Franklin & Marshall College",
    type: "LAC",
    city: "Lancaster",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#34 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 9634,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    admitted: {
      value: 3047,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    edApplicants: {
      value: 860,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    edAdmitted: {
      value: 254,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (C21 counts combined); CDS C22 says no Early Action.",
    sat: {
      value: "1310-1470",
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    act: {
      value: "29-32",
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.fandm.edu/apply/international-student-admission/",
    },
    testNote:
      "Test-optional for more than 30 years with a 'no harm' approach: scores count only if they help. Superscored.",
    needBasedForIntl: {
      value: true,
      source: "https://www.fandm.edu/apply/international-student-admission/",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "Reflecting our commitment to a diverse student body, we are proud to offer need-based financial aid to international students. This means that if you are admitted to F&M, we will meet 100% of your institutionally determined financial need for all four years on campus.",
    intlAided: {
      value: 276,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    intlAvgAward: {
      value: 56601,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    intlNote:
      "The page adds that international aid is limited and encourages applying early. It does not say need-blind or need-aware.",
    costYear: "2025-2026",
    tuition: {
      value: 72950,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    fees: {
      value: 470,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    roomBoard: {
      value: 16710,
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    costNote: "CDS G1 2025-26 first-year figures (housing $9,800 + food $6,910).",
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
      "An English test (TOEFL, IELTS, Duolingo or PTE Academic) is required for non-native speakers; no minimum score is published. Waived after 3+ years at an English-medium school.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-15",
      source: "https://www.fandm.edu/apply/international-student-admission/",
    },
    ed2: {
      value: "2027-01-15",
      source: "https://www.fandm.edu/apply/international-student-admission/",
    },
    ea: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1CpyIXEDF-2bMSlt8qXimtThANg0xsUlw/view",
    },
    rd: {
      value: "2027-01-15",
      source: "https://www.fandm.edu/apply/international-student-admission/",
    },
    deadlineNote:
      "The page gives November 15 and January 15 without a year; mapped to the 2026-27 cycle.",
    highlight:
      "Has been test-optional for more than 30 years and looks at scores only when they help an applicant.",
    image: {
      src: "/media/colleges/franklin-and-marshall-college.webp",
      card: "/media/colleges/franklin-and-marshall-college-card.webp",
      title: "Diagnothian Hall FnM La PA.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Diagnothian_Hall_FnM_La_PA.jpg",
      author: "Smallbones",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.fandm.edu/apply/international-student-admission/",
      international: "https://www.fandm.edu/apply/international-student-admission/",
      aid: "https://www.fandm.edu/financial-aid/",
      cds: "https://www.fandm.edu/institutional-research/",
    },
  },
  {
    slug: "mount-holyoke-college",
    name: "Mount Holyoke College",
    type: "LAC",
    city: "South Hadley",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#34 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 4619,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    admitted: {
      value: 1774,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    edApplicants: {
      value: 411,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    edAdmitted: {
      value: 208,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (C21 counts combined); CDS C22 says no Early Action.",
    sat: {
      value: "1365-1485",
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    act: {
      value: "30-32",
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    testPolicy: {
      value: "optional",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission",
    },
    testNote: "SAT/ACT optional; scores reported on the Common App are considered.",
    needBasedForIntl: {
      value: true,
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/international-admission-faq",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "Need-based financial assistance is awarded to admitted international applicants (non-US citizens) based on their financial eligibility as determined through review of the CSS Profile. Applicants must apply for financial aid at the same time they apply for admission.",
    intlAided: {
      value: 257,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    intlAvgAward: {
      value: 53460,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    intlNote:
      "The FAQ says Mount Holyoke promises to meet demonstrated need for each admitted student, but no page says need-blind or need-aware for international applicants. All applicants are also considered for merit scholarships. The CDS H6 policy boxes could not be read.",
    costYear: "2026-2027",
    tuition: {
      value: 71178,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    fees: {
      value: 272,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    roomBoard: {
      value: 21596,
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    costNote: "CDS G1 for 2026-27 (housing $10,836 + food $10,760).",
    ielts: {
      value: "none",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/english-proficiency-requirements",
    },
    toefl: {
      value: "none",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/english-proficiency-requirements",
    },
    duolingo: {
      value: "none",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/english-proficiency-requirements",
    },
    englishNote:
      "No minimum score (except Cambridge, 185). Average scores: IELTS over 7.0, TOEFL iBT 100 (5.5 on the new scale), Duolingo over 130. Scores entered in the Common App don't count; upload the score report to the portal.",
    nationalCurriculum: {
      value:
        "Students in a national curriculum must submit their national/external exam results by the round deadline, along with transcripts showing day-to-day secondary school performance and predicted grades. Documents not in English need professional translation.",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/international-admission-faq",
    },
    ed1: {
      value: "2026-11-15",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/international-admission-faq",
    },
    ed2: {
      value: "2027-01-05",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/international-admission-faq",
    },
    ea: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1YBj1g21DRKEMSV0WHaiIT6paJg1qruX9/view",
    },
    rd: {
      value: "2027-01-15",
      source:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission/international-admission-faq",
    },
    deadlineNote:
      "The FAQ table gives November 15, January 5 and January 15 without a year; mapped to the 2026-27 cycle. English test results may arrive until November 26 for ED I.",
    highlight:
      "International students make up more than 20% of the student body, from over 70 countries.",
    image: {
      src: "/media/colleges/mount-holyoke-college.webp",
      card: "/media/colleges/mount-holyoke-college-card.webp",
      title: "Mount Holyoke College Upper Dam, South Hadley MA.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Mount_Holyoke_College_Upper_Dam,_South_Hadley_MA.jpg",
      author: "John Phelan",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    urls: {
      admissions:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process",
      international:
        "https://www.mtholyoke.edu/admission/apply-undergraduate-first-year/application-process/international-admission",
      aid: "https://www.mtholyoke.edu/admission/financial-aid",
      cds: "https://www.mtholyoke.edu/directory/departments-offices-centers/institutional-planning-and-research/common-data-set",
    },
  },
  {
    slug: "spelman-college",
    name: "Spelman College",
    type: "LAC",
    city: "Atlanta",
    state: "Georgia",
    code: "GA",
    rank: {
      label: "#34 (tie) National Liberal Arts Colleges",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 11533,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    admitted: {
      value: 2743,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    edApplicants: {
      value: 437,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    edAdmitted: {
      value: 70,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    eaApplicants: {
      value: 5282,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    eaAdmitted: {
      value: 1599,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    earlyNote: "Offers binding Early Decision and non-binding Early Action.",
    sat: {
      value: "1100-1300",
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    act: {
      value: "22-28",
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://www.spelman.edu/admissions/applying-to-spelman/international-students.html",
    },
    testNote: "SAT/ACT scores are optional.",
    needBasedForIntl: {
      value: false,
      source: "https://www.spelman.edu/admissions/applying-to-spelman/international-students.html",
    },
    intlAidPolicy: {
      value: "merit-only",
      source: "https://www.spelman.edu/admissions/applying-to-spelman/international-students.html",
    },
    policyQuote:
      "The only form of aid available to our international students is our merit-based scholarships. Spelman College does not offer any financial aid to international students.",
    intlAided: {
      value: 10,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    intlAvgAward: {
      value: 48041,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    intlNote:
      "A limited number of merit scholarships go to incoming first-year students. CDS H6 figures are as reported (10 students; the reported total is $432,372).",
    costYear: null,
    tuition: {
      value: 29025,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    fees: {
      value: 3445,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    roomBoard: {
      value: 18924,
      source:
        "https://www.spelman.edu/_1_Docs-and-Files/about/institutional-research/common-data-set/cds_2025-2026_spelman_college_1.26.2026.pdf",
    },
    costNote: "CDS 2025-26 G1 (the form does not state the year). Housing $11,306 + food $7,618.",
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
      "An official TOEFL score of 4 or higher (new 1-6 scale) is required for students from non-English-speaking countries. IELTS and Duolingo are not mentioned.",
    nationalCurriculum: {
      value:
        "Official secondary school transcripts are required; documents not in English need an official translation.",
      source: "https://www.spelman.edu/admissions/applying-to-spelman/international-students.html",
    },
    ed1: {
      value: "2026-11-01",
      source:
        "https://www.spelman.edu/admissions/applying-to-spelman/first-time-student-applicant.html",
    },
    ed2: {
      value: "not-offered",
      source:
        "https://www.spelman.edu/admissions/applying-to-spelman/first-time-student-applicant.html",
    },
    ea: {
      value: "2026-11-01",
      source:
        "https://www.spelman.edu/admissions/applying-to-spelman/first-time-student-applicant.html",
    },
    rd: {
      value: "2027-02-01",
      source:
        "https://www.spelman.edu/admissions/applying-to-spelman/first-time-student-applicant.html",
    },
    deadlineNote:
      "The page gives Nov. 1 and February 1 without a year (it is accepting applications for Fall 2027).",
    highlight: "A college for women in Atlanta that welcomes students from all over the world.",
    image: null,
    urls: {
      admissions:
        "https://www.spelman.edu/admissions/applying-to-spelman/first-time-student-applicant.html",
      international:
        "https://www.spelman.edu/admissions/applying-to-spelman/international-students.html",
      aid: "https://www.spelman.edu/financial-aid/apply-for-financial-aid/index.html",
      cds: "https://www.spelman.edu/about/institutional-research/common-data-set/index.html",
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
    image: {
      src: "/media/colleges/massachusetts-institute-of-technology.webp",
      card: "/media/colleges/massachusetts-institute-of-technology-card.webp",
      title: "2017 Maclaurin Buildings (MIT Building 10) and Great Dome.jpg",
      page: "https://commons.wikimedia.org/wiki/File:2017_Maclaurin_Buildings_(MIT_Building_10)_and_Great_Dome.jpg",
      author: "Beyond My Ken",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
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
    image: {
      src: "/media/colleges/princeton-university.webp",
      card: "/media/colleges/princeton-university-card.webp",
      title: "Nassau Hall Princeton.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Nassau_Hall_Princeton.JPG",
      author: "Smallbones",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines",
      international: "https://admission.princeton.edu/apply/international-students",
      aid: "https://admission.princeton.edu/apply/international-students",
      cds: "https://ir.princeton.edu/other-university-data/common-data-set",
    },
  },
  {
    slug: "harvard-university",
    name: "Harvard University",
    type: "NU",
    city: "Cambridge",
    state: "Massachusetts",
    code: "MA",
    rank: {
      label: "#3 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 47893,
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    admitted: {
      value: 2003,
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
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
      "No Early Decision (CDS C21 = No). Restrictive Early Action offered (C22: closing 11/1, notification 12/16); CDS does not report EA applicant/admit counts.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: "33-35",
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    testPolicy: {
      value: "required",
      source: "https://college.harvard.edu/admissions/apply/first-year-applicants",
    },
    testNote:
      "SAT or ACT required; in exceptional cases AP, IB, GCSE/A-level or national leaving exam results/predictions may substitute. CDS C9 gives no SAT composite: EBRW 720-770, Math 730-790 (25th-75th).",
    needBasedForIntl: {
      value: true,
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://college.harvard.edu/admissions/apply/international-applicants",
    },
    policyQuote:
      "Our financial aid policies are the same for all applicants, regardless of nationality or citizenship. All aid is based on financial need, and admissions decisions are made without regard to whether an applicant has applied for financial assistance. Harvard meets each student’s demonstrated need.",
    intlAided: {
      value: 805,
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    intlAvgAward: {
      value: 83013,
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    intlNote: null,
    costYear: "2026-2027",
    tuition: {
      value: 62226,
      source: "https://college.harvard.edu/financial-aid/how-aid-works",
    },
    fees: {
      value: 6216,
      source: "https://college.harvard.edu/financial-aid/how-aid-works",
    },
    roomBoard: {
      value: 23192,
      source: "https://college.harvard.edu/financial-aid/how-aid-works",
    },
    costNote:
      "CDS G1 left blank; figures from Harvard's 2026-2027 cost of attendance (housing 14,250 + food 8,942). Health insurance (4,954) extra unless waived.",
    ielts: {
      value: "none",
      source: "https://college.harvard.edu/admissions/apply/international-applicants",
    },
    toefl: {
      value: "none",
      source: "https://college.harvard.edu/admissions/apply/international-applicants",
    },
    duolingo: {
      value: "none",
      source: "https://college.harvard.edu/admissions/apply/international-applicants",
    },
    englishNote:
      "First-year applicants are not required to take an English proficiency exam; scores may be submitted optionally.",
    nationalCurriculum: {
      value:
        "Same requirements for all applicants; national leaving exam results or predictions may be submitted (and can meet the testing requirement in exceptional cases when SAT/ACT is inaccessible).",
      source: "https://college.harvard.edu/admissions/apply/international-applicants",
    },
    ed1: {
      value: "not-offered",
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    ed2: {
      value: "not-offered",
      source: "https://oira.harvard.edu/files/2026/07/CDS_2025-2026.pdf",
    },
    ea: {
      value: "2026-11-01",
      source: "https://college.harvard.edu/admissions/apply/first-year-applicants",
    },
    rd: {
      value: "2027-01-01",
      source: "https://college.harvard.edu/admissions/apply/first-year-applicants",
    },
    deadlineNote:
      "EA is Restrictive Early Action (REA). Page lists November 1 and January 1 (years not printed).",
    highlight:
      "Founded on October 28, 1636, Harvard was the first college in the American colonies.",
    image: {
      src: "/media/colleges/harvard-university.webp",
      card: "/media/colleges/harvard-university-card.webp",
      title: "Widener Library, Harvard University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Widener_Library,_Harvard_University.jpg",
      author: "Kenneth C. Zirkel",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    urls: {
      admissions: "https://college.harvard.edu/admissions/apply/first-year-applicants",
      international: "https://college.harvard.edu/admissions/apply/international-applicants",
      aid: "https://college.harvard.edu/financial-aid/how-aid-works",
      cds: "https://oira.harvard.edu/common-data-set/",
    },
  },
  {
    slug: "yale-university",
    name: "Yale University",
    type: "NU",
    city: "New Haven",
    state: "Connecticut",
    code: "CT",
    rank: {
      label: "#4 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 50264,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    admitted: {
      value: 2387,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
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
      "No Early Decision (CDS C21 = No). Restrictive (single-choice) Early Action offered (C22: closing 11/1, notification 12/15); CDS does not report EA applicant/admit counts.",
    sat: {
      value: "1480-1560",
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    act: {
      value: "33-35",
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    testPolicy: {
      value: "required",
      source: "https://admissions.yale.edu/standardized-testing",
    },
    testNote:
      "First-year applicants must submit SAT or ACT; international leaving exams and English proficiency exams do not fulfill the requirement.",
    needBasedForIntl: {
      value: true,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://admissions.yale.edu/international",
    },
    policyQuote:
      "Yale is one of only a handful of American universities that considers all applicants for admission without regard to their ability to pay and meets 100% of every family’s demonstrated financial need.",
    intlAided: {
      value: 459,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    intlAvgAward: {
      value: 84185,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    intlNote:
      "International aid offers include allowances for housing, meals and two round trips a year.",
    costYear: "2026-2027",
    tuition: {
      value: 72500,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    fees: {
      value: null,
      source: null,
    },
    roomBoard: {
      value: 21600,
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    costNote: "CDS 2025-26 G1 reports 2026-2027 costs; required fees left blank in G1.",
    ielts: {
      value: 7,
      source: "https://admissions.yale.edu/standardized-testing",
    },
    toefl: {
      value: 100,
      source: "https://admissions.yale.edu/standardized-testing",
    },
    duolingo: {
      value: 120,
      source: "https://admissions.yale.edu/standardized-testing",
    },
    englishNote:
      "Not minimums: scores typical of Yale's most competitive applicants (TOEFL 100+, or 5+ on new scale after Jan 21 2026; IELTS 7+; DET 120+; Cambridge 185+). Required for non-native speakers without at least two years of English-medium secondary education.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "not-offered",
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    ed2: {
      value: "not-offered",
      source: "https://oir.yale.edu/sites/default/files/yale_cds_2025-26_md_20260616.pdf",
    },
    ea: {
      value: "2026-11-01",
      source: "https://admissions.yale.edu/timelines",
    },
    rd: {
      value: "2027-01-02",
      source: "https://admissions.yale.edu/timelines",
    },
    deadlineNote:
      "EA is Single-Choice (Restrictive) Early Action, non-binding. Page lists November 1 and January 2 (years not printed).",
    highlight:
      "Every Yale undergraduate is randomly assigned to one of 14 residential colleges for all four years.",
    image: {
      src: "/media/colleges/yale-university.webp",
      card: "/media/colleges/yale-university-card.webp",
      title:
        "Sterling Memorial Library seen from the front, Yale University, New Haven, Connecticut.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Sterling_Memorial_Library_seen_from_the_front,_Yale_University,_New_Haven,_Connecticut.jpg",
      author: "Christian David",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://admissions.yale.edu/requirements",
      international: "https://admissions.yale.edu/international",
      aid: "https://admissions.yale.edu/international",
      cds: "https://oir.yale.edu/common-data-set",
    },
  },
  {
    slug: "california-institute-of-technology",
    name: "California Institute of Technology",
    type: "NU",
    city: "Pasadena",
    state: "California",
    code: "CA",
    rank: {
      label: "#5 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 11285,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    admitted: {
      value: 428,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
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
      "No Early Decision (CDS C21 = No). Restrictive Early Action offered (C22: closing 11/1, notification 12/15); CDS does not report EA applicant/admit counts.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: "35-36",
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    testPolicy: {
      value: "required",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    testNote:
      "SAT or ACT required; applicants who could not access a test can explain in the Caltech application. CDS C9 gives no SAT composite: EBRW 760-780, Math 790-800 (25th-75th).",
    needBasedForIntl: {
      value: true,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    policyQuote:
      "Caltech is committed to meeting the full demonstrated financial need of all admitted students. We are need-aware for international students because the total amount of financial aid funds for international students is limited.",
    intlAided: {
      value: 59,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    intlAvgAward: {
      value: 85696,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    intlNote:
      "International students must apply for aid when applying for admission; those who do not apply/receive aid in year one cannot apply later (exceptions possible for Canada and Mexico).",
    costYear: "2026-2027",
    tuition: {
      value: 68574,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    fees: {
      value: 3255,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    roomBoard: {
      value: 21996,
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    costNote:
      "CDS 2025-26 G1 reports 2026-2027 costs; required fees are 3,255 for first-years (2,655 for other undergraduates).",
    ielts: {
      value: 7,
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    toefl: {
      value: 100,
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    duolingo: {
      value: 130,
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    englishNote:
      "Minimums: IELTS 7 (7 each band); TOEFL 100 (25 each section) before Jan 21 2026, or 5 (5 each) on/after; DET 130. Required unless native English speaker or English-medium school (then strongly recommended).",
    nationalCurriculum: {
      value:
        "Transcripts must show class titles, grades and predicted grades/scores; admissions officers know the home system so grades need not be converted. Students in India must complete both Year X and XII board exams (no Bangladesh-specific rule stated).",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    ed1: {
      value: "not-offered",
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    ed2: {
      value: "not-offered",
      source: "https://iro.caltech.edu/documents/35129/Caltech_CDS_2025-26_August_2026.pdf",
    },
    ea: {
      value: "2026-11-01",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    rd: {
      value: "2027-01-04",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    deadlineNote: "EA is Restrictive Early Action.",
    highlight:
      "Caltech's student-run Honor Code holds that no member of the community shall take unfair advantage of any other.",
    image: {
      src: "/media/colleges/california-institute-of-technology.webp",
      card: "/media/colleges/california-institute-of-technology-card.webp",
      title: "Dabney Hall Caltech 2017a.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Dabney_Hall_Caltech_2017a.jpg",
      author: "Antony-22",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://www.admissions.caltech.edu/apply/first-year-applicants",
      international:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
      aid: "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
      cds: "https://iro.caltech.edu/data",
    },
  },
  {
    slug: "stanford-university",
    name: "Stanford University",
    type: "NU",
    city: "Stanford",
    state: "California",
    code: "CA",
    rank: {
      label: "#5 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 60646,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    admitted: {
      value: 2302,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
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
      "No Early Decision (CDS C21 = No). Restrictive Early Action offered (C22: closing 11/1, notification 12/15); CDS does not report EA applicant/admit counts.",
    sat: {
      value: "1520-1570",
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    act: {
      value: "34-36",
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote:
      "ACT or SAT listed as a required component for first-year applicants (latest REA sittings: ACT end of September, SAT end of October; RD through end of December).",
    needBasedForIntl: {
      value: true,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote: null,
    intlAided: {
      value: 260,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    intlAvgAward: {
      value: 85424,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    intlNote:
      "Per Stanford's international page (seen only via search summary): a request for need-based aid by an international citizen is a factor in the admission evaluation; Stanford meets full need of admitted students; those who don't request aid when applying can't apply later. CSS Profile, or ISAFA if Profile fee unaffordable.",
    costYear: "2026-2027",
    tuition: {
      value: 67731,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    fees: {
      value: 843,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    roomBoard: {
      value: 22944,
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
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
      "International page says no English proficiency exams are required; scores may be self-reported. (Older FAQ page strongly recommends a test for non-native speakers not in English-medium schools.)",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    ed2: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1GIPKgVj1d86dkmLkHI_mZVCk_iY6kiCp/view",
    },
    ea: {
      value: null,
      source: null,
    },
    rd: {
      value: null,
      source: null,
    },
    deadlineNote:
      "EA is Restrictive Early Action. Arts-portfolio applicants have earlier Common App deadlines (REA Oct 15; RD Dec 5).",
    highlight:
      "Memorial Church on the Main Quad was built by Jane Stanford in memory of her husband Leland and dedicated in 1903.",
    image: {
      src: "/media/colleges/stanford-university.webp",
      card: "/media/colleges/stanford-university-card.webp",
      title: "Stanford University Arches with Memorial Church in the background.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Stanford_University_Arches_with_Memorial_Church_in_the_background.jpg",
      author: "Jawed",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://admission.stanford.edu/apply/first-year/",
      international: "https://admission.stanford.edu/apply/international/index.html",
      aid: "https://financialaid.stanford.edu/undergrad/how/international.html",
      cds: "https://irds.stanford.edu/data-findings/cds",
    },
  },
  {
    slug: "university-of-pennsylvania",
    name: "University of Pennsylvania",
    type: "NU",
    city: "Philadelphia",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#7 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 72544,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    admitted: {
      value: 3570,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    edApplicants: {
      value: 9503,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    edAdmitted: {
      value: 1266,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Binding Early Decision (C21: closing 11/1, notification 12/15). No Early Action.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: "34-35",
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    testPolicy: {
      value: "required",
      source: "https://admissions.upenn.edu/how-to-apply/preparing-your-application/testing",
    },
    testNote:
      "SAT or ACT required for all first-year applicants incl. international; hardship waiver available. CDS C9 gives no SAT composite: EBRW 740-770, Math 770-800 (25th-75th).",
    needBasedForIntl: {
      value: true,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admissions.upenn.edu/affording-penn/international-aid",
    },
    policyQuote:
      "International students admitted as financial aid recipients will receive need-based aid that covers 100% of their demonstrated need, just like domestic students. ... Penn is need-aware for international applicants",
    intlAided: {
      value: 448,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    intlAvgAward: {
      value: 80607,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    intlNote:
      "Need-aware applies to non-citizens/non-permanent residents of the US, Canada and Mexico; families able to pay are discouraged from applying for aid.",
    costYear: "2026-2027",
    tuition: {
      value: 65670,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    fees: {
      value: 8308,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    roomBoard: {
      value: 20604,
      source: "https://upenn.box.com/s/woo7d85yxpol6j9e2o121aucjc6dc1k5",
    },
    costNote:
      "CDS 2025-26 G1 (template year 2026-2027); room only 13,644 + board only 6,960 summed, no combined figure reported.",
    ielts: {
      value: 7,
      source: "https://admissions.upenn.edu/how-to-apply/international-applicants",
    },
    toefl: {
      value: 100,
      source: "https://admissions.upenn.edu/how-to-apply/international-applicants",
    },
    duolingo: {
      value: 130,
      source: "https://admissions.upenn.edu/how-to-apply/international-applicants",
    },
    englishNote:
      "Typical of competitive applicants, not minimums: TOEFL 100+ (old scale) or 5+ (new 1-6 scale), IELTS 7+, DET 130+. Only tests taken on or after April 1, 2025 accepted.",
    nationalCurriculum: {
      value:
        "Complete official records for all secondary grade levels; predicted scores accepted if final exams not yet available; grades/GPAs should not be recalculated or evaluated by a third party.",
      source: "https://admissions.upenn.edu/how-to-apply/international-applicants",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admissions.upenn.edu/how-to-apply/first-year-applicants",
    },
    ed2: {
      value: "not-offered",
      source: "https://admissions.upenn.edu/how-to-apply/first-year-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://admissions.upenn.edu/how-to-apply/first-year-applicants",
    },
    rd: {
      value: "2027-01-05",
      source: "https://admissions.upenn.edu/how-to-apply/first-year-applicants",
    },
    deadlineNote: "Binding Early Decision; no ED II or EA.",
    highlight:
      "Penn was founded by Benjamin Franklin, whose ideals its admissions committee still cites.",
    image: {
      src: "/media/colleges/university-of-pennsylvania.webp",
      card: "/media/colleges/university-of-pennsylvania-card.webp",
      title: "College Hall, University of Pennsylvania, Philadelphia, PA.jpg",
      page: "https://commons.wikimedia.org/wiki/File:College_Hall,_University_of_Pennsylvania,_Philadelphia,_PA.jpg",
      author: "Detroit Publishing Co. , publisher, unknown photographer",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://admissions.upenn.edu/how-to-apply/first-year-applicants",
      international: "https://admissions.upenn.edu/how-to-apply/international-applicants",
      aid: "https://admissions.upenn.edu/affording-penn/international-aid",
      cds: "https://ira.upenn.edu/penn-numbers/common-data-set",
    },
  },
  {
    slug: "duke-university",
    name: "Duke University",
    type: "NU",
    city: "Durham",
    state: "North Carolina",
    code: "NC",
    rank: {
      label: "#8 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 55541,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    admitted: {
      value: 2910,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
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
      "Binding Early Decision offered (CDS C21 = Yes; closing Nov 1, notification Dec 15) but ED applicant/admit counts left blank in the CDS. No Early Action (C22 = N/A).",
    sat: {
      value: "1510-1570",
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    act: {
      value: "34-35",
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admissions.duke.edu/apply/",
    },
    testNote:
      "SAT/ACT optional; CDS C8F states Duke will be test optional for the 2026-27 admissions cycle.",
    needBasedForIntl: {
      value: true,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    intlAidPolicy: {
      value: "limited",
      source: "https://financialaid.duke.edu/forms-resources/awarding-policy/",
    },
    policyQuote:
      "Financial resources for international students are limited. Each year Duke University expects to enroll 20 to 25 international students whose full demonstrated need has been met with a university-provided need-based aid package.",
    intlAided: {
      value: 215,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    intlAvgAward: {
      value: 87841,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    intlNote:
      "Effectively need-aware for international aid applicants; foreign citizens must request need-based aid in the original first-year application to be eligible later. H6 checks both need-based and non-need-based aid (e.g. Karsh International Scholars).",
    costYear: "2026-2027",
    tuition: {
      value: 73740,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    fees: {
      value: 2635,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    roomBoard: {
      value: 20222,
      source:
        "https://ir.provost.duke.edu/sites/default/files/CDS_PDF_2025-2026-20260622-website-published-version.pdf",
    },
    costNote: "CDS 2025-26 G1 (2026-2027 year); food and housing on campus.",
    ielts: {
      value: 7,
      source: "https://admissions.duke.edu/apply/",
    },
    toefl: {
      value: 100,
      source: "https://admissions.duke.edu/apply/",
    },
    duolingo: {
      value: 130,
      source: "https://admissions.duke.edu/apply/",
    },
    englishNote:
      "English test recommended but not required for non-native speakers / non-English-medium curricula. 'Minimum expected' scores: IELTS 7, TOEFL 100 (before Jan 21 2026) or 5.0 (after), DET 130, PTE 70, Cambridge 180.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-02",
      source: "https://admissions.duke.edu/apply/",
    },
    ed2: {
      value: "not-offered",
      source: "https://admissions.duke.edu/apply/",
    },
    ea: {
      value: "not-offered",
      source: "https://admissions.duke.edu/apply/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://admissions.duke.edu/apply/",
    },
    deadlineNote:
      "Binding Early Decision due November 2; Regular Decision January 4 (years not printed on page; CDS lists ED close 11/1 for prior cycle).",
    highlight:
      "Duke Chapel, with its 210-foot tower, was designed by Horace Trumbauer's firm with chief designer Julian Abele and dedicated in 1935.",
    image: {
      src: "/media/colleges/duke-university.webp",
      card: "/media/colleges/duke-university-card.webp",
      title: "Duke University Chapel in Durham, North Carolina on 7 February 2026.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Duke_University_Chapel_in_Durham,_North_Carolina_on_7_February_2026.jpg",
      author: "Progress P",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://admissions.duke.edu/apply/",
      international: "https://admissions.duke.edu/apply/",
      aid: "https://financialaid.duke.edu/forms-resources/awarding-policy/",
      cds: "https://ir.provost.duke.edu/duke-numbers/common-data-sets/",
    },
  },
  {
    slug: "johns-hopkins-university",
    name: "Johns Hopkins University",
    type: "NU",
    city: "Baltimore",
    state: "Maryland",
    code: "MD",
    rank: {
      label: "#9 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 50259,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    admitted: {
      value: 3072,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    edApplicants: {
      value: 7639,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    edAdmitted: {
      value: 835,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
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
      "Binding Early Decision I (C21: closing 11/1, notification 12/11) and ED II (closing 1/3, notification 2/12); ED counts are for both rounds combined. No Early Action (C22 = No).",
    sat: {
      value: "1530-1565",
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    act: {
      value: "35-35",
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    testPolicy: {
      value: "required",
      source: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
    },
    testNote:
      "Johns Hopkins requires standardized testing (SAT or ACT); self-reported scores accepted, official scores required on enrolling.",
    needBasedForIntl: {
      value: true,
      source: "https://apply.jhu.edu/international-applicants/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://apply.jhu.edu/international-applicants/",
    },
    policyQuote:
      "Hopkins is need-aware for international students, meaning that financial circumstances are considered in the admissions process. Hopkins meets 100% of demonstrated need for all admitted students, including international students.",
    intlAided: {
      value: 183,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    intlAvgAward: {
      value: 43101,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    intlNote:
      "All international citizens submit the Certification of Finances (COF); aid applicants also submit the CSS Profile. About 10% of international students receive financial aid; those who don't apply for aid as first-years can't apply later.",
    costYear: "2026-2027",
    tuition: {
      value: 68670,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    fees: {
      value: 500,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    roomBoard: {
      value: 21967,
      source:
        "https://oira.jhu.edu/wp-content/uploads/2025-2026-CDS-Johns-Hopkins-University-v2.pdf",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year), matching sfs.jhu.edu: required fees 500 for first-years (0 for other undergraduates), food and housing 21,967 for first-years (23,338 for others). Health insurance (3,624) billed separately.",
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
      "TOEFL, IELTS, Duolingo or Cambridge English recommended (not required) for applicants whose primary language is not English or who haven't attended an English-language school for the last three years; no scores stated.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-01",
      source: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
    },
    ed2: {
      value: "2027-01-02",
      source: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
    },
    ea: {
      value: "not-offered",
      source: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
    },
    rd: {
      value: "2027-01-02",
      source: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
    },
    deadlineNote: "ED I Nov 1, 2026; ED II and RD Jan 2, 2027 (both binding ED rounds).",
    highlight:
      "Johns Hopkins opened in 1876 as America's first research university, where every faculty member did original research.",
    image: {
      src: "/media/colleges/johns-hopkins-university.webp",
      card: "/media/colleges/johns-hopkins-university-card.webp",
      title: "Gilman Hall, Johns Hopkins University, Baltimore, MD.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Gilman_Hall,_Johns_Hopkins_University,_Baltimore,_MD.jpg",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
      international: "https://apply.jhu.edu/international-applicants/",
      aid: "https://apply.jhu.edu/international-applicants/",
      cds: "https://oira.jhu.edu/common-data-set-2025-26/",
    },
  },
  {
    slug: "northwestern-university",
    name: "Northwestern University",
    type: "NU",
    city: "Evanston",
    state: "Illinois",
    code: "IL",
    rank: {
      label: "#9 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 52676,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    admitted: {
      value: 3933,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    edApplicants: {
      value: 5939,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    edAdmitted: {
      value: 1212,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
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
      "Binding Early Decision (C21: closing 11/1, notification 12/15). No Early Action (C22 = No).",
    sat: {
      value: "1520-1560",
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    act: {
      value: "34-35",
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admissions.northwestern.edu/faqs/standardized-testing-policy/",
    },
    testNote:
      "Northwestern is test-optional and does not require ACT or SAT scores from first-year or transfer candidates.",
    needBasedForIntl: {
      value: true,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admissions.northwestern.edu/apply/identities/international.html",
    },
    policyQuote:
      "We guarantee to meet 100% of all admitted first-year students' demonstrated financial need for all four years. ... We are need-aware for international students",
    intlAided: {
      value: 297,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    intlAvgAward: {
      value: 74186,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    intlNote:
      "Aid applicants must indicate it on the admission application; only a small group of first-year international students receive need-based aid each year; aid is grants/scholarships only. No aid for international transfers.",
    costYear: "2026-2027",
    tuition: {
      value: 71802,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    fees: {
      value: 1260,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    roomBoard: {
      value: 22941,
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    costNote: "CDS 2025-26 G1 (2026-2027 year); food and housing on campus.",
    ielts: {
      value: "none",
      source: "https://admissions.northwestern.edu/faqs/international-applicants/",
    },
    toefl: {
      value: "none",
      source: "https://admissions.northwestern.edu/faqs/international-applicants/",
    },
    duolingo: {
      value: "none",
      source: "https://admissions.northwestern.edu/faqs/international-applicants/",
    },
    englishNote:
      "English proficiency score required if first/primary language is not English or schooling not in English; DET, IELTS (incl. Indicator) or TOEFL iBT accepted; no minimum score set (competitive applicants typically score high on all sections). No superscoring.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admissions.northwestern.edu/faqs/standardized-testing-policy/",
    },
    ed2: {
      value: "not-offered",
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    ea: {
      value: "not-offered",
      source: "https://enrollment.northwestern.edu/data/2025-2026.pdf",
    },
    rd: {
      value: "2027-01-04",
      source: "https://admissions.northwestern.edu/faqs/standardized-testing-policy/",
    },
    deadlineNote: "Binding Early Decision only; no ED II or EA.",
    highlight:
      "Northwestern's lakefront campus grew by about 74 acres of land reclaimed from Lake Michigan (the Lakefill) in the 1960s.",
    image: {
      src: "/media/colleges/northwestern-university.webp",
      card: "/media/colleges/northwestern-university-card.webp",
      title: "Deering Library Northwestern.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Deering_Library_Northwestern.jpg",
      author: "Madcoverboy at English Wikipedia",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    urls: {
      admissions: "https://admissions.northwestern.edu/apply/",
      international: "https://admissions.northwestern.edu/apply/identities/international.html",
      aid: "https://admissions.northwestern.edu/tuition-aid/international-student-aid/",
      cds: "https://enrollment.northwestern.edu/data/common-data-set.html",
    },
  },
  {
    slug: "university-of-chicago",
    name: "University of Chicago",
    type: "NU",
    city: "Chicago",
    state: "Illinois",
    code: "IL",
    rank: {
      label: "#9 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026",
    applicants: {
      value: 45533,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    admitted: {
      value: 2039,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
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
      "Offers ED I, ED II (binding) and non-restrictive Early Action (CDS C21/C22 = Yes), but the CDS leaves ED/EA counts and dates blank.",
    sat: {
      value: "1500-1560",
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    act: {
      value: "34-35",
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://collegeadmissions.uchicago.edu/apply/application/required-materials/",
    },
    testNote:
      "Test-optional with a 'No Harm' policy: SAT/ACT scores are used only if they help the applicant; applies to international applicants too.",
    needBasedForIntl: {
      value: true,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "We are committed to meeting 100% of your demonstrated need with a loan-free financial aid package if you are admitted and applied for funding.",
    intlAided: {
      value: 269,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    intlAvgAward: {
      value: 74765,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    intlNote:
      "International first-years are eligible for need-based and merit aid; must apply for aid when applying for admission or no funds later. The aid pages seen do not say whether review is need-blind or need-aware for internationals. CDS H6 checks both need-based and non-need-based.",
    costYear: "2026-2027",
    tuition: {
      value: 75960,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    fees: {
      value: 2715,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    roomBoard: {
      value: 21414,
      source: "https://data.uchicago.edu/files/2026/08/CDS_2025-2026_to_publish-1.pdf",
    },
    costNote:
      "CDS 2025-26 G1 (2026-2027 year); required fees 2,715 for first-years (1,995 for other undergraduates); food and housing on campus.",
    ielts: {
      value: "none",
      source: "https://collegeadmissions.uchicago.edu/apply/international-applicants/",
    },
    toefl: {
      value: "none",
      source: "https://collegeadmissions.uchicago.edu/apply/international-applicants/",
    },
    duolingo: {
      value: "none",
      source: "https://collegeadmissions.uchicago.edu/apply/international-applicants/",
    },
    englishNote:
      "No English test required if mastery is evident in the application; scores from any English proficiency exam may be submitted (official or self-reported). No minimums stated; no ESL program.",
    nationalCurriculum: {
      value:
        "Transcripts are evaluated in the system of the applicant's school; do not convert grades to a 4.0 GPA, and leave rank/GPA blank if the school does not report them.",
      source: "https://collegeadmissions.uchicago.edu/apply/international-applicants/",
    },
    ed1: {
      value: "2026-11-02",
      source: "https://collegeadmissions.uchicago.edu/apply/application/",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://collegeadmissions.uchicago.edu/apply/application/",
    },
    ea: {
      value: "2026-11-02",
      source: "https://collegeadmissions.uchicago.edu/apply/application/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://collegeadmissions.uchicago.edu/apply/application/",
    },
    deadlineNote:
      "Four plans: ED I and EA Nov 2, 2026; ED II and RD Jan 4, 2027. EA is non-restrictive.",
    highlight:
      "Every UChicago undergraduate takes the Core, a shared common curriculum that underpins all majors.",
    image: {
      src: "/media/colleges/university-of-chicago.webp",
      card: "/media/colleges/university-of-chicago-card.webp",
      title:
        "Harper Memorial Library, University of Chicago, 59th Street, Hyde Park, Chicago, IL (54514972872).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Harper_Memorial_Library,_University_of_Chicago,_59th_Street,_Hyde_Park,_Chicago,_IL_(54514972872).jpg",
      author: "Warren LeMay from Chicago, IL, United States",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    urls: {
      admissions: "https://collegeadmissions.uchicago.edu/apply/application/",
      international: "https://collegeadmissions.uchicago.edu/apply/international-applicants/",
      aid: "https://collegeadmissions.uchicago.edu/financial-support/international-financial-aid/",
      cds: "https://data.uchicago.edu/common-data-set/",
    },
  },
  {
    slug: "columbia-university",
    name: "Columbia University",
    type: "NU",
    city: "New York",
    state: "New York",
    code: "NY",
    rank: {
      label: "#12 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-21",
    cdsYear: "2025-2026 (C1 only; other figures from 2024-2025)",
    applicants: {
      value: 59611,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2025-26_Columbia_College_and_Columbia_Enginnering_CDS.pdf",
    },
    admitted: {
      value: 2946,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2025-26_Columbia_College_and_Columbia_Enginnering_CDS.pdf",
    },
    edApplicants: {
      value: 6007,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    edAdmitted: {
      value: 795,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
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
      "Single binding Early Decision (Nov 1); no Early Action (CDS C22 = No). ED counts are for the Fall 2024 entering class (CDS 2024-25), because the published 2025-26 CDS stops after C2.",
    sat: {
      value: "1510-1560",
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    act: {
      value: "34-36",
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://undergrad.admissions.columbia.edu/apply/process/testing",
    },
    testNote:
      "Test optional for the 2026-2027 cycle (fall 2027 entry); SAT/ACT will be required from the 2027-2028 cycle (August 2027), with waivers on request. No minimum scores. Fall 2024 enrollees: 44% submitted SAT, 17% ACT (CDS 2024-25 C9).",
    needBasedForIntl: {
      value: true,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://undergrad.admissions.columbia.edu/apply/international/aid",
    },
    policyQuote:
      "Columbia is committed to meeting 100% of the demonstrated need of all admitted first-year students, regardless of citizenship. ... The Columbia admissions process is largely the same for all students, regardless of citizenship and residency, but international students are evaluated in a need-aware manner.",
    intlAided: {
      value: 244,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    intlAvgAward: {
      value: 88789,
      source:
        "https://opir.columbia.edu/sites/opir.columbia.edu/files/content/Common%20Data%20Set/2024-25_Columbia_College_and_Columbia_Engineering_CDS.pdf",
    },
    intlNote:
      "International applicants must say they are applying for aid when they apply; if admitted without requesting aid they cannot apply later. All aid is need-based (no merit scholarships); no loans in packages. CDS H6 is 2024-25; the aid page states an average international award of $79,375.",
    costYear: "2026-2027",
    tuition: {
      value: 72800,
      source: "https://cc-seas.financialaid.columbia.edu/eligibility/facts",
    },
    fees: {
      value: 4160,
      source: "https://cc-seas.financialaid.columbia.edu/eligibility/facts",
    },
    roomBoard: {
      value: 19650,
      source: "https://cc-seas.financialaid.columbia.edu/eligibility/facts",
    },
    costNote:
      "First-year on-campus figures for 2026-27: food $7,128 + housing $12,522 = $19,650. First-year fees include one-time transcript and orientation fees ($730). International students also pay a $175/semester International Services Charge; health insurance ($2,218 fall, $3,605 spring) is extra unless waived.",
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
      "No minimum scores published. Proficiency is required: met by English home language, English-medium secondary schooling, SAT Reading and Writing 700+ or ACT English/Reading 29+; otherwise submit TOEFL, IELTS, Duolingo English Test or Cambridge English. Optional InitialView or Vericant videos accepted.",
    nationalCurriculum: {
      value:
        "All secondary curricula, including national school curricula, are accepted and reviewed in context. Internal and external exam results (including final national exam results) must be submitted if they are required to complete and graduate from secondary school; otherwise they are not required.",
      source: "https://undergrad.admissions.columbia.edu/apply/international",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://undergrad.admissions.columbia.edu/apply/first-year",
    },
    ed2: {
      value: "not-offered",
      source: "https://undergrad.admissions.columbia.edu/apply/first-year",
    },
    ea: {
      value: "not-offered",
      source: "https://undergrad.admissions.columbia.edu/apply/first-year",
    },
    rd: {
      value: "2027-01-01",
      source: "https://undergrad.admissions.columbia.edu/apply/first-year",
    },
    deadlineNote:
      "ED and QuestBridge Match Nov 1; ED financial aid application Nov 15; RD Friday, January 1, 2027 (11:59 p.m. applicant's local time); RD financial aid Feb 15.",
    highlight:
      "Every Columbia College student takes the Core Curriculum, a shared set of seminars on great works and ideas that has run for over a century.",
    image: {
      src: "/media/colleges/columbia-university.webp",
      card: "/media/colleges/columbia-university-card.webp",
      title: "Low Memorial Library - Columbia University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Low_Memorial_Library_-_Columbia_University.jpg",
      author: "Spaghet-Ti",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://undergrad.admissions.columbia.edu/apply/first-year",
      international: "https://undergrad.admissions.columbia.edu/apply/international",
      aid: "https://undergrad.admissions.columbia.edu/apply/international/aid",
      cds: "https://opir.columbia.edu/cds",
    },
  },
  {
    slug: "dartmouth-college",
    name: "Dartmouth College",
    type: "NU",
    city: "Hanover",
    state: "New Hampshire",
    code: "NH",
    rank: {
      label: "#12 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 28230,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    admitted: {
      value: 1699,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    edApplicants: {
      value: 3552,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    edAdmitted: {
      value: 768,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Binding Early Decision only; CDS C22 says no Early Action.",
    sat: {
      value: "1440-1550",
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    act: {
      value: "32-35",
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    testPolicy: {
      value: "required",
      source:
        "https://admissions.dartmouth.edu/apply-dartmouth/reactivating-dartmouths-testing-policy",
    },
    testNote:
      "Dartmouth reactivated its SAT/ACT requirement starting with applicants to the Class of 2029.",
    needBasedForIntl: {
      value: true,
      source: "https://admissions.dartmouth.edu/glossary-term/international-students",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://admissions.dartmouth.edu/glossary-term/international-students",
    },
    policyQuote:
      "Dartmouth practices need-blind admissions for all applicants including international students. Applicants are admitted to the College without regard to financial circumstances.",
    intlAided: {
      value: 483,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    intlAvgAward: {
      value: 87562,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    intlNote:
      "The same page says Dartmouth meets the full financial need of all admitted students.",
    costYear: "2026-2027",
    tuition: {
      value: 69207,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    fees: {
      value: 2318,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    roomBoard: {
      value: 20920,
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    costNote: "CDS G1 for 2026-27, first-year figures (housing $12,579 + food $8,341).",
    ielts: {
      value: "none",
      source:
        "https://admissions.dartmouth.edu/glossary-question/if-english-not-my-first-language-am-i-required-submit-language-proficiency-test",
    },
    toefl: {
      value: "none",
      source:
        "https://admissions.dartmouth.edu/glossary-question/if-english-not-my-first-language-am-i-required-submit-language-proficiency-test",
    },
    duolingo: {
      value: "none",
      source:
        "https://admissions.dartmouth.edu/glossary-question/if-english-not-my-first-language-am-i-required-submit-language-proficiency-test",
    },
    englishNote:
      "No minimum scores. Most successful applicants score above 7 on IELTS, above 135 on Duolingo, above 100 on TOEFL (5 or above for tests from 21 January 2026). Required if English is not your first language and your curriculum hasn't been in English for two years.",
    nationalCurriculum: {
      value:
        "Dartmouth says it reviews each international applicant in the context of their home and school environment, which may include the national curriculum and access to standardized testing.",
      source: "https://admissions.dartmouth.edu/glossary-term/international-students",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admissions.dartmouth.edu/apply-dartmouth",
    },
    ed2: {
      value: "not-offered",
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    ea: {
      value: "not-offered",
      source: "https://www.dartmouth.edu/oir/pdfs/cds_2025-26.pdf",
    },
    rd: {
      value: "2027-01-01",
      source: "https://admissions.dartmouth.edu/apply-dartmouth",
    },
    deadlineNote:
      "The page gives November 1 and January 1 without a year; mapped to the 2026-27 cycle.",
    highlight:
      "Students in the Class of 2028 come from 65 countries, a third of the world's nations.",
    image: {
      src: "/media/colleges/dartmouth-college.webp",
      card: "/media/colleges/dartmouth-college-card.webp",
      title: "Baker-Library-Dartmouth-College-Hanover-New-Hampshire-05-2018a.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Baker-Library-Dartmouth-College-Hanover-New-Hampshire-05-2018a.jpg",
      author: "Gunnar Klack",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://admissions.dartmouth.edu/apply-dartmouth",
      international: "https://admissions.dartmouth.edu/glossary-term/international-students",
      aid: "https://financialaid.dartmouth.edu/",
      cds: "https://www.dartmouth.edu/oir/data-reporting/cds/index.html",
    },
  },
  {
    slug: "carnegie-mellon-university",
    name: "Carnegie Mellon University",
    type: "NU",
    city: "Pittsburgh",
    state: "Pennsylvania",
    code: "PA",
    rank: {
      label: "#14 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 34867,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    admitted: {
      value: 3859,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    edApplicants: {
      value: 2680,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    edAdmitted: {
      value: 553,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
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
      "Binding Early Decision only (not for Drama, Music or BXA Design); CDS C22 says no Early Action.",
    sat: {
      value: "1500-1560",
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    act: {
      value: "34-36",
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    testPolicy: {
      value: null,
      source: null,
    },
    testNote:
      "Depends on the college: Computer Science requires the SAT or ACT; Engineering, Dietrich, Mellon College of Science, Tepper and Heinz Information Systems are 'test flexible' (a test is required, but IB, A-Level, AP or French Bac results can replace the SAT/ACT); Fine Arts is test-optional.",
    needBasedForIntl: {
      value: false,
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    intlAidPolicy: {
      value: "none",
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    policyQuote:
      "Carnegie Mellon doesn't offer financial aid to international students. If you're an international student who plans to enroll at Carnegie Mellon, you and your family must plan to pay the total cost of attendance.",
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "CDS H6 also says institutional scholarship and grant aid is not available to nonresident students.",
    costYear: "2026-2027",
    tuition: {
      value: 69702,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    fees: {
      value: 1862,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    roomBoard: {
      value: 19560,
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    costNote: "CDS G1 for 2026-27, first-year figures.",
    ielts: {
      value: 7.5,
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    toefl: {
      value: 102,
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    duolingo: {
      value: 135,
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    englishNote:
      "Minimums for non-native speakers. TOEFL tests taken on or after 21 Jan 2026: overall 5 on the new scale. Cambridge: 191.",
    nationalCurriculum: {
      value:
        "Transcripts not in English need an official translation verified by a counselor or school official. IB and A-Level students send expected results; under the test-flexible policy, predicted IB or A-Level results can count as the required test.",
      source: "https://www.cmu.edu/admission/admission/international-applicants",
    },
    ed1: {
      value: "2026-11-02",
      source: "https://www.cmu.edu/admission/admission/application-plans-deadlines",
    },
    ed2: {
      value: "not-offered",
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    ea: {
      value: "not-offered",
      source: "https://www.cmu.edu/ira/CDS/pdf/cds_2025_26/cds_2025_full_pdf_updated_11jun26.pdf",
    },
    rd: {
      value: "2027-01-04",
      source: "https://www.cmu.edu/admission/admission/application-plans-deadlines",
    },
    deadlineNote:
      "The deadlines page gives November 2 and January 4 without a year; mapped to the 2026-27 cycle. Drama and Music: December 1. The FAQ page lists other dates (November 3, January 5).",
    highlight:
      "About 19% of undergraduates come from outside the United States, one of the highest shares among national universities.",
    image: {
      src: "/media/colleges/carnegie-mellon-university.webp",
      card: "/media/colleges/carnegie-mellon-university-card.webp",
      title: "Hamerschlag Hall, Carnegie Mellon University, 2023-04-27, 01.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Hamerschlag_Hall,_Carnegie_Mellon_University,_2023-04-27,_01.jpg",
      author: "Cbaile19",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://www.cmu.edu/admission/admission/application-plans-deadlines",
      international: "https://www.cmu.edu/admission/admission/international-applicants",
      aid: "https://www.cmu.edu/sfs/",
      cds: "https://www.cmu.edu/ira/CDS/previouscds.html",
    },
  },
  {
    slug: "cornell-university",
    name: "Cornell University",
    type: "NU",
    city: "Ithaca",
    state: "New York",
    code: "NY",
    rank: {
      label: "#14 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 72523,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    admitted: {
      value: 6077,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    edApplicants: {
      value: 10057,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    edAdmitted: {
      value: 1889,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "Binding Early Decision only; no Early Action.",
    sat: {
      value: "1490-1550",
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    testPolicy: {
      value: "required",
      source: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    },
    testNote: "SAT or ACT scores are required.",
    needBasedForIntl: {
      value: true,
      source: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    },
    policyQuote:
      "Cornell’s undergraduate admission process for international students is need-aware, meaning interest in or need for financial aid is one factor amongst many considered when making admission decisions.",
    intlAided: {
      value: 318,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    intlAvgAward: {
      value: 88263,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    intlNote:
      "International students must submit the aid application by the admission deadline (November 1 for ED, January 2 for RD). Five Levitan Family Scholarships go to international students each year.",
    costYear: "2026-2027",
    tuition: {
      value: 73946,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    fees: {
      value: 1024,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    roomBoard: {
      value: 21348,
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    costNote: "CDS G1 for 2026-27 (housing $13,744 + food $7,604).",
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
      "An English test (TOEFL, IELTS, Duolingo or Cambridge C1/C2) is required unless English is your native language or was your main language of instruction in secondary school. Minimum scores are set by each Cornell college, not university-wide.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    },
    ed2: {
      value: "not-offered",
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    ea: {
      value: "not-offered",
      source:
        "https://irp.cornell.edu/wp-content/uploads/2026/09/Cornell-Common-Data-Set-2025-26.pdf",
    },
    rd: {
      value: "2027-01-02",
      source: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    },
    deadlineNote:
      "The page gives November 1 and January 2 without a year; mapped to the 2026-27 cycle. Other materials are due November 13 (ED) and January 19 (RD).",
    highlight: "About 10% of students come from more than 125 countries.",
    image: {
      src: "/media/colleges/cornell-university.webp",
      card: "/media/colleges/cornell-university-card.webp",
      title: "Cornell University - Arts Quadrangle, looking north.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Cornell_University_-_Arts_Quadrangle,_looking_north.jpg",
      author: "The Corner Book Stores, Ithaca",
      licence: "Public domain",
      licenceUrl: null,
    },
    urls: {
      admissions: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
      international: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
      aid: "https://finaid.cornell.edu/frequently-asked-questions-about-international-financial-aid",
      cds: "https://irp.cornell.edu/common-data-set",
    },
  },
  {
    slug: "brown-university",
    name: "Brown University",
    type: "NU",
    city: "Providence",
    state: "Rhode Island",
    code: "RI",
    rank: {
      label: "#16 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: null,
    applicants: {
      value: null,
      source: null,
    },
    admitted: {
      value: null,
      source: null,
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
      "Single-choice binding Early Decision; no Early Action. The number of ED applications is not published there.",
    sat: {
      value: null,
      source: null,
    },
    act: {
      value: null,
      source: null,
    },
    testPolicy: {
      value: "required",
      source: "https://admission.brown.edu/first-year/application-checklist",
    },
    testNote:
      "SAT or ACT required since the 2024-25 cycle; superscored. Brown's ranges are for admitted students (Class of 2029), not enrolled students as in a CDS.",
    needBasedForIntl: {
      value: true,
      source: "https://admission.brown.edu/ask/international-applicants",
    },
    intlAidPolicy: {
      value: "need-blind",
      source: "https://admission.brown.edu/ask/international-applicants",
    },
    policyQuote:
      "Brown meets the full demonstrated need of all admitted students who have applied for financial aid. Starting with the class of 2029 applying in the 2024-2025 admission cycle, Brown has adopted a need-blind admission process for international first-year students.",
    intlAided: {
      value: null,
      source: null,
    },
    intlAvgAward: {
      value: null,
      source: null,
    },
    intlNote:
      "Brown's Common Data Set page currently links no file, so CDS H6 figures are not available. Applicant figures come from Brown's 2025-26 Counselor Newsletter (Class of 2029).",
    costYear: "2026-2027",
    tuition: {
      value: 74568,
      source: "https://finaid.brown.edu/estimate-cost-aid/cost",
    },
    fees: {
      value: 3084,
      source: "https://finaid.brown.edu/estimate-cost-aid/cost",
    },
    roomBoard: {
      value: 19464,
      source: "https://finaid.brown.edu/estimate-cost-aid/cost",
    },
    costNote:
      "Brown's financial aid cost page for an incoming first-year (housing $10,710 + food $8,754). Fees include a $100 one-time academic record fee.",
    ielts: {
      value: 8,
      source: "https://admission.brown.edu/international/english-proficiency",
    },
    toefl: {
      value: 105,
      source: "https://admission.brown.edu/international/english-proficiency",
    },
    duolingo: {
      value: 130,
      source: "https://admission.brown.edu/international/english-proficiency",
    },
    englishNote:
      "Brown says these minimums are 'expected in most cases'. TOEFL tests from January 2026: 5.5. Highly recommended when English is not your first language or language of instruction.",
    nationalCurriculum: {
      value:
        "Brown says its admission officers know the school systems and exams in each region and review applications in context. Documents not in English need official translations sent with the originals.",
      source: "https://admission.brown.edu/ask/international-applicants",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admission.brown.edu/first-year/application-checklist",
    },
    ed2: {
      value: "not-offered",
      source: "https://admission.brown.edu/ask/international-applicants",
    },
    ea: {
      value: "not-offered",
      source: "https://admission.brown.edu/ask/international-applicants",
    },
    rd: {
      value: "2027-01-05",
      source: "https://admission.brown.edu/first-year/application-checklist",
    },
    deadlineNote:
      "The page gives November 1 and January 5 without a year; mapped to the 2026-27 cycle.",
    highlight: "About fifteen percent of students come from abroad.",
    image: {
      src: "/media/colleges/brown-university.webp",
      card: "/media/colleges/brown-university-card.webp",
      title: "Brown University - Main Campus 02.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Brown_University_-_Main_Campus_02.jpg",
      author: "P. Hughes",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    urls: {
      admissions: "https://admission.brown.edu/first-year/application-checklist",
      international: "https://admission.brown.edu/ask/international-applicants",
      aid: "https://finaid.brown.edu/",
      cds: "https://oir.brown.edu/institutional-data/common-data-set",
    },
  },
  {
    slug: "rice-university",
    name: "Rice University",
    type: "NU",
    city: "Houston",
    state: "Texas",
    code: "TX",
    rank: {
      label: "#16 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 36791,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    admitted: {
      value: 2948,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    edApplicants: {
      value: 5748,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    edAdmitted: {
      value: 647,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (C21 counts combined); no Early Action.",
    sat: {
      value: "1510-1560",
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    act: {
      value: "34-36",
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    testNote:
      "Rice recommends sending SAT or ACT scores if available, but applicants without scores get full consideration. Section superscoring.",
    needBasedForIntl: {
      value: true,
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    policyQuote:
      "Rice considers international applicants on a need-aware basis and offers need-based financial aid to a limited number of international first-year applicants.",
    intlAided: {
      value: 164,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    intlAvgAward: {
      value: 79444,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    intlNote:
      "Aid must be requested on the International Student Financial Statement; students admitted without requesting aid cannot apply later. Uses the CSS Profile.",
    costYear: "2026-2027",
    tuition: {
      value: 71140,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    fees: {
      value: 984,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    roomBoard: {
      value: 20530,
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    costNote:
      "CDS G1 for 2026-27, tuition for students entering 2024 or later (housing $13,930 + food $6,600).",
    ielts: {
      value: 7,
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    toefl: {
      value: 100,
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    duolingo: {
      value: 130,
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    englishNote:
      "Minimums. TOEFL tests from 21 Jan 2026: 5.0 on the new scale. IELTS Academic only. Cambridge C1/C2: 185. Waived after two years of full-time study in an English curriculum.",
    nationalCurriculum: {
      value:
        "Students in an exam-based curriculum must send all transcripts, final exam results (for example IGCSE/GCSE, CBSE X) and predicted results if available. Documents not in English need an official translation.",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    ea: {
      value: "not-offered",
      source:
        "https://ideas.rice.edu/wp-content/uploads/2026/09/CDS_2025-26_WEBSITE_Updated_9-28-2026.pdf",
    },
    rd: {
      value: "2027-01-04",
      source: "https://admission.rice.edu/apply/first-year-international-applicants",
    },
    deadlineNote:
      "The page gives Nov. 1 and Jan. 4 without a year; mapped to the 2026-27 cycle. Shepherd School of Music: Dec. 1.",
    highlight:
      "Every student belongs to one of its residential colleges, the center of student life.",
    image: {
      src: "/media/colleges/rice-university.webp",
      card: "/media/colleges/rice-university-card.webp",
      title: "Rice University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Rice_University.jpg",
      author: "Anatol Stefanowitsch",
      licence: "CC BY-SA 3.0",
      licenceUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
    },
    urls: {
      admissions: "https://admission.rice.edu/apply/first-year-international-applicants",
      international: "https://admission.rice.edu/apply/first-year-international-applicants",
      aid: "https://financialaid.rice.edu/",
      cds: "https://ideas.rice.edu/reporting-analytics/common-data-set/",
    },
  },
  {
    slug: "vanderbilt-university",
    name: "Vanderbilt University",
    type: "NU",
    city: "Nashville",
    state: "Tennessee",
    code: "TN",
    rank: {
      label: "#16 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 48196,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    admitted: {
      value: 2593,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    edApplicants: {
      value: 6202,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    edAdmitted: {
      value: 874,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (C21 counts combined); CDS C22 says no Early Action.",
    sat: {
      value: "1510-1560",
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    act: {
      value: "34-35",
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    testPolicy: {
      value: "optional",
      source: "https://admissions.vanderbilt.edu/apply/testing-policies/",
    },
    testNote:
      "SAT/ACT optional for fall 2027 and 2028 entry; required again for fall 2029. Superscored. English proficiency is still required for international students.",
    needBasedForIntl: {
      value: true,
      source: "https://admissions.vanderbilt.edu/faq/",
    },
    intlAidPolicy: {
      value: "need-aware",
      source: "https://admissions.vanderbilt.edu/faq/",
    },
    policyQuote:
      "Note that Vanderbilt is need-aware in the admissions process for international students; we may take into consideration the student’s ability to finance a Vanderbilt education.",
    intlAided: {
      value: 266,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    intlAvgAward: {
      value: 79879,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    intlNote:
      "Admitted international students with need have 100% of demonstrated need met with grants and/or scholarships. They can also apply for merit scholarships.",
    costYear: "2026-2027",
    tuition: {
      value: 69822,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    fees: {
      value: 3384,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    roomBoard: {
      value: 23690,
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    costNote: "CDS G1 for 2026-27, first-year figures (housing $15,170 + food $8,520).",
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
      "Recommended minimums (not strict cutoffs): IELTS 7.0, TOEFL iBT 5 (new scale), Duolingo 130, Cambridge 185. Not needed if English is your first language or language of instruction, or with ACT English above 26 or SAT EBRW above 630.",
    nationalCurriculum: {
      value:
        "All application pieces must be in English; transcripts not originally in English must be officially translated by the school or a certified translator.",
      source: "https://admissions.vanderbilt.edu/apply/first-year-process/",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admissions.vanderbilt.edu/apply/",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://admissions.vanderbilt.edu/apply/",
    },
    ea: {
      value: "not-offered",
      source:
        "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/70/2026/07/CDS_2025-2026.xlsx",
    },
    rd: {
      value: "2027-01-01",
      source: "https://admissions.vanderbilt.edu/apply/",
    },
    deadlineNote: null,
    highlight:
      "Takes no account of demonstrated interest: visiting or emailing does not affect your chances.",
    image: {
      src: "/media/colleges/vanderbilt-university.webp",
      card: "/media/colleges/vanderbilt-university-card.webp",
      title: "Memorial Gymnasium, Vanderbilt University, August 2023.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Memorial_Gymnasium,_Vanderbilt_University,_August_2023.jpg",
      author: "PCN02WPS",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://admissions.vanderbilt.edu/apply/",
      international: "https://admissions.vanderbilt.edu/apply/first-year-process/",
      aid: "https://admissions.vanderbilt.edu/affordability/international-costs-and-finances/",
      cds: "https://www.vanderbilt.edu/data/public-data/common-data-sets/",
    },
  },
  {
    slug: "washington-university-in-st-louis",
    name: "Washington University in St. Louis",
    type: "NU",
    city: "St. Louis",
    state: "Missouri",
    code: "MO",
    rank: {
      label: "#16 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 33283,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    admitted: {
      value: 3968,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    edApplicants: {
      value: 4934,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    edAdmitted: {
      value: 1333,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
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
      "ED I, ED II and a non-restrictive Early Action round; the CDS does not report EA counts.",
    sat: {
      value: "1500-1550",
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    act: {
      value: "33-35",
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    testNote: "SAT or ACT scores are optional (self-reported or official).",
    needBasedForIntl: {
      value: true,
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    intlAidPolicy: {
      value: null,
      source: null,
    },
    policyQuote:
      "WashU meets 100 percent of demonstrated need for all admitted undergraduate students.",
    intlAided: {
      value: 30,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    intlAvgAward: {
      value: 71003,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    intlNote:
      "International students must request aid when applying; they cannot apply for aid later. The page does not say need-blind or need-aware for international applicants.",
    costYear: "2026-2027",
    tuition: {
      value: 71310,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    fees: {
      value: 1412,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    roomBoard: {
      value: 24272,
      source: "https://washu.edu/app/uploads/2026/06/2025-2026-WashU-CDS.pdf",
    },
    costNote: "CDS G1 for 2026-27 (housing $15,150 + food $9,122).",
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
      "An English test is required if English is a second language. WashU recommends at least TOEFL 100 (5.0 on the new scale), IELTS 7.0 or Duolingo 130; these are typical of competitive applicants, not strict minimums. From fall 2027, SAT/ACT scores no longer replace an English test.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-02",
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    ed2: {
      value: "2027-01-04",
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    ea: {
      value: "2026-11-02",
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    rd: {
      value: "2027-01-04",
      source: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
    },
    deadlineNote:
      "The page gives November 2 and January 4 without a year (applying for fall 2027).",
    highlight: "Added a non-binding Early Action round alongside its two Early Decision rounds.",
    image: null,
    urls: {
      admissions: "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
      international:
        "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
      aid: "https://financialaid.wustl.edu/",
      cds: "https://washu.edu/policies/student-consumer-information/",
    },
  },
  {
    slug: "university-of-notre-dame",
    name: "University of Notre Dame",
    type: "NU",
    city: "Notre Dame",
    state: "Indiana",
    code: "IN",
    rank: {
      label: "#20 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 35401,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    admitted: {
      value: 3320,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
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
      "No Early Decision. Offers Restrictive Early Action (CDS C22); the CDS gives no EA counts.",
    sat: {
      value: "1460-1540",
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    act: {
      value: "33-35",
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    testPolicy: {
      value: "optional",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    testNote:
      "Test-optional through 2026-27; SAT/ACT required again for fall 2028 entry. Students abroad may send predicted IB, A-Level (3+) or French Bac results instead.",
    needBasedForIntl: {
      value: true,
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    intlAidPolicy: {
      value: "need-blind",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    policyQuote:
      "The University of Notre Dame practices need-blind admissions for all students. Your ability to pay is not considered when evaluating your application for admission.",
    intlAided: {
      value: 363,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    intlAvgAward: {
      value: 68653,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    intlNote: "International applicants requesting need-based aid submit the CSS Profile.",
    costYear: "2026-2027",
    tuition: {
      value: 69280,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    fees: {
      value: 514,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    roomBoard: {
      value: 18992,
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    costNote: "CDS G1 for 2026-27.",
    ielts: {
      value: 7.5,
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    toefl: {
      value: 100,
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    duolingo: {
      value: 125,
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    englishNote:
      "Listed under 'We strongly recommend the following scores' in a column headed 'Required Score'. TOEFL new scale: 5.5 average. Waived with SAT EBRW 650+ or ACT English/Reading 26+. TOEFL Home Edition not accepted.",
    nationalCurriculum: {
      value:
        "Applicants send an official transcript or record of secondary school achievement, including any national examination results; counselors usually include results or predicted results of exams such as A Levels or IB.",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    ed1: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    ed2: {
      value: "not-offered",
      source: "https://drive.google.com/file/d/1jFtuEmv7OPCTq9e8kD90I7CByERcMBty/view",
    },
    ea: {
      value: "2026-11-01",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    rd: {
      value: "2027-01-04",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    deadlineNote:
      "Early Action is restrictive (single-choice). The page gives November 1 and January 4 without a year; mapped to the 2026-27 cycle.",
    highlight: "Known for the Golden Dome on its Main Building.",
    image: {
      src: "/media/colleges/university-of-notre-dame.webp",
      card: "/media/colleges/university-of-notre-dame-card.webp",
      title: "Golden Dome frontal.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Golden_Dome_frontal.jpg",
      author: "Eccekevin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
      international:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
      aid: "https://financialaid.nd.edu/",
      cds: "https://iris.nd.edu/institutional-research/common-data-set-cds/",
    },
  },
  {
    slug: "emory-university",
    name: "Emory University",
    type: "NU",
    city: "Atlanta",
    state: "Georgia",
    code: "GA",
    rank: {
      label: "#23 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 37561,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    admitted: {
      value: 3869,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    edApplicants: {
      value: 4728,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    edAdmitted: {
      value: 1049,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    eaApplicants: {
      value: null,
      source: null,
    },
    eaAdmitted: {
      value: null,
      source: null,
    },
    earlyNote: "ED I and ED II (C21 counts combined); no Early Action.",
    sat: {
      value: "1480-1540",
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    act: {
      value: "33-35",
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://apply.emory.edu/apply/requirements/exams",
    },
    testNote: "Test-optional for fall 2027 entry; SAT and ACT superscored.",
    needBasedForIntl: {
      value: true,
      source: "https://studentaid.emory.edu/undergraduate/apply/new-students/international.html",
    },
    intlAidPolicy: {
      value: "limited",
      source: "https://studentaid.emory.edu/undergraduate/apply/new-students/international.html",
    },
    policyQuote:
      "Each year we offer need-based financial aid packages to a select group of international students. To be considered for need-based financial aid, please apply under our Regular Decision plan.",
    intlAided: {
      value: 101,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    intlAvgAward: {
      value: 62950,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    intlNote:
      "International students who want need-based aid must apply Regular Decision. Merit scholarships are available through the Emory University Scholar Programs (deadline November 15). No page says need-blind or need-aware.",
    costYear: "2026-2027",
    tuition: {
      value: 70300,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    fees: {
      value: 1148,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    roomBoard: {
      value: 22406,
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    costNote: "CDS G1 for 2026-27 (housing $13,222 + food $9,184).",
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
      "No strict cutoffs. Expected: TOEFL 100 (5.5 on the new scale), IELTS 7.5; competitive Duolingo scores are typically above 130.",
    nationalCurriculum: {
      value: null,
      source: null,
    },
    ed1: {
      value: "2026-11-01",
      source: "https://apply.emory.edu/apply/plans-deadlines",
    },
    ed2: {
      value: "2027-01-01",
      source: "https://apply.emory.edu/apply/plans-deadlines",
    },
    ea: {
      value: "not-offered",
      source:
        "https://provost.emory.edu/planning-administration/_includes/documents/sections/institutional-data/emory-common-date-set-2025-2026.pdf",
    },
    rd: {
      value: "2027-01-01",
      source: "https://apply.emory.edu/apply/plans-deadlines",
    },
    deadlineNote:
      "The page gives November 1 and January 1 without a year; mapped to the 2026-27 cycle. International aid applicants must use Regular Decision (aid documents due February 10).",
    highlight:
      "Applicants can apply to Emory College, Oxford College or both with one application.",
    image: {
      src: "/media/colleges/emory-university.webp",
      card: "/media/colleges/emory-university-card.webp",
      title: "Asa Griggs Candler Library on the Quad at Emory University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Asa_Griggs_Candler_Library_on_the_Quad_at_Emory_University.jpg",
      author: "Marc Merlin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    urls: {
      admissions: "https://apply.emory.edu/apply/plans-deadlines",
      international: "https://apply.emory.edu/apply/international-applicants.html",
      aid: "https://studentaid.emory.edu/undergraduate/apply/new-students/international.html",
      cds: "https://provost.emory.edu/planning-administration/data/common-data-set.html",
    },
  },
  {
    slug: "georgetown-university",
    name: "Georgetown University",
    type: "NU",
    city: "Washington",
    state: "District of Columbia",
    code: "DC",
    rank: {
      label: "#23 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 26822,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    admitted: {
      value: 3618,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
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
    earlyNote: "No Early Decision. Offers Early Action (CDS C22); the CDS gives no EA counts.",
    sat: {
      value: "1405-1530",
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    act: {
      value: "32-35",
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    testPolicy: {
      value: "required",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    testNote:
      "SAT and/or ACT required for all applicants, including those abroad; exceptions only when a test center is physically out of reach.",
    needBasedForIntl: {
      value: true,
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    intlAidPolicy: {
      value: "limited",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    policyQuote:
      "Admitted students who have requested financial aid and are not U.S. citizens or permanent residents will be considered for a very limited number of need-based scholarships.",
    intlAided: {
      value: 48,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    intlAvgAward: {
      value: 75050,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    intlNote: "Aid must be requested on the application, with the CSS Profile.",
    costYear: "2026-2027",
    tuition: {
      value: 74520,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    fees: {
      value: 212,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    roomBoard: {
      value: 22180,
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    costNote: "CDS G1 for 2026-27, first-year figures (housing $13,944 + food $8,236).",
    ielts: {
      value: "none",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    toefl: {
      value: "none",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    duolingo: {
      value: "none",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    englishNote:
      "An English test is recommended, not required, for students whose school does not teach in English. Accepts Duolingo, IELTS or TOEFL. No minimum score is published.",
    nationalCurriculum: {
      value:
        "Applicants submit four years of secondary school credentials, translated into English with the originals. Students in systems with final exams (A-Levels, IB, French Bac) submit projected and/or final results.",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    ed1: {
      value: "not-offered",
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    ed2: {
      value: "not-offered",
      source: "https://georgetown.box.com/s/0r8akn4cbm52zjkll6i7uttlb9k36px2",
    },
    ea: {
      value: "2026-11-01",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    rd: {
      value: "2027-01-01",
      source: "https://uadmissions.georgetown.edu/apply/international-applicants/",
    },
    deadlineNote:
      "The page gives November 1 and January 1 without a year; mapped to the 2026-27 cycle.",
    highlight:
      "Citizenship has no effect on review: applicants are read in the context of their own school and curriculum.",
    image: {
      src: "/media/colleges/georgetown-university.webp",
      card: "/media/colleges/georgetown-university-card.webp",
      title: "Healy Hall, Georgetown University, Georgetown, Washington, DC (39641791973).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Healy_Hall,_Georgetown_University,_Georgetown,_Washington,_DC_(39641791973).jpg",
      author: "Warren LeMay from Cincinnati, OH, United States",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions: "https://uadmissions.georgetown.edu/apply/first-year-applicants/",
      international: "https://uadmissions.georgetown.edu/apply/international-applicants/",
      aid: "https://finaid.georgetown.edu/",
      cds: "https://oads.georgetown.edu/commondataset/",
    },
  },
  {
    slug: "university-of-southern-california",
    name: "University of Southern California",
    type: "NU",
    city: "Los Angeles",
    state: "California",
    code: "CA",
    rank: {
      label: "#27 (tie) National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/rankings/national-universities",
    },
    asOf: "2026-11-22",
    cdsYear: "2025-2026",
    applicants: {
      value: 83488,
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
    },
    admitted: {
      value: 9345,
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
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
      "The 2025-26 CDS reports no Early Decision and gives no EA counts. For fall 2027, USC offers binding Early Decision and non-restrictive Early Action for most majors.",
    sat: {
      value: "1470-1540",
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
    },
    act: {
      value: "32-35",
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
    },
    testPolicy: {
      value: "optional",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
    },
    testNote:
      "Test-optional for 2027-28 entry. SAT/ACT used to show English proficiency are also counted in admission review.",
    needBasedForIntl: {
      value: false,
      source: "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
    },
    intlAidPolicy: {
      value: "merit-only",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
    },
    policyQuote: "USC does not offer need-based financial aid for international applicants.",
    intlAided: {
      value: 931,
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
    },
    intlAvgAward: {
      value: 27577,
      source: "https://oir.usc.edu/wp-content/uploads/sites/3/2026/10/CDS_2025-26_FINAL.pdf",
    },
    intlNote:
      "All international applicants who apply by the deadline are considered for USC Merit Scholarships; no merit award covers the full cost. Proof of funding for the first year is required at application.",
    costYear: "2026-2027",
    tuition: {
      value: 75384,
      source: "https://financialaid.usc.edu/undergraduate-financial-aid/cost-of-attendance/",
    },
    fees: {
      value: 1952,
      source: "https://financialaid.usc.edu/undergraduate-financial-aid/cost-of-attendance/",
    },
    roomBoard: {
      value: 21952,
      source: "https://financialaid.usc.edu/undergraduate-financial-aid/cost-of-attendance/",
    },
    costNote:
      "USC Financial Aid 2026-27 estimate, on campus (housing $13,510 + food $8,442); add a $450 new-student fee. The CDS G1 lists a lower tuition ($66,640), so the college's own cost page is used.",
    ielts: {
      value: null,
      source: null,
    },
    toefl: {
      value: null,
      source: null,
    },
    duolingo: {
      value: 130,
      source: "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
    },
    englishNote:
      "Required for non-native speakers, no waivers. Recommended minimums: TOEFL 100 (5 on the new scale), IELTS 7, PTE 68, Cambridge 185, SAT EBRW 650 or ACT English 27; applicants below them are admissible at reduced rates. Duolingo is accepted only if you cannot sit an approved exam, with a firm minimum of 130.",
    nationalCurriculum: {
      value:
        "USC reviews each application in the context of the applicant's educational system and lists expectations by country in its 'International Qualifications' tool. Official records must come directly from schools or testing agencies, with translations if not in English.",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
    },
    ed1: {
      value: "2026-11-01",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
    },
    ed2: {
      value: "not-offered",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
    },
    ea: {
      value: "2026-11-01",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
    },
    rd: {
      value: "2027-01-10",
      source: "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
    },
    deadlineNote:
      "Most majors: ED and EA November 1, RD January 10. Performing arts majors: RD only, December 1. Dates given without a year; mapped to the 2026-27 cycle.",
    highlight: "Students come from nearly 130 countries.",
    image: {
      src: "/media/colleges/university-of-southern-california.webp",
      card: "/media/colleges/university-of-southern-california-card.webp",
      title: "Bovard Auditorium side view.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Bovard_Auditorium_side_view.jpg",
      author: "EEJCC",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    urls: {
      admissions:
        "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
      international:
        "https://admission.usc.edu/prospective-students/how-to-apply/international-students/",
      aid: "https://financialaid.usc.edu/undergraduate-financial-aid/cost-of-attendance/",
      cds: "https://oir.usc.edu/statistics-data-visualization/common-data-set/",
    },
  },
];
// END GENERATED DATA

export const collegeBySlug = (slug: string) => COLLEGES.find((c) => c.slug === slug);
