// Each US state's top-ranked university, with facts for international applicants.
// Every figure comes from the university's own official pages (or Common Data Set); each has its source URL.
// null = not published / not verified: the site shows "Not published", never an estimate.
// Regions: US Census Bureau regions. Generated from research notes; edit values here directly if updating.

export type Region = "Northeast" | "Midwest" | "South" | "West";
export type TestPolicy = "required" | "optional" | "test-blind";
export type AidPolicy = "need-blind" | "need-aware" | "merit-only" | "limited" | "none";
type Sourced<T> = { value: T | null; source: string | null };

export type StateUniversity = {
  slug: string;
  state: string;
  code: string;
  region: Region;
  university: string;
  city: string;
  rank: { label: string; edition: string; source: string };
  image: {
    src: string;
    card: string;
    title: string;
    page: string;
    author: string;
    licence: string;
    licenceUrl: string | null;
  } | null;
  gpa: Sourced<string>;
  test: Sourced<TestPolicy> & { note: string | null };
  english: {
    ielts: number | null;
    toefl: number | null;
    duolingo: number | null;
    note: string | null;
    source: string | null;
  };
  cost: Sourced<number> & { year: string | null; note: string | null };
  aid: Sourced<AidPolicy> & { note: string | null };
  urls: {
    admissions: string | null;
    international: string | null;
    cost: string | null;
    aid: string | null;
  };
};

export const AS_OF = "2026-11-20";
export const RANK_EDITION = "2027 edition, released September 2026";
export const RANK_RULE =
  "Rule: the highest-ranked university located in the state in U.S. News Best National Universities; a state with no ranked national university shows its flagship public university.";
export const REGIONS: Region[] = ["Northeast", "Midwest", "South", "West"];
export const TEST_LABEL: Record<TestPolicy, string> = {
  required: "Required",
  optional: "Test-optional",
  "test-blind": "Test-blind (not considered)",
};
export const AID_LABEL: Record<AidPolicy, string> = {
  "need-blind": "Need-blind",
  "need-aware": "Need-aware",
  "merit-only": "Merit scholarships only",
  limited: "Limited",
  none: "No aid for international undergraduates",
};

export const STATE_UNIVERSITIES: StateUniversity[] = [
  {
    slug: "alabama",
    state: "Alabama",
    code: "AL",
    region: "South",
    university: "Auburn University",
    city: "Auburn",
    rank: {
      label: "#100 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/alabama.webp",
      card: "/media/universities/alabama-card.webp",
      title: "William J. Samford Hall - Auburn University - IMG 2795.JPG",
      page: "https://commons.wikimedia.org/wiki/File:William_J._Samford_Hall_-_Auburn_University_-_IMG_2795.JPG",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    gpa: {
      value: "Middle 50% (Fall 2025 enrolled, resident and non-resident): 3.87-4.33",
      source: "https://www.auburn.edu/admissions/prospective-students/freshmen/index.php",
    },
    test: {
      value: "required",
      source: "https://www.auburn.edu/admissions/prospective-students/international/index.php",
      note: "ACT or SAT required of all international freshman applicants",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: null,
      note: "PTE 53 also accepted; Duolingo not listed. Students with less English proficiency may enter via Auburn Global.",
      source: "https://www.auburn.edu/admissions/prospective-students/international/index.php",
    },
    cost: {
      value: 56975,
      source: "https://www.auburn.edu/academic/international/isss/cost.php",
      year: "2027-28",
      note: "Estimated cost for international (F/J) undergraduates: tuition and fees $39,658, living expenses $15,000, health insurance $2,317",
    },
    aid: {
      value: null,
      source: null,
      note: "Auburn publishes competitive merit scholarship charts for non-residents (e.g. Academic Presidential Scholarship), but the pages do not state whether international students are eligible.",
    },
    urls: {
      admissions: "https://www.auburn.edu/admissions/prospective-students/freshmen/index.php",
      international:
        "https://www.auburn.edu/admissions/prospective-students/international/index.php",
      cost: "https://www.auburn.edu/academic/international/isss/cost.php",
      aid: "https://www.auburn.edu/administration/finaid/scholarship/",
    },
  },
  {
    slug: "alaska",
    state: "Alaska",
    code: "AK",
    region: "West",
    university: "University of Alaska Fairbanks",
    city: "Fairbanks",
    rank: {
      label: "Alaska's only ranked National University",
      edition: "U.S. News 2026",
      source: "https://uaf.edu/facts/rankings.php",
    },
    image: {
      src: "/media/universities/alaska.webp",
      card: "/media/universities/alaska-card.webp",
      title: "University of Alaska Fairbanks campus view.jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Alaska_Fairbanks_campus_view.jpg",
      author: "Quintin Soloviev",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    gpa: {
      value: "2.5 minimum cumulative GPA (bachelor's admission)",
      source: "https://www.uaf.edu/admissions/apply/ug.php",
    },
    test: {
      value: "optional",
      source: "https://www.uaf.edu/admissions/apply/ug.php",
      note: "UAF does not require ACT/SAT for any undergraduate degree program (since Dec 6, 2023)",
    },
    english: {
      ielts: 6.5,
      toefl: null,
      duolingo: 110,
      note: "TOEFL minimum is published as 4.5, apparently on the new 1-6 TOEFL band scale (no 0-120 iBT figure given); PTE 55 also accepted; exceptions may be requested by email.",
      source: "https://www.uaf.edu/admissions/apply/international/",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: null,
    },
    aid: {
      value: null,
      source: null,
      note: "UAF says scholarships are available whether or not you are an Alaska resident (automatic Nanook Pledge and Alaska Adventure Award), but does not state international students' eligibility.",
    },
    urls: {
      admissions: "https://www.uaf.edu/admissions/apply/ug.php",
      international: "https://www.uaf.edu/admissions/apply/international/",
      cost: "https://www.uaf.edu/finaid/costs/index.php",
      aid: "https://www.uaf.edu/finaid/scholarships.php",
    },
  },
  {
    slug: "arizona",
    state: "Arizona",
    code: "AZ",
    region: "West",
    university: "Arizona State University",
    city: "Tempe",
    rank: {
      label: "#121 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://www.aztechcouncil.org/asu-extends-nation-leading-innovation-streak-to-12-years-as-arizona-schools-see-rankings-shift/",
    },
    image: {
      src: "/media/universities/arizona.webp",
      card: "/media/universities/arizona-card.webp",
      title: "2021 Arizona State University, Tempe Campus, Old Main.jpg",
      page: "https://commons.wikimedia.org/wiki/File:2021_Arizona_State_University,_Tempe_Campus,_Old_Main.jpg",
      author: "Beyond My Ken",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: "3.00 minimum (B or better) from secondary school",
      source: "https://admission.asu.edu/apply/international/first-year",
    },
    test: {
      value: "optional",
      source: "https://admission.asu.edu/apply/international/first-year",
      note: "ACT/SAT not required for admission; may be submitted for course placement or as supplemental information (some programs may consider scores)",
    },
    english: {
      ielts: 6,
      toefl: 61,
      duolingo: 95,
      note: "General-requirement majors. TOEFL 61 applies to exams before Jan 21, 2026; for later exams the minimum is 3.5 overall (new scale). PTE 53, Cambridge 170. Higher minimums for Engineering (IELTS 6.5/TOEFL 79/DET 105), Nursing and Cronkite journalism.",
      source: "https://admission.asu.edu/apply/international/undergrad/english-proficiency",
    },
    cost: {
      value: 69906,
      source: "https://admission.asu.edu/aid/international",
      year: "2026-27",
      note: "International undergraduate estimate incl. base tuition $39,062, surcharge, fees (highest college fee $2,190), on-campus housing and meals $18,819, books, travel, personal, health insurance, international student fee",
    },
    aid: {
      value: "merit-only",
      source: "https://admission.asu.edu/aid/international",
      note: "Internationals do not qualify for federal/state aid; first-year F-1 students may be considered for the merit-based New American University Scholarship.",
    },
    urls: {
      admissions: "https://admission.asu.edu/apply/international/first-year",
      international: "https://admission.asu.edu/apply/international/first-year",
      cost: "https://admission.asu.edu/aid/international",
      aid: "https://admission.asu.edu/aid/international",
    },
  },
  {
    slug: "arkansas",
    state: "Arkansas",
    code: "AR",
    region: "South",
    university: "University of Arkansas",
    city: "Fayetteville",
    rank: {
      label: "#183 National Universities",
      edition: "U.S. News 2026 (2027 edition not confirmed)",
      source:
        "https://www.axios.com/local/nw-arkansas/2025/09/24/charted-natural-state-college-rankings",
    },
    image: {
      src: "/media/universities/arkansas.webp",
      card: "/media/universities/arkansas-card.webp",
      title: "University of Arkansas May 2017 06 (Old Main).jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Arkansas_May_2017_06_(Old_Main).jpg",
      author: "Michael Barera",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://international-students.uark.edu/admissions/undergraduate-students.php",
      note: "SAT/ACT required for academic advisement/placement and for scholarship consideration; applicants without scores take Accuplacer placement test; not stated as an admission requirement",
    },
    english: {
      ielts: 6.5,
      toefl: null,
      duolingo: 110,
      note: "TOEFL iBT minimum is published as 4.0 (new 1-6 band scale; no 0-120 figure on the page). PTE-A 58; IELTS General Training not accepted.",
      source: "https://international-students.uark.edu/admissions/english-language-proficiency.php",
    },
    cost: {
      value: 56256,
      source: "https://international-students.uark.edu/cost-and-funding/",
      year: null,
      note: "Non-resident undergraduate (dorm/off campus), 30 credit hours: tuition $30,604, fees $2,580, books, room $10,144, board $5,550, personal, transportation; page says 'estimates based on current cost of attendance' without a year",
    },
    aid: {
      value: null,
      source: null,
      note: null,
    },
    urls: {
      admissions: "https://international-students.uark.edu/admissions/undergraduate-students.php",
      international:
        "https://international-students.uark.edu/admissions/undergraduate-students.php",
      cost: "https://international-students.uark.edu/cost-and-funding/",
      aid: "https://scholarships.uark.edu/index.php/schlprograms/default",
    },
  },
  {
    slug: "california",
    state: "California",
    code: "CA",
    region: "West",
    university: "California Institute of Technology (Caltech)",
    city: "Pasadena",
    rank: {
      label: "#5 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/california.webp",
      card: "/media/universities/california-card.webp",
      title: "Beckman Institute at Caltech.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Beckman_Institute_at_Caltech.jpg",
      author: "GtDX8NNO3Efn2oF6q0s3",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
      note: "SAT or ACT required (AP/IB scores also requested if taken)",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 130,
      note: "Required unless native language is English or English is the main language of instruction (then strongly recommended). Minimum 7 in each IELTS area; TOEFL 100 (25 per section) for tests before Jan 21, 2026, or 5 (5 per section) on the new scale after; DET 130.",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: null,
    },
    aid: {
      value: "need-aware",
      source:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
      note: "Caltech meets 100% of demonstrated need for all admitted students but is need-aware for international applicants because international aid funds are limited.",
    },
    urls: {
      admissions: "https://www.admissions.caltech.edu/apply/first-year-applicants",
      international:
        "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
      cost: "https://www.finaid.caltech.edu/costs",
      aid: "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    },
  },
  {
    slug: "colorado",
    state: "Colorado",
    code: "CO",
    region: "West",
    university: "Colorado School of Mines",
    city: "Golden",
    rank: {
      label: "#80 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/colorado.webp",
      card: "/media/universities/colorado-card.webp",
      title: "Mines-GuggenheimHall.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Mines-GuggenheimHall.jpg",
      author: "Luke Jones from Anchorage",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://undergraduate-admissions.mines.edu/international-first-year-requirements/",
      note: "Mines does not require SAT/ACT from international students unless planning to play an NCAA sport",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: 105,
      note: "IELTS no band below 6.0; TOEFL 79 with section minimums for tests before Jan 20, 2026 (4.5/4 band scale on the new test); Duolingo no subscore below 100; proof needed only after admission, before enrolling.",
      source: "https://undergraduate-admissions.mines.edu/international-first-year-requirements/",
    },
    cost: {
      value: 71470,
      source: "https://finaid.mines.edu/cost-of-attendance-undergraduate/",
      year: "2026-27",
      note: "Non-resident undergraduate, on campus: tuition $44,790, fees $3,206, housing/food $18,900, books, personal and other items",
    },
    aid: {
      value: null,
      source: null,
      note: null,
    },
    urls: {
      admissions: "https://undergraduate-admissions.mines.edu/first-year/",
      international:
        "https://undergraduate-admissions.mines.edu/international-first-year-requirements/",
      cost: "https://finaid.mines.edu/cost-of-attendance-undergraduate/",
      aid: "https://www.mines.edu/undergraduate-admissions/international-faq/",
    },
  },
  {
    slug: "connecticut",
    state: "Connecticut",
    code: "CT",
    region: "Northeast",
    university: "Yale University",
    city: "New Haven",
    rank: {
      label: "#4 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/connecticut.webp",
      card: "/media/universities/connecticut-card.webp",
      title: "2014-04-17-Yale-Old-Campus-Courtyard-Harkness-Tower.jpg",
      page: "https://commons.wikimedia.org/wiki/File:2014-04-17-Yale-Old-Campus-Courtyard-Harkness-Tower.jpg",
      author: "Gunnar Klack",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://admissions.yale.edu/standardized-testing",
      note: "All first-year applicants must submit ACT or SAT scores (AP/IB optional)",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 120,
      note: "Not minimums: Yale says its most competitive applicants typically have IELTS 7+, TOEFL 100+ (tests before Jan 21, 2026) or 5+ on the new scale, DET 120+. Required for non-native speakers without 2+ years in an English-medium school.",
      source: "https://admissions.yale.edu/standardized-testing",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: null,
    },
    aid: {
      value: "need-blind",
      source: "https://admissions.yale.edu/international",
      note: "Yale considers all applicants, including international, without regard to ability to pay and meets 100% of demonstrated need.",
    },
    urls: {
      admissions: "https://admissions.yale.edu/",
      international: "https://admissions.yale.edu/international",
      cost: "https://finaid.yale.edu/coa",
      aid: "https://finaid.yale.edu/",
    },
  },
  {
    slug: "delaware",
    state: "Delaware",
    code: "DE",
    region: "South",
    university: "University of Delaware",
    city: "Newark",
    rank: {
      label: "#85 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/delaware.webp",
      card: "/media/universities/delaware-card.webp",
      title: "UDel Memorial and Magnolia Circle.JPG",
      page: "https://commons.wikimedia.org/wiki/File:UDel_Memorial_and_Magnolia_Circle.JPG",
      author: "Cargoudel",
      licence: "CC BY-SA 3.0",
      licenceUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://www.udel.edu/apply/undergraduate-admissions/international-students/",
      note: "International students are not required to submit SAT or ACT scores",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: 110,
      note: "Direct-admission minimums; TOEFL 79 for tests before Jan 21, 2026, 4 on the new scale; PTE 53. Lower scores lead to Academic Transitions pathway (e.g. TOEFL 65-78, IELTS 5.5-6.0, DET 95-109); TOEFL 79-89 admitted with Accelerate-U Delaware support.",
      source: "https://www.udel.edu/apply/undergraduate-admissions/international-students/",
    },
    cost: {
      value: 70412,
      source:
        "https://www.udel.edu/apply/undergraduate-admissions/financing-your-degree/international-students/",
      year: "2026-27",
      note: "International undergraduate, Newark campus: tuition $42,470, fees $2,930, orientation $260, medical insurance $3,888, housing $9,286, food $7,328, indirect $4,250",
    },
    aid: {
      value: "merit-only",
      source:
        "https://www.udel.edu/apply/undergraduate-admissions/financing-your-degree/international-students/",
      note: "No need-based aid for international students; all international freshmen are automatically considered for merit scholarships ($10,000-$15,000 per year) and Distinguished Scholars awards.",
    },
    urls: {
      admissions: "https://www.udel.edu/apply/undergraduate-admissions/",
      international: "https://www.udel.edu/apply/undergraduate-admissions/international-students/",
      cost: "https://www.udel.edu/apply/undergraduate-admissions/financing-your-degree/international-students/",
      aid: "https://www.udel.edu/apply/undergraduate-admissions/financing-your-degree/international-students/",
    },
  },
  {
    slug: "florida",
    state: "Florida",
    code: "FL",
    region: "South",
    university: "University of Florida",
    city: "Gainesville",
    rank: {
      label: "#34 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/florida.webp",
      card: "/media/universities/florida-card.webp",
      title: "Century Tower (University of Florida).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Century_Tower_(University_of_Florida).jpg",
      author: "Kate Haskell from Gainesville, USA",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://admissions.ufl.edu/apply/freshman/international",
      note: "Per Florida Board of Governors regulation 6.002, all first-year students must submit ACT, CLT or SAT (2026 freshman middle 50%: ACT 32-35, SAT 1420-1520)",
    },
    english: {
      ielts: null,
      toefl: null,
      duolingo: null,
      note: "No undergraduate freshman English test minimums found on UF's freshman international or international admissions guide pages.",
      source: null,
    },
    cost: {
      value: 59394,
      source: "https://admissions.ufl.edu/international-admissions-guide",
      year: "2026-27",
      note: "Annual estimate for F-1/J-1 students: tuition (24 credits) $31,869, books, transport, living $17,755, personal, loan fees, mandatory health insurance $3,185, between-term $1,000. (Out-of-state on/off-campus budget is $54,010 for 30 credits.)",
    },
    aid: {
      value: "limited",
      source: "https://admissions.ufl.edu/international-admissions-guide",
      note: "Internationals are not eligible for federal aid; a limited number of admissions scholarships are awarded to admitted international freshmen who meet application deadlines.",
    },
    urls: {
      admissions: "https://admissions.ufl.edu/apply/freshman/",
      international: "https://admissions.ufl.edu/apply/freshman/international",
      cost: "https://admissions.ufl.edu/international-admissions-guide",
      aid: "https://www.sfa.ufl.edu/international/",
    },
  },
  {
    slug: "georgia",
    state: "Georgia",
    code: "GA",
    region: "South",
    university: "Emory University",
    city: "Atlanta",
    rank: {
      label: "#23 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.wabe.org/georgia-colleges-and-universities-rank-in-national-u-s-news-and-world-reports-lists/",
    },
    image: {
      src: "/media/universities/georgia.webp",
      card: "/media/universities/georgia-card.webp",
      title: "Asa Griggs Candler Library on the Quad at Emory University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Asa_Griggs_Candler_Library_on_the_Quad_at_Emory_University.jpg",
      author: "Marc Merlin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://apply.emory.edu/apply/first-year/tips/standardized-exam-policies.html",
      note: "Test optional for first-year students starting fall 2027; SAT/ACT not required",
    },
    english: {
      ielts: 7.5,
      toefl: 100,
      duolingo: 130,
      note: "Recommended, not strict cutoffs: IELTS 7.5 overall; TOEFL iBT 100 (old scale) or 5.5+ on the new 1-6 scale; most competitive applicants score above 130 on DET. English proficiency testing is still expected of international applicants.",
      source: "https://apply.emory.edu/apply/first-year/tips/standardized-exam-policies.html",
    },
    cost: {
      value: 93128,
      source:
        "https://news.emory.edu/stories/2026/03/emory-sets-undergraduate-tuition-2026-27-academic-year-affirms-commitment-expanding",
      year: "2026-27",
      note: "Combined undergraduate tuition ($70,300), fees, room and board per Emory's 2026-27 announcement; excludes books, personal and travel costs",
    },
    aid: {
      value: "limited",
      source: "https://studentaid.emory.edu/undergraduate/apply/new-students/international.html",
      note: "Emory offers need-based aid packages to a select group of international students each year (must apply Regular Decision during admission) and merit scholarships via the Emory University Scholar programs to a limited number.",
    },
    urls: {
      admissions: "https://apply.emory.edu/",
      international: "https://apply.emory.edu/apply/international-applicants.html",
      cost: "https://www.emory.edu/admission-aid/tuition-cost",
      aid: "https://studentaid.emory.edu/undergraduate/apply/new-students/international.html",
    },
  },
  {
    slug: "hawaii",
    state: "Hawaii",
    code: "HI",
    region: "West",
    university: "University of Hawaiʻi at Mānoa",
    city: "Honolulu",
    rank: {
      label: "#186 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://mauinow.com/2026/09/27/university-of-hawaii-4-year-campuses-earn-high-marks/",
    },
    image: {
      src: "/media/universities/hawaii.webp",
      card: "/media/universities/hawaii-card.webp",
      title: "Hawaii Hall, University of Hawaiʻi west side.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Hawaii_Hall,_University_of_Hawai%CA%BBi_west_side.jpg",
      author: "Sdkb",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: "3.0 minimum (secondary school GPA comparable to a U.S. B, 3.00 on 4.00 scale)",
      source: "https://manoa.hawaii.edu/admissions/international/index.html",
    },
    test: {
      value: "optional",
      source: "https://manoa.hawaii.edu/admissions/freshman/",
      note: "Test-optional with 'Do No Harm' policy; some scholarships/direct-entry programs may require scores",
    },
    english: {
      ielts: 5.5,
      toefl: 61,
      duolingo: 90,
      note: "Minimums for admission via the English Language Institute (ELI): TOEFL iBT 61, IELTS 5.5, DET 90. Scores of TOEFL 100 / IELTS 7.0 / DET 135 exempt from ELI. Requirements may vary by program.",
      source: "https://manoa.hawaii.edu/admissions/international/index.html",
    },
    cost: {
      value: 55760,
      source: "https://manoa.hawaii.edu/fas/cost/2026-2027-cost-of-attendance/",
      year: "2026-27",
      note: "Non-resident undergraduate, full-time (12 credits/semester), living on campus; includes tuition $33,792 and fees $914",
    },
    aid: {
      value: "merit-only",
      source: "https://www.hawaii.edu/issmanoa/?page_id=2524",
      note: "Merit scholarships for F-1 students, e.g. International Undergraduate Student Scholarship ($10,000/yr, 3.0 GPA) and Manoa International Excellence Scholarship (resident tuition rate).",
    },
    urls: {
      admissions: "https://manoa.hawaii.edu/admissions/",
      international: "https://manoa.hawaii.edu/admissions/international/index.html",
      cost: "https://manoa.hawaii.edu/fas/cost/2026-2027-cost-of-attendance/",
      aid: "https://www.hawaii.edu/issmanoa/?page_id=2533",
    },
  },
  {
    slug: "idaho",
    state: "Idaho",
    code: "ID",
    region: "West",
    university: "University of Idaho",
    city: "Moscow",
    rank: {
      label: "#208 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.uidaho.edu/about/rankings-facts",
    },
    image: {
      src: "/media/universities/idaho.webp",
      card: "/media/universities/idaho-card.webp",
      title: "University of Idaho Administration Building.jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Idaho_Administration_Building.jpg",
      author: "Apstrinka",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: "2.5 minimum on a 4.0 scale (international first-year, secondary school GPA)",
      source: "https://www.uidaho.edu/international/admissions",
    },
    test: {
      value: "optional",
      source: "https://uidaho.edu/admissions/apply/first-year/admission-requirements",
      note: "International first-year requirements list no SAT/ACT requirement; for domestic first-years scores are not required with GPA 3.0+ (required at GPA 2.60-2.99)",
    },
    english: {
      ielts: 6,
      toefl: 70,
      duolingo: 100,
      note: "Minimums: TOEFL 70 (tests before 21 Jan 2026) or 4.0 (after); IELTS 6.0; DET 100; PTE 48; SAT ERW 550 also accepted.",
      source: "https://www.uidaho.edu/international/admissions",
    },
    cost: {
      value: 50267,
      source: "https://www.uidaho.edu/financial-aid/cost-of-attendance",
      year: "2026-27",
      note: "Non-resident on-campus COA (tuition & fees $29,300, housing & meals $12,995, books, transport, personal); internationals also pay $380/semester international fee and ~$2,412/yr health insurance. Automatic Invitation to Idaho award reduces this to $34,505",
    },
    aid: {
      value: "merit-only",
      source: "https://www.uidaho.edu/financial-aid/scholarships/international-scholarship",
      note: "New international students automatically receive the Invitation to Idaho reduced tuition; #YouAreWelcomeHere scholarship covers 50% of tuition for selected first-years.",
    },
    urls: {
      admissions: "https://www.uidaho.edu/admissions-apply/first-year-students",
      international: "https://www.uidaho.edu/international/admissions",
      cost: "https://www.uidaho.edu/financial-aid/cost-of-attendance",
      aid: "https://www.uidaho.edu/financial-aid/scholarships/international-scholarship",
    },
  },
  {
    slug: "illinois",
    state: "Illinois",
    code: "IL",
    region: "Midwest",
    university: "Northwestern University",
    city: "Evanston",
    rank: {
      label: "#9 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/illinois.webp",
      card: "/media/universities/illinois-card.webp",
      title: "Deering front.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Deering_front.jpg",
      author: "Madcoverboy (talk)",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admissions.northwestern.edu/faqs/standardized-testing-policy/",
      note: "Test-optional for first-year and transfer applicants (2026-27 application cycle, fall 2027 entry)",
    },
    english: {
      ielts: null,
      toefl: null,
      duolingo: null,
      note: "DET, IELTS or TOEFL iBT required if first language/schooling not English; Northwestern states there is no minimum score.",
      source: "https://admissions.northwestern.edu/faqs/international-applicants/",
    },
    cost: {
      value: 99375,
      source:
        "https://undergradaid.northwestern.edu/aid-basics-eligibility/cost-of-attendance.html",
      year: "2026-27",
      note: "On-campus COA: tuition $71,802, fees $1,260, housing & meals $22,941, books, personal, loan fees; excludes transportation and visa costs",
    },
    aid: {
      value: "need-aware",
      source:
        "https://undergradaid.northwestern.edu/apply-for-aid/prospective-international-undocumented-students/",
      note: "International first-year applicants requesting need-based aid are evaluated in a need-aware manner; no need-based aid for international transfers.",
    },
    urls: {
      admissions: "https://admissions.northwestern.edu/apply/",
      international: "https://admissions.northwestern.edu/faqs/international-applicants/",
      cost: "https://undergradaid.northwestern.edu/aid-basics-eligibility/cost-of-attendance.html",
      aid: "https://undergradaid.northwestern.edu/apply-for-aid/prospective-international-undocumented-students/",
    },
  },
  {
    slug: "indiana",
    state: "Indiana",
    code: "IN",
    region: "Midwest",
    university: "University of Notre Dame",
    city: "Notre Dame",
    rank: {
      label: "#20 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/indiana.webp",
      card: "/media/universities/indiana-card.webp",
      title: "Golden Dome frontal.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Golden_Dome_frontal.jpg",
      author: "Eccekevin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
      note: "Test-optional for 2026-27 applicants (fall 2027 entry); SAT or ACT required again from fall 2028 entry",
    },
    english: {
      ielts: 7.5,
      toefl: 100,
      duolingo: 125,
      note: "Strongly recommended scores, not hard minimums: TOEFL iBT 100 (Speaking 25) on pre-Feb-2026 scale or 5.5 average on new scale; IELTS 7.5; DET 125. Required if first language/schooling not English.",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
    },
    cost: {
      value: 91986,
      source: "https://financialaid.nd.edu/costs-and-affordability/",
      year: "2026-27",
      note: "Average COA: tuition $69,280, fees $514, housing & food $18,992, books, personal, transportation",
    },
    aid: {
      value: "need-blind",
      source:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
      note: "Need-blind admission for all students, including internationals, and meets full demonstrated need (CSS Profile required).",
    },
    urls: {
      admissions: "https://admissions.nd.edu/",
      international:
        "https://admissions.nd.edu/information-for/international-applicants/application-information/",
      cost: "https://financialaid.nd.edu/costs-and-affordability/",
      aid: "https://financialaid.nd.edu/apply-or-renew/international-students/",
    },
  },
  {
    slug: "iowa",
    state: "Iowa",
    code: "IA",
    region: "Midwest",
    university: "University of Iowa",
    city: "Iowa City",
    rank: {
      label: "#100 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/iowa.webp",
      card: "/media/universities/iowa-card.webp",
      title: "University of Iowa Old Capitol.jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Iowa_Old_Capitol.jpg",
      author: "Phil Roeder from Des Moines, IA, USA",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    gpa: {
      value: "3.0 minimum on academic courses (applicants from high schools outside the U.S.)",
      source: "https://admissions.uiowa.edu/international-first-year-admission-requirements",
    },
    test: {
      value: "optional",
      source: "https://admissions.uiowa.edu/international-first-year-admission-requirements",
      note: "Test-optional; SAT/ACT not required for internationals schooled outside the U.S., but required for academic scholarships, Tippie direct admission and Honors",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: null,
      note: "Minimums: TOEFL iBT 80 (subscores 17+) before Jan 2026 or 4.0 (subscores 3.5+) after; IELTS 6.5 (subscores 6.0+). Undergraduate page lists no Duolingo score.",
      source: "https://admissions.uiowa.edu/english-proficiency-requirements",
    },
    cost: {
      value: 53042,
      source: "https://admissions.uiowa.edu/finances/estimated-costs-international-students",
      year: "2026-27",
      note: "International student estimate, Liberal Arts & Sciences: tuition & fees $35,442, living $14,022, health insurance $2,628, books $950; some additional fees excluded; other colleges $54,630-$56,916",
    },
    aid: {
      value: "merit-only",
      source: "https://admissions.uiowa.edu/finances/estimated-costs-international-students",
      note: "International students do not qualify for need-based aid; competitive, renewable scholarships are available.",
    },
    urls: {
      admissions: "https://uiowa.edu/admissions/undergraduate-admissions",
      international: "https://admissions.uiowa.edu/international-first-year-admission-requirements",
      cost: "https://admissions.uiowa.edu/finances/estimated-costs-international-students",
      aid: "https://admissions.uiowa.edu/finances/estimated-costs-international-students",
    },
  },
  {
    slug: "kansas",
    state: "Kansas",
    code: "KS",
    region: "Midwest",
    university: "University of Kansas",
    city: "Lawrence",
    rank: {
      label: "#148 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-kansas-1948",
    },
    image: {
      src: "/media/universities/kansas.webp",
      card: "/media/universities/kansas-card.webp",
      title: "Fraser Hall (University of Kansas).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Fraser_Hall_(University_of_Kansas).jpg",
      author: "Gen. Quon",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    gpa: {
      value:
        "2.5 minimum on a 4.0 scale (international freshman); 3.25 for assured admission to the College of Liberal Arts & Sciences",
      source: "https://world.ku.edu/requirements",
    },
    test: {
      value: "optional",
      source: "https://admissions.ku.edu/apply",
      note: "Test-optional; general admission and institutional scholarships require only GPA",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: null,
      note: "Scores must be submitted, but KU says a minimum is not required for admission; IELTS 6.5 (6.0 sub) and TOEFL iBT 79 (18 sub; or 4.5 on new 1-6 scale from 21 Jan 2026) are minimums for full-time degree coursework. Duolingo accepted, no minimum published (AEC test still required).",
      source: "https://world.ku.edu/english-proficiency",
    },
    cost: {
      value: 52278,
      source: "https://world.ku.edu/costs",
      year: null,
      note: "International undergraduate estimate: tuition & fees (30 credit hours, ISS, course, campus, infrastructure fees) $33,854 + living expenses incl. health insurance $18,424; page does not state the year",
    },
    aid: {
      value: "merit-only",
      source: "https://admissions.ku.edu/afford/scholarships",
      note: "Renewable GPA-tiered freshman merit scholarships ($32,000-$64,000 over four years) are open to out-of-state and international students; no need-based aid identified for internationals.",
    },
    urls: {
      admissions: "https://admissions.ku.edu/",
      international: "https://world.ku.edu/requirements",
      cost: "https://world.ku.edu/costs",
      aid: "https://admissions.ku.edu/afford/scholarships",
    },
  },
  {
    slug: "kentucky",
    state: "Kentucky",
    code: "KY",
    region: "South",
    university: "University of Kentucky",
    city: "Lexington",
    rank: {
      label: "#148 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-kentucky-1989",
    },
    image: {
      src: "/media/universities/kentucky.webp",
      card: "/media/universities/kentucky-card.webp",
      title: "Main Building - University of Kentucky - DSC09119.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Main_Building_-_University_of_Kentucky_-_DSC09119.JPG",
      author: "Daderot",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://international.uky.edu/apply/admission-requirements",
      note: "ACT/SAT optional for international freshmen; required for engineering programs",
    },
    english: {
      ielts: 6,
      toefl: 71,
      duolingo: 105,
      note: "Minimums: TOEFL iBT 71 (tests on/before 20 Jan 2026) or 4+ overall and subscores (from 21 Jan 2026); TOEFL Essentials 7.5; IELTS 6.0; Duolingo 105.",
      source: "https://international.uky.edu/apply/admission-requirements",
    },
    cost: {
      value: 60838,
      source:
        "https://studentsuccess.uky.edu/financial-aid-and-scholarships/estimated-cost-attendance",
      year: "2026-27",
      note: "Non-resident undergraduate, on campus: tuition & fees $35,846, food & housing $17,048, books, travel, personal, loan fee. International Center lists a $57,800 minimum funding requirement (incl. $3,720 health insurance) for the I-20",
    },
    aid: {
      value: "merit-only",
      source: "https://international.uky.edu/apply/tuition",
      note: "International students are expected to finance their education; merit scholarships for international freshmen are available.",
    },
    urls: {
      admissions: "https://admission.uky.edu/",
      international: "https://international.uky.edu/apply/admission-requirements",
      cost: "https://studentsuccess.uky.edu/financial-aid-and-scholarships/estimated-cost-attendance",
      aid: "https://international.uky.edu/apply/scholarships",
    },
  },
  {
    slug: "louisiana",
    state: "Louisiana",
    code: "LA",
    region: "South",
    university: "Tulane University",
    city: "New Orleans",
    rank: {
      label: "#59 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/louisiana.webp",
      card: "/media/universities/louisiana-card.webp",
      title: "Tulane University - Gibson Hall from St. Charles Avenue, February 2026.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Tulane_University_-_Gibson_Hall_from_St._Charles_Avenue,_February_2026.jpg",
      author: "ajay_suresh",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    gpa: {
      value: "Average 3.67 (recalculated, unweighted), Class of 2029 enrolled",
      source: "https://admission.tulane.edu/apply/getting-into-tulane/new-class-profile",
    },
    test: {
      value: "optional",
      source: "https://admission.tulane.edu/apply/instructions/standardized-tests",
      note: "Test-optional for fall 2027 entry (required only for Pathways to Medicine)",
    },
    english: {
      ielts: 6.5,
      toefl: 95,
      duolingo: 130,
      note: "Typical scores of successful applicants (TOEFL 95+ pre-21 Jan 2026 or 5.0+ new score report; IELTS 6.5+; DET 130+); page labels the TOEFL figure a minimum. Waivable with SAT ERW 600+/ACT English 27+.",
      source: "https://admission.tulane.edu/international",
    },
    cost: {
      value: 98710,
      source: "https://admission.tulane.edu/tuition-aid/cost",
      year: "2026-27",
      note: "First-year full-time on-campus COA: tuition $70,622, fees $4,514, housing $11,758, meals $8,780, books, misc, loan fees; transportation varies",
    },
    aid: {
      value: "limited",
      source: "https://admission.tulane.edu/international",
      note: "Tulane offers limited need-based financial assistance to international students; CSS Profile due 15 February.",
    },
    urls: {
      admissions: "https://admission.tulane.edu/",
      international: "https://admission.tulane.edu/international",
      cost: "https://admission.tulane.edu/tuition-aid/cost",
      aid: "https://admission.tulane.edu/international",
    },
  },
  {
    slug: "maine",
    state: "Maine",
    code: "ME",
    region: "Northeast",
    university: "University of Maine",
    city: "Orono",
    rank: {
      label: "#261 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.bangordailynews.com/?p=3713959",
    },
    image: {
      src: "/media/universities/maine.webp",
      card: "/media/universities/maine-card.webp",
      title: "Outside Hancock Hall - panoramio.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Outside_Hancock_Hall_-_panoramio.jpg",
      author: "Fredlyfish4",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://go.umaine.edu/apply/",
      note: "100% test-optional for first-year applicants; SAT/ACT not required for internationals",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: 110,
      note: "Minimums: TOEFL iBT 79 (pre-Jan 2026) or 4.5 (post-Jan 2026), IELTS 6.5, DET 110, PTE 53; waivable with SAT R/W 550+ or ACT English 24+. Conditional admission via Intensive English Institute possible.",
      source: "https://umaine.edu/admissions/apply/international-undergraduate-admissions/",
    },
    cost: {
      value: 57006,
      source: "https://umaine.edu/sfs/costs/",
      year: "2026-27",
      note: "Orono undergraduate, out-of-state and international, on campus: tuition $38,340, fees $1,070, housing & food $14,696, books $1,000, travel & misc $2,200; health insurance required for internationals and not included",
    },
    aid: {
      value: "merit-only",
      source:
        "https://umaine.edu/admissions/cost-aid/merit-scholarships/international-scholarships-26-27/",
      note: "Admissions-based merit scholarships (e.g. Flagship Leaders $9,000-$12,000/yr, Flagship Match $16,200/yr) based on high school GPA and rigor, no separate application.",
    },
    urls: {
      admissions: "https://go.umaine.edu/apply/",
      international: "https://umaine.edu/admissions/apply/international-undergraduate-admissions/",
      cost: "https://umaine.edu/sfs/costs/",
      aid: "https://umaine.edu/admissions/cost-aid/merit-scholarships/international-scholarships-26-27/",
    },
  },
  {
    slug: "maryland",
    state: "Maryland",
    code: "MD",
    region: "South",
    university: "Johns Hopkins University",
    city: "Baltimore",
    rank: {
      label: "#9 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/maryland.webp",
      card: "/media/universities/maryland-card.webp",
      title: "Gilman Hall, Johns Hopkins University, Baltimore, MD.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Gilman_Hall,_Johns_Hopkins_University,_Baltimore,_MD.jpg",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    gpa: {
      value: "Average unweighted GPA 3.95 (Homewood Class of 2030)",
      source: "https://apply.jhu.edu/fast-facts/",
    },
    test: {
      value: "required",
      source:
        "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/standardized-testing/",
      note: "SAT or ACT required for first-year applicants",
    },
    english: {
      ielts: 7,
      toefl: null,
      duolingo: 120,
      note: "Recommended (typical competitive) benchmarks, not hard minimums: TOEFL iBT total 5 on the new 1-6 scale, IELTS 7.0+ on each band, DET 120+, Cambridge C1/C2 185+.",
      source:
        "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/standardized-testing/",
    },
    cost: {
      value: 94858,
      source: "https://sfs.jhu.edu/cost-tuition/",
      year: "2026-27",
      note: "First-year on-campus COA: tuition $68,670, one-time matriculation fee $500, housing $13,073, meals $8,894, personal, books, transportation",
    },
    aid: {
      value: "need-aware",
      source: "https://apply.jhu.edu/international-applicants/",
      note: "Need-aware for international students, but Hopkins meets 100% of demonstrated need for all admitted students, including internationals; no aid for international transfers.",
    },
    urls: {
      admissions: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/",
      international: "https://apply.jhu.edu/international-applicants/",
      cost: "https://sfs.jhu.edu/cost-tuition/",
      aid: "https://apply.jhu.edu/international-applicants/",
    },
  },
  {
    slug: "massachusetts",
    state: "Massachusetts",
    code: "MA",
    region: "Northeast",
    university: "Massachusetts Institute of Technology",
    city: "Cambridge",
    rank: {
      label: "#1 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/",
    },
    image: {
      src: "/media/universities/massachusetts.webp",
      card: "/media/universities/massachusetts-card.webp",
      title: "2017 Maclaurin Buildings (MIT Building 10) and Great Dome.jpg",
      page: "https://commons.wikimedia.org/wiki/File:2017_Maclaurin_Buildings_(MIT_Building_10)_and_Great_Dome.jpg",
      author: "Beyond My Ken",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
      note: "SAT or ACT required for first-year and transfer applicants",
    },
    english: {
      ielts: 7,
      toefl: 90,
      duolingo: 120,
      note: "Minimums shown (recommended: IELTS 7.5, TOEFL 100, Duolingo 125). TOEFL taken on/after 21 Jan 2026 uses new 1-6 scale: minimum 5, recommended 5.5. English test strongly recommended (not strictly required) for non-native speakers with under five years of English use.",
      source: "https://mitadmissions.org/apply/firstyear/tests-scores/",
    },
    cost: {
      value: 92760,
      source: "https://sfs.mit.edu/undergraduate-students/the-cost-of-attendance/coa/",
      year: "2026-27",
      note: "Tuition, student life fee, housing, food, books and personal expenses; travel allowance not included. Same sticker price for all undergraduates.",
    },
    aid: {
      value: "need-blind",
      source: "https://mitadmissions.org/help/faq/international-admissions/",
      note: "Need-blind admission and full demonstrated need met for all students, international and domestic; aid is need-based only.",
    },
    urls: {
      admissions: "https://mitadmissions.org/apply/firstyear/",
      international: "https://mitadmissions.org/help/faq/international-admissions/",
      cost: "https://sfs.mit.edu/undergraduate-students/the-cost-of-attendance/coa/",
      aid: "https://mitadmissions.org/help/faq/international-admissions/",
    },
  },
  {
    slug: "michigan",
    state: "Michigan",
    code: "MI",
    region: "Midwest",
    university: "University of Michigan",
    city: "Ann Arbor",
    rank: {
      label: "#25 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/",
    },
    image: {
      src: "/media/universities/michigan.webp",
      card: "/media/universities/michigan-card.webp",
      title:
        "Law Quadrangle, University of Michigan, University Avenue and State Street, Ann Arbor, MI - 54381556965.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Law_Quadrangle,_University_of_Michigan,_University_Avenue_and_State_Street,_Ann_Arbor,_MI_-_54381556965.jpg",
      author: "w_lemay",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    gpa: {
      value: "Average 3.9; 93.9% had 3.75 or higher (CDS 2025-26)",
      source: "https://obp.umich.edu/wp-content/uploads/pubdata/cds/cds_2025-26_umaa.pdf",
    },
    test: {
      value: "optional",
      source: "https://admissions.umich.edu/apply/international-applicants/requirements-deadlines",
      note: "Applicants choose whether to have an ACT/SAT score considered",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: null,
      note: "Published as expected score ranges rather than hard minimums: TOEFL iBT 100 range (sections 23+ listening/reading, 21+ speaking/writing; new scale 5-6, sections 5+), IELTS 7.0 range (sections 6.5+). Duolingo not listed by Ann Arbor admissions.",
      source: "https://admissions.umich.edu/apply/international-applicants/exams-visas",
    },
    cost: {
      value: 88394,
      source:
        "https://obp.umich.edu/wp-content/uploads/pubdata/factsfigures/estimatedcost_umaa_2026-27.pdf",
      year: "2026-27",
      note: "Out-of-state lower-division estimated COA (tuition/fees, living, books, transport, personal); international students also pay a $500 International Fee; upper division $93,096.",
    },
    aid: {
      value: "limited",
      source: "https://finaid.umich.edu/apply-aid/international-students",
      note: "International students on temporary visas are not eligible for financial aid and are expected to pay full cost; scholarship funding is limited.",
    },
    urls: {
      admissions: "https://admissions.umich.edu/",
      international:
        "https://admissions.umich.edu/apply/international-applicants/requirements-deadlines",
      cost: "https://obp.umich.edu/wp-content/uploads/pubdata/factsfigures/estimatedcost_umaa_2026-27.pdf",
      aid: "https://finaid.umich.edu/apply-aid/international-students",
    },
  },
  {
    slug: "minnesota",
    state: "Minnesota",
    code: "MN",
    region: "Midwest",
    university: "University of Minnesota Twin Cities",
    city: "Minneapolis",
    rank: {
      label: "#59 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/minnesota.webp",
      card: "/media/universities/minnesota-card.webp",
      title: "University of Minnesota - Northrop Memorial Auditorium (3098267031).jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Minnesota_-_Northrop_Memorial_Auditorium_(3098267031).jpg",
      author: "A Gude",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source:
        "https://admissions.tc.umn.edu/admissions/freshman-admission/freshman-admissions-overview",
      note: "ACT/SAT not required through fall 2027 entry (some pages say through fall 2029); recommended for international applicants",
    },
    english: {
      ielts: 6.5,
      toefl: null,
      duolingo: 120,
      note: "Minimums from spring 2027 application period: IELTS Academic 6.5 overall and writing; Duolingo 120 overall and writing; TOEFL iBT 4.5 overall and writing on the new 1-6 scale (no old-scale minimum published). Conditional admission considered from TOEFL 3.5 / IELTS 5.5 / Duolingo 95.",
      source:
        "https://admissions.tc.umn.edu/admissions/international-admission/english-proficiency-information",
    },
    cost: {
      value: 67085,
      source:
        "https://admissions.tc.umn.edu/cost-aid/cost-aid-scholarships/costs-scholarships-and-visas-international-students",
      year: "2026-27",
      note: "International undergraduate 9-month budget: tuition/fees $44,743, books $1,000, health insurance $3,590, living $17,752 (12-month I-20 budget $73,002). Some colleges add a tuition surcharge.",
    },
    aid: {
      value: "merit-only",
      source:
        "https://admissions.tc.umn.edu/cost-aid/cost-aid-scholarships/costs-scholarships-and-visas-international-students",
      note: "International freshmen are automatically considered for the merit-based Global Excellence Scholarship; F-1 students are ineligible for federal/state aid, with only small separate need-based ISSS scholarships.",
    },
    urls: {
      admissions:
        "https://admissions.tc.umn.edu/admissions/freshman-admission/freshman-admissions-overview",
      international: "https://admissions.tc.umn.edu/admissions/welcome-international-students",
      cost: "https://admissions.tc.umn.edu/cost-aid/cost-aid-scholarships/costs-scholarships-and-visas-international-students",
      aid: "https://isss.umn.edu/students/support-services/funding-basic-page",
    },
  },
  {
    slug: "mississippi",
    state: "Mississippi",
    code: "MS",
    region: "South",
    university: "University of Mississippi",
    city: "Oxford",
    rank: {
      label: "#179 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.wapt.com/article/ole-miss-tops-mississippi-colleges-in-2027-us-news-rankings/73858327",
    },
    image: {
      src: "/media/universities/mississippi.webp",
      card: "/media/universities/mississippi-card.webp",
      title:
        "Facade of Lyceum Building - University of Mississippi - Oxford - Mississippi - USA - 01.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Facade_of_Lyceum_Building_-_University_of_Mississippi_-_Oxford_-_Mississippi_-_USA_-_01.jpg",
      author: "Adam Jones, Ph.D.",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value:
        "3.0 minimum (US scale) for admission without SAT/ACT; 2.0-2.99 admissible with qualifying SAT/ACT",
      source:
        "https://olemiss.edu/global/international-students-oge/international-student-admissions/new-freshman-international-student-admissions/",
    },
    test: {
      value: "optional",
      source:
        "https://olemiss.edu/global/international-students-oge/international-student-admissions/new-freshman-international-student-admissions/",
      note: "International freshmen with 3.0+ GPA admissible without SAT/ACT; GPA 2.5-2.99 needs SAT 880+/ACT 16+, 2.0-2.49 needs SAT 960+/ACT 18+",
    },
    english: {
      ielts: 6,
      toefl: 79,
      duolingo: 110,
      note: "TOEFL 79 applies to tests taken before 21 Jan 2026; new-scale minimum 4.5 with no section below 4. PTE-A 53 also accepted.",
      source:
        "https://olemiss.edu/admissions/undergraduate-admissions/application-process/international-students/",
    },
    cost: {
      value: 52938,
      source: "https://olemiss.edu/admissions/cost-of-attendance/index.php",
      year: "2026-27",
      note: "Out-of-state undergraduate, campus housing: tuition, fees, housing, food, books, personal, transportation. Internationals pay out-of-state rate plus $100/semester international student fee (not included).",
    },
    aid: {
      value: "merit-only",
      source:
        "https://olemiss.edu/departments/provost/global-engagement/international-students-oge/scholarships-international-students/index.php",
      note: "Automatic International Academic Excellence scholarships from $5,000 to $28,893 per year based on GPA; no need-based aid described for internationals.",
    },
    urls: {
      admissions: "https://olemiss.edu/admissions/undergraduate-admissions/",
      international:
        "https://olemiss.edu/admissions/undergraduate-admissions/application-process/international-students/",
      cost: "https://olemiss.edu/admissions/cost-of-attendance/index.php",
      aid: "https://olemiss.edu/departments/provost/global-engagement/international-students-oge/scholarships-international-students/index.php",
    },
  },
  {
    slug: "missouri",
    state: "Missouri",
    code: "MO",
    region: "Midwest",
    university: "Washington University in St. Louis",
    city: "St. Louis",
    rank: {
      label: "#16 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/missouri.webp",
      card: "/media/universities/missouri-card.webp",
      title: "Brookings Hall at Washington University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Brookings_Hall_at_Washington_University.jpg",
      author: "Emil Boehl",
      licence: "Public domain",
      licenceUrl: null,
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admissions.washu.edu/how-to-apply/common-questions/",
      note: "Test-optional for fall 2027 admission; from fall 2027 SAT/ACT no longer accepted in lieu of English proficiency scores",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 130,
      note: "Recommended (competitive) scores, not minimums: TOEFL 100 (tests before 21 Jan 2026) or 5.0 on new scale, IELTS Academic 7.0, Duolingo 130.",
      source: "https://admissions.washu.edu/how-to-apply/english-testing-requirements/",
    },
    cost: {
      value: 96994,
      source: "https://financialaid.washu.edu/costs/",
      year: "2026-27",
      note: "Total university charges (tuition $71,310, activity and health fees, average housing and meal plan). Books, travel and personal costs are extra.",
    },
    aid: {
      value: "need-aware",
      source: "https://financialaid.washu.edu/how-washu-helps/need-blind-policy/",
      note: "Need-blind only for U.S. citizens/permanent residents; international first-years can receive need-based aid (100% of demonstrated need met for admitted students) and merit scholarships.",
    },
    urls: {
      admissions: "https://admissions.washu.edu/",
      international:
        "https://admissions.washu.edu/how-to-apply/first-year-international-applicants/",
      cost: "https://financialaid.washu.edu/costs/",
      aid: "https://financialaid.washu.edu/how-washu-helps/need-blind-policy/",
    },
  },
  {
    slug: "montana",
    state: "Montana",
    code: "MT",
    region: "West",
    university: "Montana State University",
    city: "Bozeman",
    rank: {
      label: "#308 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/montana-state-university-2532",
    },
    image: {
      src: "/media/universities/montana.webp",
      card: "/media/universities/montana-card.webp",
      title: "Looking N at Montana Hall - Montana State University - 2013-07-09.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Looking_N_at_Montana_Hall_-_Montana_State_University_-_2013-07-09.jpg",
      author: "Tim Evanson",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    gpa: {
      value: "2.5 minimum (4.0 US scale)",
      source: "https://www.montana.edu/international/admissions/quickfacts.html",
    },
    test: {
      value: "optional",
      source: "https://www.montana.edu/international/admissions/appinstructions.html",
      note: "Montana Board of Regents ended the ACT/SAT requirement; scores still used for math placement and scholarships (required for applicants from US high schools)",
    },
    english: {
      ielts: 6,
      toefl: 71,
      duolingo: 110,
      note: "IELTS Academic only. TOEFL iBT 71 per the international admissions FAQ; the current English proficiency page shows '4' for iBT (likely the new 1-6 scale). Conditional admission available below minimums.",
      source: "https://www.montana.edu/international/admissions/englishproficiency.html",
    },
    cost: {
      value: 54220,
      source: "https://www.montana.edu/international/admissions/cost.html",
      year: "2025-26",
      note: "Total on I-20 for international undergraduates: tuition ~$31,214, fees, on-campus housing/meals, course materials, misc; health insurance ($4,769) and $300 foreign student fee listed separately.",
    },
    aid: {
      value: "limited",
      source: "https://www.montana.edu/international/admissions/scholarships.html",
      note: "International admissions links to undergraduate scholarships and warns funds are limited; no need-based aid for internationals is described.",
    },
    urls: {
      admissions: "https://www.montana.edu/admissions/",
      international: "https://www.montana.edu/international/admissions/",
      cost: "https://www.montana.edu/international/admissions/cost.html",
      aid: "https://www.montana.edu/international/admissions/scholarships.html",
    },
  },
  {
    slug: "nebraska",
    state: "Nebraska",
    code: "NE",
    region: "Midwest",
    university: "Creighton University",
    city: "Omaha",
    rank: {
      label: "#100 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/creighton-university-2542",
    },
    image: {
      src: "/media/universities/nebraska.webp",
      card: "/media/universities/nebraska-card.webp",
      title: "Creighton University - Omaha, Nebraska (44209349534).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Creighton_University_-_Omaha,_Nebraska_(44209349534).jpg",
      author: "Tony Webster from Minneapolis, Minnesota, United States",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    gpa: {
      value: "Average 3.898 (CDS 2023-24)",
      source:
        "https://www.creighton.edu/sites/default/files/2024-06/CDS_UNL2_2023_2024-Section-C.pdf",
    },
    test: {
      value: "optional",
      source: "https://www.creighton.edu/admissions/admissions-requirements/international",
      note: "Applicants may apply test-optional; superscores considered; SAT 560 / ACT 22 can satisfy English proficiency",
    },
    english: {
      ielts: 6.5,
      toefl: 88,
      duolingo: 110,
      note: "Unconditional admission minimums: TOEFL 88 (old format, no section below 20) or 4.5 new format; IELTS 6.5 (no band below 6.0); Duolingo 110; PTE 58. Lower scores may qualify for the Bridge to Creighton program.",
      source: "https://www.creighton.edu/admissions/admissions-requirements/international",
    },
    cost: {
      value: 72782,
      source: "https://www.creighton.edu/cost-aid/tuition-costs/undergraduate-tuition",
      year: "2026-27",
      note: "Entering freshman, College of Arts and Sciences, on campus: tuition $50,580, fees, housing/meals, books, personal, travel (Region 2 shown; $72,532-$73,382 by region). Same rate for internationals.",
    },
    aid: {
      value: "merit-only",
      source: "https://www.creighton.edu/admissions/admissions-requirements/international",
      note: "Creighton offers international students merit scholarships only (automatic consideration, plus Matteo Ricci, SJ Awards); no need-based aid or full rides.",
    },
    urls: {
      admissions: "https://www.creighton.edu/admissions",
      international: "https://www.creighton.edu/admissions/admissions-requirements/international",
      cost: "https://www.creighton.edu/cost-aid/tuition-costs/undergraduate-tuition",
      aid: "https://www.creighton.edu/cost-aid/types-aid/scholarships",
    },
  },
  {
    slug: "nevada",
    state: "Nevada",
    code: "NV",
    region: "West",
    university: "University of Nevada, Reno",
    city: "Reno",
    rank: {
      label: "#219 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.unr.edu/nevada-today/news/2026/us-news-and-world-report-2027-best-colleges-rankings",
    },
    image: {
      src: "/media/universities/nevada.webp",
      card: "/media/universities/nevada-card.webp",
      title: "University of Nevada Quad, 2009-11-08.JPG",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Nevada_Quad,_2009-11-08.JPG",
      author: "Tonywiki09",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: "3.0 minimum academic GPA (4.0 scale)",
      source: "https://www.unr.edu/admissions/international/undergraduate",
    },
    test: {
      value: "optional",
      source: "https://www.unr.edu/admissions/international/undergraduate",
      note: "SAT/ACT not required for admission or scholarship consideration",
    },
    english: {
      ielts: 6,
      toefl: 61,
      duolingo: 95,
      note: "TOEFL 61+ (page does not say iBT explicitly), IELTS Academic 6.0+, Duolingo 95; Cambridge 169+ and PTE Academic 46+ also accepted.",
      source: "https://www.unr.edu/admissions/international/undergraduate",
    },
    cost: {
      value: 45541,
      source: "https://www.unr.edu/tuition-and-fees/international",
      year: "2026-27",
      note: "Low end of the published international undergraduate range ($45,541-$51,101): tuition, non-resident fee, fees, on-campus housing, meals, books; excludes health insurance and personal expenses.",
    },
    aid: {
      value: "limited",
      source: "https://www.unr.edu/oiss/scholarships",
      note: "New international students can receive small merit scholarships (e.g., OISS $300-$5,000); need-based institutional aid only after one year of study.",
    },
    urls: {
      admissions: "https://www.unr.edu/admissions",
      international: "https://www.unr.edu/admissions/international/undergraduate",
      cost: "https://www.unr.edu/tuition-and-fees/international",
      aid: "https://www.unr.edu/oiss/scholarships",
    },
  },
  {
    slug: "new-hampshire",
    state: "New Hampshire",
    code: "NH",
    region: "Northeast",
    university: "Dartmouth College",
    city: "Hanover",
    rank: {
      label: "#12 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/2/",
    },
    image: {
      src: "/media/universities/new-hampshire.webp",
      card: "/media/universities/new-hampshire-card.webp",
      title: "Baker-Library-Dartmouth-College-Hanover-New-Hampshire-05-2018a.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Baker-Library-Dartmouth-College-Hanover-New-Hampshire-05-2018a.jpg",
      author: "Gunnar Klack",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source:
        "https://admissions.dartmouth.edu/glossary-question/i-attend-school-outside-us-do-i-have-submit-act-or-sat",
      note: "SAT/ACT required; applicants from schools outside the U.S. may instead submit three AP exams, IB, A-Level or equivalent national exam results",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 135,
      note: "No minimum scores; figures are what most successful applicants exceed (TOEFL 100 before 21 Jan 2026, 5+ on new scale; IELTS 7; Duolingo 135; Cambridge 185). Required if English is not first language and not language of instruction for 2+ years.",
      source:
        "https://admissions.dartmouth.edu/glossary-question/if-english-not-my-first-language-am-i-required-submit-language-proficiency-test",
    },
    cost: {
      value: 98946,
      source: "https://admissions.dartmouth.edu/estimate-your-cost/cost-attendance",
      year: "2026-27",
      note: "First-year COA: tuition $71,697, fees incl. $519 orientation fees, housing, food, books, personal; excludes $5,216 health plan and travel. Same for internationals.",
    },
    aid: {
      value: "need-blind",
      source: "https://admissions.dartmouth.edu/glossary-term/international-students",
      note: "Need-blind admission for all applicants including international students, and full demonstrated need met for all admitted students.",
    },
    urls: {
      admissions: "https://admissions.dartmouth.edu/",
      international: "https://admissions.dartmouth.edu/glossary-term/international-students",
      cost: "https://admissions.dartmouth.edu/estimate-your-cost/cost-attendance",
      aid: "https://financialaid.dartmouth.edu/",
    },
  },
  {
    slug: "new-jersey",
    state: "New Jersey",
    code: "NJ",
    region: "Northeast",
    university: "Princeton University",
    city: "Princeton",
    rank: {
      label: "#2 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://poetsandquantsforundergrads.com/news/u-s-news-best-colleges-ranking-2027-mit-ends-princetons-long-run-at-the-top/",
    },
    image: {
      src: "/media/universities/new-jersey.webp",
      card: "/media/universities/new-jersey-card.webp",
      title: "Nassau Hall Princeton.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Nassau_Hall_Princeton.JPG",
      author: "Smallbones",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    gpa: {
      value: "Average 3.96; 72% had a 4.0 (CDS 2025-26)",
      source:
        "https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf",
    },
    test: {
      value: "optional",
      source: "https://admission.princeton.edu/apply/standardized-testing",
      note: "Test optional for fall 2027 entry; SAT/ACT required again from fall 2028 entry",
    },
    english: {
      ielts: null,
      toefl: null,
      duolingo: null,
      note: "TOEFL, IELTS Academic, Duolingo or PTE Academic required for non-native speakers not schooled in English (exempt after 3+ years at an English-medium secondary school); no minimum scores published.",
      source: "https://admission.princeton.edu/apply/international-students",
    },
    cost: {
      value: 98698,
      source: "https://admission.princeton.edu/cost-aid/fees-payment-options",
      year: null,
      note: "Estimated COA for the next academic year (the page's year label contains a typo): tuition $71,200, housing, food, fees, books, personal; transportation excluded. Same for all undergraduates.",
    },
    aid: {
      value: "need-blind",
      source: "https://admission.princeton.edu/apply/international-students",
      note: "Admission is need-blind for all applicants and admitted international students have full demonstrated need met with grants, no loans.",
    },
    urls: {
      admissions: "https://admission.princeton.edu/",
      international: "https://admission.princeton.edu/apply/international-students",
      cost: "https://admission.princeton.edu/cost-aid/fees-payment-options",
      aid: "https://admission.princeton.edu/cost-aid",
    },
  },
  {
    slug: "new-mexico",
    state: "New Mexico",
    code: "NM",
    region: "West",
    university: "University of New Mexico",
    city: "Albuquerque",
    rank: {
      label: "#236 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-new-mexico-10313",
    },
    image: {
      src: "/media/universities/new-mexico.webp",
      card: "/media/universities/new-mexico-card.webp",
      title: "Zimmerman Library, University of New Mexico.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Zimmerman_Library,_University_of_New_Mexico.jpg",
      author: "Kenneth C. Zirkel",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    gpa: {
      value: "2.5 minimum (U.S.-equivalent, 4.0 scale) for international freshmen",
      source: "https://geo.unm.edu/admission/undergraduate/requirements/academic.html",
    },
    test: {
      value: "optional",
      source: "https://geo.unm.edu/admission/undergraduate/requirements/academic.html",
      note: "ACT and SAT are not required for international applicants; scores can help for some scholarships",
    },
    english: {
      ielts: 6,
      toefl: 68,
      duolingo: 95,
      note: 'TOEFL listed as "68 (4.0)"; conditional admission via CELAC available if English minimum not met',
      source: "https://international.unm.edu/english-proficiency.html",
    },
    cost: {
      value: 59688,
      source: "https://international.unm.edu/undergraduate/scholarship-and-cost-of-attendance.html",
      year: "2027-28",
      note: "International undergraduate average COA without scholarship, 15 credit hours; $32,538 with Amigo Scholarship",
    },
    aid: {
      value: "merit-only",
      source: "https://international.unm.edu/undergraduate/scholarship-and-cost-of-attendance.html",
      note: "Automatic merit scholarships (Amigo: non-resident tuition reduced to resident rate for 3.5+ GPA; Leadership: ~$17,000/yr for 3.0+ GPA); no need-based aid listed.",
    },
    urls: {
      admissions: "https://admissions.unm.edu/future-students/freshmen/",
      international: "https://international.unm.edu/undergraduate/index.html",
      cost: "https://international.unm.edu/undergraduate/scholarship-and-cost-of-attendance.html",
      aid: "https://international.unm.edu/undergraduate/scholarship-and-cost-of-attendance.html",
    },
  },
  {
    slug: "new-york",
    state: "New York",
    code: "NY",
    region: "Northeast",
    university: "Columbia University",
    city: "New York City",
    rank: {
      label: "#12 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/new-york.webp",
      card: "/media/universities/new-york-card.webp",
      title: "Butler Library Columbia University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Butler_Library_Columbia_University.jpg",
      author: "JSquish",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://undergrad.admissions.columbia.edu/apply/process/testing",
      note: "Test-optional for fall 2027 entry; SAT/ACT required again from the 2027-28 cycle (fall 2028 entry)",
    },
    english: {
      ielts: 7.5,
      toefl: 105,
      duolingo: 135,
      note: "TOEFL iBT 105 applies to tests taken on or before Jan 20, 2026; tests from Jan 21, 2026 need 5.5 on the new 1-6 scale. Cambridge C1/C2 191 also accepted.",
      source: "https://undergrad.admissions.columbia.edu/apply/international/english-proficiency",
    },
    cost: {
      value: 99774,
      source: "https://undergrad.admissions.columbia.edu/affordability/cost",
      year: "2026-27",
      note: "Columbia College/Engineering total budget: tuition, fees, housing, food, books, personal; excludes travel",
    },
    aid: {
      value: "need-aware",
      source: "https://undergrad.admissions.columbia.edu/apply/international/aid",
      note: "Admission is need-aware for internationals; Columbia meets 100% of demonstrated need for admitted international students with grants and work-study, no loans, and no merit scholarships.",
    },
    urls: {
      admissions: "https://undergrad.admissions.columbia.edu/apply/firstyear",
      international:
        "https://undergrad.admissions.columbia.edu/apply/international/english-proficiency",
      cost: "https://undergrad.admissions.columbia.edu/affordability/cost",
      aid: "https://undergrad.admissions.columbia.edu/apply/international/aid",
    },
  },
  {
    slug: "north-carolina",
    state: "North Carolina",
    code: "NC",
    region: "South",
    university: "Duke University",
    city: "Durham",
    rank: {
      label: "#8 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/north-carolina.webp",
      card: "/media/universities/north-carolina-card.webp",
      title: "Duke Chapel and West Campus.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Duke_Chapel_and_West_Campus.jpg",
      author: "Dennis Ludlow - Sharkshock",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admissions.duke.edu/apply/",
      note: "Test-optional for first-year and transfer applicants in the 2026-27 cycle (fall 2027 entry)",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 130,
      note: "English tests are recommended, not required; scores are 'minimum expected'. TOEFL 100 applies to tests before Jan 21, 2026; 5.0 on the new 1-6 scale for later tests. PTE 70, Cambridge 180.",
      source: "https://admissions.duke.edu/apply/",
    },
    cost: {
      value: 103180,
      source: "https://financialaid.duke.edu/how-aid-calculated/cost-attendance/",
      year: "2026-27",
      note: "First-year undergraduate COA (tuition $73,740, fees, double room, food, books, personal, domestic transport); range $103,180-$103,975",
    },
    aid: {
      value: "need-aware",
      source: "https://financialaid.duke.edu/forms-resources/awarding-policy/",
      note: "Need-based aid for internationals is limited: Duke expects to enroll 20-25 international students a year whose full demonstrated need is met; aid must be requested in the original application.",
    },
    urls: {
      admissions: "https://admissions.duke.edu/first-year-applicants/",
      international: "https://admissions.duke.edu/apply/",
      cost: "https://financialaid.duke.edu/how-aid-calculated/cost-attendance/",
      aid: "https://admissions.duke.edu/financial-support/",
    },
  },
  {
    slug: "north-dakota",
    state: "North Dakota",
    code: "ND",
    region: "Midwest",
    university: "University of North Dakota",
    city: "Grand Forks",
    rank: {
      label: "#227 National Universities",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/nd",
    },
    image: {
      src: "/media/universities/north-dakota.webp",
      card: "/media/universities/north-dakota-card.webp",
      title: "UND Merrifield Hall.JPG",
      page: "https://commons.wikimedia.org/wiki/File:UND_Merrifield_Hall.JPG",
      author: "MatthewUND",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: "2.75 cumulative (4.0 scale) recommended",
      source: "https://und.edu/admissions/international/requirements-application.html",
    },
    test: {
      value: "optional",
      source: "https://und.edu/admissions/freshmen/requirements.html",
      note: "ACT/SAT not required; scores encouraged for scholarship and course placement",
    },
    english: {
      ielts: 6,
      toefl: 71,
      duolingo: 105,
      note: "TOEFL iBT 71 for tests before Jan 21, 2026; 3.5 for later tests (new scale). PTE 50 or ELS Level 112 also accepted.",
      source: "https://und.edu/admissions/international/requirements-application.html",
    },
    cost: {
      value: 40488,
      source:
        "https://und.edu/academics/international-center/international-student-scholar-services/certificate-of-finances.html",
      year: null,
      note: "International undergraduate Certificate of Finances estimate (12 credits): tuition & fees, housing & food, books, health insurance, personal, international fee; year not stated",
    },
    aid: {
      value: null,
      source: null,
      note: null,
    },
    urls: {
      admissions: "https://und.edu/admissions/freshmen/index.html",
      international: "https://und.edu/admissions/international/requirements-application.html",
      cost: "https://und.edu/academics/international-center/international-student-scholar-services/certificate-of-finances.html",
      aid: "https://und.edu/admissions/freshmen/scholarships.html",
    },
  },
  {
    slug: "ohio",
    state: "Ohio",
    code: "OH",
    region: "Midwest",
    university: "Case Western Reserve University",
    city: "Cleveland",
    rank: {
      label: "#44 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/ohio.webp",
      card: "/media/universities/ohio-card.webp",
      title: "Adelbert Hall - Case Western Reserve University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Adelbert_Hall_-_Case_Western_Reserve_University.jpg",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://case.edu/admission/apply/deadlines-and-requirements/test-policy",
      note: "Test-optional for first-year applicants; no testing required for any undergraduate program or scholarship",
    },
    english: {
      ielts: 7,
      toefl: 90,
      duolingo: 115,
      note: "TOEFL iBT 90 for tests on or before Jan 20, 2026; 4.5 on the new scale for later tests (another CWRU page says 5.0). Waivable with SAT EBRW 630+ or ACT English 26+.",
      source: "https://case.edu/admission/apply/international-students",
    },
    cost: {
      value: 95704,
      source: "https://case.edu/financialaid/undergraduates/estimated-costs-attendance-2026-27",
      year: "2026-27",
      note: "First-year residential budget: tuition, fees, matriculation fee, housing, meal plan, books, personal; excludes transportation and nursing fees; no separate international figure",
    },
    aid: {
      value: "limited",
      source: "https://case.edu/financialaid/undergraduates/international-students",
      note: "CWRU offers a limited amount of need-based aid to first-year international applicants (CSS Profile required), plus automatic merit scholarship consideration and scholarship competitions.",
    },
    urls: {
      admissions: "https://case.edu/admission/apply/first-year-applicants",
      international: "https://case.edu/admission/apply/international-students",
      cost: "https://case.edu/financialaid/undergraduates/estimated-costs-attendance-2026-27",
      aid: "https://case.edu/financialaid/undergraduates/international-students",
    },
  },
  {
    slug: "oklahoma",
    state: "Oklahoma",
    code: "OK",
    region: "South",
    university: "University of Oklahoma",
    city: "Norman",
    rank: {
      label: "#116 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.newsfromthestates.com/node/428700",
    },
    image: {
      src: "/media/universities/oklahoma.webp",
      card: "/media/universities/oklahoma-card.webp",
      title: "Bizzell Memorial Library.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Bizzell_Memorial_Library.jpg",
      author: "Torbjorn (English Wikipedia)",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0",
    },
    gpa: {
      value: "3.0 minimum (U.S. unweighted 4.0 scale)",
      source: "https://ou.edu/admissions/apply/international/undergraduate-admission",
    },
    test: {
      value: "optional",
      source:
        "https://www.ou.edu/admissions/apply/freshman/requirements-factors/ou-is-test-optional",
      note: "SAT/ACT not required for international admission; scores determine larger merit scholarship tiers",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: 100,
      note: "TOEFL iBT 79 for tests before Jan 21, 2026; 4.0 on the new scale for later tests. PTE 53 also accepted.",
      source: "https://www.ou.edu/admissions/apply/international/english-proficiency-requirements",
    },
    cost: {
      value: 56311,
      source: "https://www.ou.edu/admissions/affordability/cost",
      year: "2026-27",
      note: "Undergraduate international estimate: tuition, fees (incl. international fee), housing & food, books, medical insurance, personal",
    },
    aid: {
      value: "merit-only",
      source: "https://www.ou.edu/admissions/affordability/scholarships",
      note: "International freshmen are considered for 4-year merit awards of $48,000-$70,000 based on ACT/SAT (test-optional awards via holistic review); no need-based aid listed for internationals.",
    },
    urls: {
      admissions: "https://www.ou.edu/admissions/apply/freshman/requirements-factors",
      international: "https://ou.edu/admissions/apply/international/undergraduate-admission",
      cost: "https://www.ou.edu/admissions/affordability/cost",
      aid: "https://www.ou.edu/admissions/affordability/scholarships",
    },
  },
  {
    slug: "oregon",
    state: "Oregon",
    code: "OR",
    region: "West",
    university: "University of Oregon",
    city: "Eugene",
    rank: {
      label: "#116 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/or",
    },
    image: {
      src: "/media/universities/oregon.webp",
      card: "/media/universities/oregon-card.webp",
      title: "Knight Library.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Knight_Library.jpg",
      author: "Visitor7",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: "3.00 (B) average expected",
      source:
        "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international-students/",
    },
    test: {
      value: "optional",
      source:
        "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international-students/",
      note: "SAT/ACT not required for international students; scores can be used to show English proficiency",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: 110,
      note: "Full-admission ranges: TOEFL iBT 80-120 for tests before Jan 2026, 4.5+ on the new scale after; IELTS 6.5-9.0; Duolingo 110-130. Lower scores may qualify for AEIS or conditional admission.",
      source:
        "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international/requirements/english-proficiency/",
    },
    cost: {
      value: 64013,
      source: "https://financialaid.uoregon.edu/international-student-cost-attendance",
      year: "2026-27",
      note: "International undergraduate estimate: tuition (based on 12 credits), fees, on-campus residence hall, educational/personal, health insurance",
    },
    aid: {
      value: "limited",
      source:
        "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international/documents-and-scholarships/international-scholarships/",
      note: "Internationals are considered for general university scholarships plus need- and merit-based ICSP partial tuition awards, work-study ($1,000-$4,500) and endowed awards ($1,000-$12,000).",
    },
    urls: {
      admissions: "https://admissions.uoregon.edu/",
      international:
        "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international-students/",
      cost: "https://financialaid.uoregon.edu/international-student-cost-attendance",
      aid: "https://www.uoregon.edu/admissions/undergraduate/find-your-path/international/documents-and-scholarships/international-scholarships/",
    },
  },
  {
    slug: "pennsylvania",
    state: "Pennsylvania",
    code: "PA",
    region: "Northeast",
    university: "University of Pennsylvania",
    city: "Philadelphia",
    rank: {
      label: "#7 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/pennsylvania.webp",
      card: "/media/universities/pennsylvania-card.webp",
      title: "College Hall, University of Pennsylvania.jpg",
      page: "https://commons.wikimedia.org/wiki/File:College_Hall,_University_of_Pennsylvania.jpg",
      author: "Michel Alexandre Salim",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://admissions.upenn.edu/how-to-apply/preparing-your-application/testing",
      note: "SAT or ACT required for all first-year applicants in the 2026-27 cycle (fall 2027 entry); hardship waiver available",
    },
    english: {
      ielts: null,
      toefl: null,
      duolingo: null,
      note: "TOEFL, IELTS Academic or Duolingo required unless exempt, but Penn publishes no minimum or recommended scores; tests must be taken on or after April 1, 2025.",
      source: "https://admissions.upenn.edu/how-to-apply/international-applicants/guidelines",
    },
    cost: {
      value: 99082,
      source: "https://srfs.upenn.edu/costs-budgeting/undergraduate-cost-attendance",
      year: "2026-27",
      note: "On-campus undergraduate budget: tuition, fees, housing, food, books, transportation, personal; same budget for all students",
    },
    aid: {
      value: "need-aware",
      source: "https://admissions.upenn.edu/affording-penn/international-aid",
      note: "Admission is need-aware for international applicants (other than Canada/Mexico); admitted aid recipients have 100% of demonstrated need met with need-based, not merit, aid.",
    },
    urls: {
      admissions:
        "https://admissions.upenn.edu/how-to-apply/first-year-applicants/application-requirements",
      international: "https://admissions.upenn.edu/how-to-apply/international-applicants",
      cost: "https://srfs.upenn.edu/costs-budgeting/undergraduate-cost-attendance",
      aid: "https://admissions.upenn.edu/affording-penn/international-aid",
    },
  },
  {
    slug: "rhode-island",
    state: "Rhode Island",
    code: "RI",
    region: "Northeast",
    university: "Brown University",
    city: "Providence",
    rank: {
      label: "#16 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/rhode-island.webp",
      card: "/media/universities/rhode-island-card.webp",
      title: "Brown University Main Green.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Brown_University_Main_Green.jpg",
      author: "Epicenter22",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "required",
      source: "https://admission.brown.edu/ask/standardized-tests",
      note: "SAT or ACT required for first-year applicants since the 2024-25 cycle; no minimum scores",
    },
    english: {
      ielts: 8,
      toefl: 105,
      duolingo: 130,
      note: "English test highly recommended, not strictly required; scores are 'expected in most cases'. TOEFL iBT 105 for tests before Jan 2026, 5.5 on the new scale after. PTE 75, Cambridge 191.",
      source: "https://admission.brown.edu/international/english-proficiency",
    },
    cost: {
      value: 106330,
      source: "https://isss.brown.edu/international-students/new-student-guide/estimate-expenses",
      year: "2026-27",
      note: "International undergraduate I-20 estimate: tuition & fees, room & board, health insurance, books, personal; excludes international travel and visa fees",
    },
    aid: {
      value: "need-blind",
      source: "https://admission.brown.edu/international/financial-aid",
      note: "Brown is need-blind for international students beginning with the Class of 2029 and meets full demonstrated need for admitted students who apply for aid with their application; no merit aid.",
    },
    urls: {
      admissions: "https://admission.brown.edu/",
      international: "https://admission.brown.edu/international/admission-criteria",
      cost: "https://isss.brown.edu/international-students/new-student-guide/estimate-expenses",
      aid: "https://admission.brown.edu/international/financial-aid",
    },
  },
  {
    slug: "south-carolina",
    state: "South Carolina",
    code: "SC",
    region: "South",
    university: "Clemson University",
    city: "Clemson",
    rank: {
      label: "#80 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/clemson-university-3425",
    },
    image: {
      src: "/media/universities/south-carolina.webp",
      card: "/media/universities/south-carolina-card.webp",
      title: "Tillman Hall.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Tillman_Hall.jpg",
      author: "blahedo",
      licence: "CC BY-SA 2.5",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.5",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source:
        "https://www.clemson.edu/admissions/undergraduate-admissions/apply/international.html",
      note: "Clemson has adopted a test-optional policy for SAT/ACT",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: 105,
      note: "IELTS needs 6.0 in each subscore; TOEFL iBT 2026 new scale minimum 4.",
      source:
        "https://www.clemson.edu/admissions/undergraduate-admissions/apply/international.html",
    },
    cost: {
      value: 66180,
      source: "https://www.clemson.edu/financial-aid/cost/estimated-cost-of-attendance.html",
      year: "2026-27",
      note: "Non-South Carolina resident undergraduate COA (internationals are treated as non-residents): tuition, fees, books, housing, food, transport, personal; $68,704 with first-year laptop; excludes major enrichment fees",
    },
    aid: {
      value: "none",
      source:
        "https://www.clemson.edu/admissions/undergraduate-admissions/apply/international.html",
      note: "Clemson states there are no scholarships for international undergraduates; only a Sister-State tuition reduction for citizens of partner regions.",
    },
    urls: {
      admissions: "https://www.clemson.edu/admissions/undergraduate-admissions/",
      international:
        "https://www.clemson.edu/admissions/undergraduate-admissions/apply/international.html",
      cost: "https://www.clemson.edu/financial-aid/cost/estimated-cost-of-attendance.html",
      aid: null,
    },
  },
  {
    slug: "south-dakota",
    state: "South Dakota",
    code: "SD",
    region: "Midwest",
    university: "South Dakota State University",
    city: "Brookings",
    rank: {
      label: "#250 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/south-dakota-state-university-3471",
    },
    image: {
      src: "/media/universities/south-dakota.webp",
      card: "/media/universities/south-dakota-card.webp",
      title: "South Dakota State University February 2015 2 (Coughlin Campanile).jpg",
      page: "https://commons.wikimedia.org/wiki/File:South_Dakota_State_University_February_2015_2_(Coughlin_Campanile).jpg",
      author: "Michael Barera",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source:
        "https://www.sdstate.edu/admissions/international-first-time-undergraduate-admissions",
      note: "SAT/ACT optional but highly encouraged for international first-year applicants",
    },
    english: {
      ielts: 5.5,
      toefl: null,
      duolingo: 90,
      note: "Current admissions page lists TOEFL minimum as 3.5 (new 1-6 scale); no current 0-120 figure (older 2020-23 catalogs listed 61 iBT). Also accepts PTE 44, iTEP 3.6, E3PT 62.",
      source:
        "https://www.sdstate.edu/admissions/international-first-time-undergraduate-admissions",
    },
    cost: {
      value: 29795,
      source:
        "https://www.sdstate.edu/international-student-scholar-engagement/estimated-costs-international-students",
      year: null,
      note: "Published estimated annual cost for international undergraduates (tuition and fees, living, other expenses); page states no academic year and warns of annual increases up to 5%.",
    },
    aid: {
      value: "limited",
      source:
        "https://www.sdstate.edu/international-student-scholar-engagement/education-funding-international-students",
      note: "International students are not eligible for federal aid but may qualify for SDSU scholarships such as the Jackrabbit Guarantee.",
    },
    urls: {
      admissions: "https://www.sdstate.edu/admissions",
      international:
        "https://www.sdstate.edu/admissions/international-first-time-undergraduate-admissions",
      cost: "https://www.sdstate.edu/international-student-scholar-engagement/estimated-costs-international-students",
      aid: "https://www.sdstate.edu/international-student-scholar-engagement/education-funding-international-students",
    },
  },
  {
    slug: "tennessee",
    state: "Tennessee",
    code: "TN",
    region: "South",
    university: "Vanderbilt University",
    city: "Nashville",
    rank: {
      label: "#16 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://www.collegekickstart.com/blog/item/u-s-news-world-report-posts-2027-college-rankings",
    },
    image: {
      src: "/media/universities/tennessee.webp",
      card: "/media/universities/tennessee-card.webp",
      title: "Kirkland Hall at Vanderbilt University.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Kirkland_Hall_at_Vanderbilt_University.jpg",
      author: "Jaydenwithay",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admissions.vanderbilt.edu/apply/testing-policies/",
      note: "Test-optional for fall 2027 and fall 2028 entry; scores required again from fall 2029 entry",
    },
    english: {
      ielts: 7,
      toefl: null,
      duolingo: 130,
      note: "Recommended minimums (not hard cut-offs). First-year page lists TOEFL iBT 5 (new 1-6 scale); no current 0-120 figure on that page (older 2024-25 catalog listed 100). Waived for ACT English >26 or SAT ERW >630.",
      source: "https://admissions.vanderbilt.edu/apply/first-year-process/",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: "Official page lists direct billed costs of $96,896 (tuition, housing, food, student support fee) plus separate indirect allowances; no single total COA figure published.",
    },
    aid: {
      value: "need-aware",
      source: "https://admissions.vanderbilt.edu/affordability/international-costs-and-finances/",
      note: "Admission is need-aware for international applicants; need-based aid and/or merit scholarships were offered to 89 international students for fall 2026.",
    },
    urls: {
      admissions: "https://admissions.vanderbilt.edu/",
      international: "https://admissions.vanderbilt.edu/apply/international.php",
      cost: "https://www.vanderbilt.edu/financialaid/costs-undergraduate/",
      aid: "https://admissions.vanderbilt.edu/affordability/international-costs-and-finances/",
    },
  },
  {
    slug: "texas",
    state: "Texas",
    code: "TX",
    region: "South",
    university: "Rice University",
    city: "Houston",
    rank: {
      label: "#16 National Universities (tie)",
      edition: "U.S. News 2027",
      source:
        "https://news.rice.edu/news/2026/rice-rises-no-16-us-news-rankings-engineering-business-programs-climb",
    },
    image: {
      src: "/media/universities/texas.webp",
      card: "/media/universities/texas-card.webp",
      title: "Rice University - Rice statue with Lovett Hall.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Rice_University_-_Rice_statue_with_Lovett_Hall.JPG",
      author: "Daderot",
      licence: "Public domain",
      licenceUrl: null,
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admission.rice.edu/apply/international-applicants",
      note: "SAT/ACT recommended but not required for the 2026-27 application cycle; non-submitters get full consideration",
    },
    english: {
      ielts: 7,
      toefl: 100,
      duolingo: 130,
      note: "TOEFL 100 applies to tests taken before 21 Jan 2026; for later tests Rice requires 5.0 on the updated TOEFL 1-6 scale. IELTS Academic only. Single-sitting scores; no MyBest.",
      source: "https://admission.rice.edu/apply/international-applicants",
    },
    cost: {
      value: 97309,
      source: "https://financialaid.rice.edu/cost-attendance",
      year: "2026-27",
      note: "Published on-campus undergraduate COA (students entering 2024 or later): tuition, fees, on-campus living, books, personal. Excludes travel (est. $3,000 for foreign residents) and health insurance.",
    },
    aid: {
      value: "need-aware",
      source: "https://admission.rice.edu/apply/international-applicants",
      note: "Rice considers international applicants on a need-aware basis and offers need-based aid to a limited number of international first-years.",
    },
    urls: {
      admissions: "https://admission.rice.edu/",
      international: "https://admission.rice.edu/apply/international-applicants",
      cost: "https://financialaid.rice.edu/cost-attendance",
      aid: "https://admission.rice.edu/apply/international-applicants",
    },
  },
  {
    slug: "utah",
    state: "Utah",
    code: "UT",
    region: "West",
    university: "Brigham Young University",
    city: "Provo",
    rank: {
      label: "#116 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/byu-3670",
    },
    image: {
      src: "/media/universities/utah.webp",
      card: "/media/universities/utah-card.webp",
      title: "Karl G. Maeser Building, BYU, Sep 17.jpg",
      page: "https://commons.wikimedia.org/wiki/File:Karl_G._Maeser_Building,_BYU,_Sep_17.jpg",
      author: "An Errant Knight",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: "Middle 50% of admitted (spring/summer/fall 2026): 3.86-4.00",
      source: "https://enrollment.byu.edu/admissions/entrance-stats",
    },
    test: {
      value: "optional",
      source: "https://enrollment.byu.edu/admissions/act-sat-test-scores",
      note: "Test-optional through winter 2028 entry (covers fall 2027), with 'do no harm' score use; homeschooled applicants without sufficient accredited coursework must submit",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: null,
      note: "TOEFL iBT 80 overall with 20 per section (tests before 21 Jan 2026); new-scale tests need 4 overall and per section. IELTS 6.5 with 6 per section. Duolingo not accepted for undergraduates. Minimums apply from the winter 2027 application cycle.",
      source:
        "https://enrollment.byu.edu/admissions/byu-undergraduate-english-proficiency-requirement",
    },
    cost: {
      value: 30564,
      source: "https://enrollment.byu.edu/cost-of-attendance",
      year: "2026-27",
      note: "Published undergraduate on-campus COA at the non-Latter-day Saint tuition rate (fall + winter semesters); no separate international rate listed.",
    },
    aid: {
      value: "limited",
      source: "https://enrollment.byu.edu/financial-aid/international-student-scholarships",
      note: "International students are eligible for BYU's general scholarships through the Financial Aid Office; no international need-based programme described.",
    },
    urls: {
      admissions: "https://enrollment.byu.edu/admissions",
      international: "https://enrollment.byu.edu/admissions/international-students",
      cost: "https://enrollment.byu.edu/cost-of-attendance",
      aid: "https://enrollment.byu.edu/financial-aid/international-student-scholarships",
    },
  },
  {
    slug: "vermont",
    state: "Vermont",
    code: "VT",
    region: "Northeast",
    university: "University of Vermont",
    city: "Burlington",
    rank: {
      label: "#133 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-vermont-3696",
    },
    image: {
      src: "/media/universities/vermont.webp",
      card: "/media/universities/vermont-card.webp",
      title: "University of Vermont Old Mill.jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Vermont_Old_Mill.jpg",
      author: "HeyTomek",
      licence: "CC0",
      licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    },
    gpa: {
      value: "3.5-3.8 (4.0 scale), Class of 2030 entering profile",
      source:
        "https://www.uvm.edu/d10-files/documents/2026-08/DEM_Admissions-Counselor-Brochure_FY27_Pages.pdf",
    },
    test: {
      value: "optional",
      source:
        "https://www.uvm.edu/uvmnews/news/uvm-officially-approves-test-optional-admissions-policy",
      note: "Test-optional policy made permanent in March 2025; continues for fall 2027 applicants",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: 110,
      note: "TOEFL 80 of 120 or 4.5 of 6 on the new scale; scores of 80-89 (or 4.5) mean automatic enrolment in an ESOL course in the first semester. MyBest not accepted.",
      source: "https://www.uvm.edu/admissions/undergraduate/how-apply-international-students",
    },
    cost: {
      value: 79012,
      source: "https://www.uvm.edu/admissions/undergraduate/how-apply-international-students",
      year: "2026-27",
      note: "Published total I-20 estimated cost of attendance for international students (tuition and fees, living expenses, books, health insurance, personal).",
    },
    aid: {
      value: "merit-only",
      source: "https://www.uvm.edu/admissions/undergraduate/how-apply-international-students",
      note: "International students are automatically considered for merit scholarships of up to $30,000 per year; no need-based aid for internationals is described.",
    },
    urls: {
      admissions: "https://www.uvm.edu/admissions/undergraduate",
      international:
        "https://www.uvm.edu/admissions/undergraduate/how-apply-international-students",
      cost: "https://www.uvm.edu/studentfinancialservices/costs-attending",
      aid: "https://www.uvm.edu/admissions/undergraduate/how-apply-international-students",
    },
  },
  {
    slug: "virginia",
    state: "Virginia",
    code: "VA",
    region: "South",
    university: "University of Virginia",
    city: "Charlottesville",
    rank: {
      label: "#26 National Universities",
      edition: "U.S. News 2027",
      source: "https://virginiabusiness.com/virginia-schools-us-news-2027-universities-rankings/",
    },
    image: {
      src: "/media/universities/virginia.webp",
      card: "/media/universities/virginia-card.webp",
      title: "The Rotunda and Lawn University of Virginia Charlottesville VA March 2011.jpg",
      page: "https://commons.wikimedia.org/wiki/File:The_Rotunda_and_Lawn_University_of_Virginia_Charlottesville_VA_March_2011.jpg",
      author: "Phil Roeder",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admission.virginia.edu/admission/deadlines-instructions",
      note: "Test-optional for fall 2027 first-year applicants; applicants choose whether to submit SAT/ACT",
    },
    english: {
      ielts: null,
      toefl: null,
      duolingo: null,
      note: "Accepts TOEFL, IELTS, Cambridge C1/C2 and Duolingo; no minimum or recommended scores published.",
      source: "https://admission.virginia.edu/i-am/international",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: "Official estimate for non-Virginian first-year (College of Arts & Sciences, on grounds) is published only as a range, about $83,286-$84,976; no single figure.",
    },
    aid: {
      value: "limited",
      source: "https://admission.virginia.edu/i-am/international",
      note: "UVA states it has no scholarship or loan funds for foreign nationals, except need-based support for United World College graduates.",
    },
    urls: {
      admissions: "https://admission.virginia.edu/",
      international: "https://admission.virginia.edu/i-am/international",
      cost: "https://sfs.virginia.edu/financial-aid-new-applicants/financial-aid-basics/estimated-undergraduate-cost-attendance-2026-2027",
      aid: "https://admission.virginia.edu/i-am/international",
    },
  },
  {
    slug: "washington",
    state: "Washington",
    code: "WA",
    region: "West",
    university: "University of Washington",
    city: "Seattle",
    rank: {
      label: "#49 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-washington-3798",
    },
    image: {
      src: "/media/universities/washington.webp",
      card: "/media/universities/washington-card.webp",
      title: "UDub Red Square Suzzallo Library.jpg",
      page: "https://commons.wikimedia.org/wiki/File:UDub_Red_Square_Suzzallo_Library.jpg",
      author: "HMPinnsvinet",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: "Middle 50% of admitted (autumn 2025): 3.75-3.98 (4.0 scale)",
      source: "https://admit.washington.edu/apply/freshman/by-the-numbers",
    },
    test: {
      value: "optional",
      source: "https://admit.washington.edu/apply/first-year/how-to-apply/test-scores/",
      note: "SAT/ACT not required (permanent since 2020); required only for homeschooled or non-graded-school applicants",
    },
    english: {
      ielts: 6,
      toefl: 76,
      duolingo: 110,
      note: "TOEFL iBT 76 applies to tests taken before 21 Jan 2026; from 21 Jan 2026 the minimum is 4.0 (new scale). No MyBest or superscoring.",
      source: "https://admit.washington.edu/apply/first-year/how-to-apply/english-proficiency/",
    },
    cost: {
      value: 69129,
      source: "https://admit.washington.edu/costs/coa/",
      year: "2026-27",
      note: "Non-resident undergraduate, Seattle, living on/off campus, nine months; international students pay non-resident tuition.",
    },
    aid: {
      value: "none",
      source: "https://admit.washington.edu/costs/coa/",
      note: "The UW does not provide financial aid or scholarships to undergraduate international students.",
    },
    urls: {
      admissions: "https://admit.washington.edu/",
      international:
        "https://admit.washington.edu/apply/first-year/how-to-apply/english-proficiency/",
      cost: "https://admit.washington.edu/costs/coa/",
      aid: "https://admit.washington.edu/costs/coa/",
    },
  },
  {
    slug: "west-virginia",
    state: "West Virginia",
    code: "WV",
    region: "South",
    university: "West Virginia University",
    city: "Morgantown",
    rank: {
      label: "#227 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/wvu-3827",
    },
    image: {
      src: "/media/universities/west-virginia.webp",
      card: "/media/universities/west-virginia-card.webp",
      title: "Woodburn Hall (WVU).jpg",
      page: "https://commons.wikimedia.org/wiki/File:Woodburn_Hall_(WVU).jpg",
      author: "Alysonpwhite",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: "2.5 minimum (converted, 4.0 scale) for first-year admission",
      source:
        "https://admissions.wvu.edu/how-to-apply/international-students/admission-requirements-for-international-students",
    },
    test: {
      value: "optional",
      source:
        "https://admissions.wvu.edu/how-to-apply/international-students/admission-requirements-for-international-students",
      note: "SAT/ACT encouraged but not required for international students; some colleges/majors require them for direct admission",
    },
    english: {
      ielts: 6.5,
      toefl: 79,
      duolingo: 105,
      note: "TOEFL iBT 79 for tests through January 2026; 4.0 on new scale after. Academic IELTS only. Lower scores may qualify for conditional/pathway admission.",
      source:
        "https://admissions.wvu.edu/how-to-apply/international-students/english-language-proficiency-requirements",
    },
    cost: {
      value: null,
      source: null,
      year: null,
      note: "No current (2026-27) single international or non-resident COA total found; only tuition/fee and housing rates published separately.",
    },
    aid: {
      value: "merit-only",
      source: "https://www.wvu.edu/faqs/do-you-offer-scholarships-for-international-students/",
      note: "International students must show they can bear the full cost; academic scholarships are available to incoming international freshmen meeting eligibility criteria.",
    },
    urls: {
      admissions: "https://admissions.wvu.edu/",
      international: "https://admissions.wvu.edu/how-to-apply/international-students",
      cost: "https://www.wvu.edu/admissions/undergraduate/cost-and-aid/",
      aid: "https://www.wvu.edu/faqs/do-you-offer-scholarships-for-international-students/",
    },
  },
  {
    slug: "wisconsin",
    state: "Wisconsin",
    code: "WI",
    region: "Midwest",
    university: "University of Wisconsin–Madison",
    city: "Madison",
    rank: {
      label: "#34 National Universities",
      edition: "U.S. News 2027",
      source:
        "https://biztimes.com/how-do-wisconsin-universities-rank-in-the-2027-u-s-news-world-report/",
    },
    image: {
      src: "/media/universities/wisconsin.webp",
      card: "/media/universities/wisconsin-card.webp",
      title: "University of Wisconsin–Madison August 2022 14 (Bascom Hall).jpg",
      page: "https://commons.wikimedia.org/wiki/File:University_of_Wisconsin%E2%80%93Madison_August_2022_14_(Bascom_Hall).jpg",
      author: "Michael Barera",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
    gpa: {
      value: null,
      source: null,
    },
    test: {
      value: "optional",
      source: "https://admissions.wisc.edu/act_sat_faq/",
      note: "ACT/SAT not required for spring 2027, fall 2027 and spring 2028 applicants; no decision yet for fall 2028+",
    },
    english: {
      ielts: 6.5,
      toefl: 80,
      duolingo: 115,
      note: "TOEFL iBT 80 for tests on or before 20 Jan 2026; 4.5 (new scale) for tests from 21 Jan 2026. No superscoring or MyBest.",
      source: "https://admissions.wisc.edu/international/",
    },
    cost: {
      value: 65120,
      source: "https://financialaid.wisc.edu/cost-of-attendance/",
      year: "2026-27",
      note: "Published undergraduate Non Resident COA total; internationals are charged non-resident rates and have additional International Student Fees not included.",
    },
    aid: {
      value: "limited",
      source: "https://admissions.wisc.edu/international-scholarships/",
      note: "Internationals on F-1/J-1 visas do not qualify for federal or state aid and most are self-funded; a few scholarships exist (e.g. King-Morgridge, six students a year).",
    },
    urls: {
      admissions: "https://admissions.wisc.edu/",
      international: "https://admissions.wisc.edu/international/",
      cost: "https://financialaid.wisc.edu/cost-of-attendance/",
      aid: "https://admissions.wisc.edu/international-scholarships/",
    },
  },
  {
    slug: "wyoming",
    state: "Wyoming",
    code: "WY",
    region: "West",
    university: "University of Wyoming",
    city: "Laramie",
    rank: {
      label: "#250 National Universities (tie)",
      edition: "U.S. News 2027",
      source: "https://www.usnews.com/best-colleges/university-of-wyoming-3932",
    },
    image: {
      src: "/media/universities/wyoming.webp",
      card: "/media/universities/wyoming-card.webp",
      title: "Old Main University of Wyoming September 2012.JPG",
      page: "https://commons.wikimedia.org/wiki/File:Old_Main_University_of_Wyoming_September_2012.JPG",
      author: "Thecoldmidwest",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    gpa: {
      value: "2.5 minimum (International Direct first-year admission)",
      source: "https://international.uwyo.edu/undergraduate-admissions/",
    },
    test: {
      value: "optional",
      source: "https://www.uwyo.edu/registrar/_files/docs/previous-catalogs/2026-27-catalog.pdf",
      note: "Test-optional for admission through spring 2029; ACT/SAT can raise scholarship amounts",
    },
    english: {
      ielts: 6,
      toefl: 71,
      duolingo: 100,
      note: "International Direct admission minimums (also iTEP 4.0); lower scores route to Academic Accelerator pathway programmes.",
      source: "https://international.uwyo.edu/undergraduate-admissions/",
    },
    cost: {
      value: null,
      source: null,
      year: "2026-27",
      note: "COA page groups non-resident and international students but shows totals only via an interactive calculator; non-resident block tuition is $11,235 per semester.",
    },
    aid: {
      value: "merit-only",
      source: "https://www.uwyo.edu/admissions/international/requirements-first-year.html",
      note: "Eligible international freshmen may qualify for the International Brown & Gold Commitment scholarship based on GPA; proof of financial support still required.",
    },
    urls: {
      admissions: "https://www.uwyo.edu/admissions/freshman/",
      international: "https://www.uwyo.edu/admissions/international/requirements-first-year.html",
      cost: "https://www.uwyo.edu/sfa/cost-of-attendance/undergraduate.html",
      aid: "https://www.uwyo.edu/sfa/scholarships/international/index.html",
    },
  },
];

export const stateBySlug = (slug: string) => STATE_UNIVERSITIES.find((s) => s.slug === slug);
