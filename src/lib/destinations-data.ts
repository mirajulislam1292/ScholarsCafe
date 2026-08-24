import ukImg from "@/assets/uni-uk.jpg";
import caImg from "@/assets/uni-canada.jpg";
import deImg from "@/assets/uni-germany.jpg";
import seImg from "@/assets/uni-sweden.jpg";
import krImg from "@/assets/uni-korea.jpg";
import nlImg from "@/assets/uni-netherlands.jpg";
import fiImg from "@/assets/uni-finland.jpg";
import nzImg from "@/assets/uni-nz.jpg";
import huImg from "@/assets/uni-hungary.jpg";
import trImg from "@/assets/uni-turkey.jpg";
import esImg from "@/assets/uni-spain.jpg";
import usImg from "@/assets/hero-campus.jpg";

export type DestinationDetail = {
  iso: string; // ISO_A3
  name: string;
  flag: string;
  tag: string;
  tagline: string;
  blurb: string;
  image: string;
  universities: { name: string; city: string; highlight: string }[];
  highlights: string[];
  intake: string;
  avgCost: string;
  language: string;
  visaNote: string;
};

export const DESTINATIONS: DestinationDetail[] = [
  {
    iso: "USA",
    name: "United States",
    flag: "🇺🇸",
    tag: "Primary focus",
    tagline: "Need-based aid · Top-50 admissions",
    blurb:
      "The deepest pool of need-based scholarships in the world. Liberal arts colleges and Ivy League schools meeting 100% of demonstrated need for international students.",
    image: usImg,
    universities: [
      { name: "Harvard University", city: "Cambridge, MA", highlight: "100% need-met · 3% acceptance" },
      { name: "MIT", city: "Cambridge, MA", highlight: "STEM powerhouse · 100% need-met" },
      { name: "Amherst College", city: "Amherst, MA", highlight: "Liberal arts · 100% need-met" },
      { name: "Williams College", city: "Williamstown, MA", highlight: "#1 LAC · 100% need-met" },
      { name: "NYU", city: "New York, NY", highlight: "Global flagship · merit aid" },
    ],
    highlights: ["CSS Profile + ISFAA support", "Common App + supplements", "Test-optional pathways"],
    intake: "Aug / Jan",
    avgCost: "$0 – $30k after aid",
    language: "English (TOEFL / IELTS / DET)",
    visaNote: "F-1 student visa · DS-160 + I-20",
  },
  {
    iso: "GBR",
    name: "United Kingdom",
    flag: "🇬🇧",
    tag: "UCAS support",
    tagline: "Russell Group · merit scholarships",
    blurb:
      "Three-year undergraduate degrees, prestigious research universities, and merit-based scholarships specifically for international students.",
    image: ukImg,
    universities: [
      { name: "University College London", city: "London", highlight: "Top 10 globally" },
      { name: "Imperial College London", city: "London", highlight: "STEM elite · 14% acceptance" },
      { name: "University of Edinburgh", city: "Edinburgh", highlight: "Russell Group" },
      { name: "University of Manchester", city: "Manchester", highlight: "Strong scholarships" },
    ],
    highlights: ["UCAS application support", "Personal Statement coaching", "Russell Group strategy"],
    intake: "Sep / Oct",
    avgCost: "£15k – £35k / year",
    language: "English (IELTS 6.5+ typical)",
    visaNote: "Student visa · CAS + financial proof",
  },
  {
    iso: "CAN",
    name: "Canada",
    flag: "🇨🇦",
    tag: "SDS visa",
    tagline: "U of T · UBC · McGill",
    blurb:
      "Welcoming for Bangladeshi students under the Student Direct Stream (SDS). Strong post-graduation work permits and pathways to PR.",
    image: caImg,
    universities: [
      { name: "University of Toronto", city: "Toronto", highlight: "#1 in Canada" },
      { name: "UBC", city: "Vancouver", highlight: "Globally ranked" },
      { name: "McGill University", city: "Montreal", highlight: "Affordable elite" },
    ],
    highlights: ["SDS visa pathway", "Entrance scholarships", "PGWP + PR strategy"],
    intake: "Sep / Jan / May",
    avgCost: "CAD 25k – 60k / year",
    language: "English / French",
    visaNote: "Study Permit · GIC + tuition deposit",
  },
  {
    iso: "DEU",
    name: "Germany",
    flag: "🇩🇪",
    tag: "Free tuition",
    tagline: "TU Munich · RWTH · Heidelberg",
    blurb:
      "Public universities with zero tuition for international students. World-class engineering, research, and a strong post-study work visa.",
    image: deImg,
    universities: [
      { name: "TU Munich", city: "Munich", highlight: "Top STEM · tuition-free" },
      { name: "RWTH Aachen", city: "Aachen", highlight: "Engineering elite" },
      { name: "Heidelberg University", city: "Heidelberg", highlight: "Oldest German university" },
    ],
    highlights: ["APS certification", "Blocked account guidance", "DAAD scholarships"],
    intake: "Apr / Oct",
    avgCost: "€0 tuition · €11k living",
    language: "English / German (B1+)",
    visaNote: "National student visa · APS required",
  },
  {
    iso: "SWE",
    name: "Sweden",
    flag: "🇸🇪",
    tag: "SI scholarship",
    tagline: "Uppsala · Lund · KTH",
    blurb:
      "Innovation, design, and sustainability — taught entirely in English. The Swedish Institute scholarship covers tuition, living, and travel.",
    image: seImg,
    universities: [
      { name: "Uppsala University", city: "Uppsala", highlight: "Sweden's oldest" },
      { name: "Lund University", city: "Lund", highlight: "Top globally ranked" },
      { name: "KTH Royal Institute", city: "Stockholm", highlight: "Engineering excellence" },
    ],
    highlights: ["SI Scholarship application", "English-taught Master's", "Universityadmissions.se"],
    intake: "Aug / Jan",
    avgCost: "SEK 80k – 145k / year",
    language: "English",
    visaNote: "Residence permit · proof of funds",
  },
  {
    iso: "NLD",
    name: "Netherlands",
    flag: "🇳🇱",
    tag: "English-taught",
    tagline: "TU Delft · Amsterdam · Utrecht",
    blurb:
      "More English-taught programs than any other non-English-speaking country. Innovation hubs, international classrooms, and a year of post-study work.",
    image: nlImg,
    universities: [
      { name: "TU Delft", city: "Delft", highlight: "World-class engineering" },
      { name: "University of Amsterdam", city: "Amsterdam", highlight: "Top research university" },
      { name: "Utrecht University", city: "Utrecht", highlight: "Strong life sciences" },
    ],
    highlights: ["Holland Scholarship", "Studielink application", "Orientation Year visa"],
    intake: "Sep / Feb",
    avgCost: "€8k – €20k / year",
    language: "English",
    visaNote: "MVV residence permit · funded by university",
  },
  {
    iso: "FIN",
    name: "Finland",
    flag: "🇫🇮",
    tag: "Nordic quality",
    tagline: "Aalto · Helsinki · Tampere",
    blurb:
      "Tuition scholarships for top applicants. Design, technology, and education programs ranked among the best in Europe.",
    image: fiImg,
    universities: [
      { name: "University of Helsinki", city: "Helsinki", highlight: "#1 in Finland" },
      { name: "Aalto University", city: "Espoo", highlight: "Design + tech" },
      { name: "Tampere University", city: "Tampere", highlight: "Strong tech research" },
    ],
    highlights: ["Tuition waiver scholarships", "Studyinfo.fi", "Entrance exam prep"],
    intake: "Aug / Jan",
    avgCost: "€8k – €18k / year",
    language: "English",
    visaNote: "Residence permit · proof of funds",
  },
  {
    iso: "NZL",
    name: "New Zealand",
    flag: "🇳🇿",
    tag: "Student-friendly",
    tagline: "Auckland · Otago · Victoria",
    blurb:
      "Eight world-ranked universities, generous post-study work rights, and a calm, safe environment for first-time international students.",
    image: nzImg,
    universities: [
      { name: "University of Auckland", city: "Auckland", highlight: "#1 in NZ" },
      { name: "University of Otago", city: "Dunedin", highlight: "Strong sciences" },
      { name: "Victoria University", city: "Wellington", highlight: "Capital flagship" },
    ],
    highlights: ["NZ Excellence Awards", "Post-study work visa", "Pathway colleges"],
    intake: "Feb / Jul",
    avgCost: "NZD 22k – 45k / year",
    language: "English",
    visaNote: "Student visa · INZ online",
  },
  {
    iso: "HUN",
    name: "Hungary",
    flag: "🇭🇺",
    tag: "Stipendium Hungaricum",
    tagline: "Affordable · government-funded",
    blurb:
      "Government scholarship covers tuition, monthly stipend, and accommodation. Hundreds of programs in English across medical, engineering, and humanities.",
    image: huImg,
    universities: [
      { name: "Eötvös Loránd University", city: "Budapest", highlight: "Hungary's flagship" },
      { name: "University of Debrecen", city: "Debrecen", highlight: "Medical excellence" },
      { name: "Semmelweis University", city: "Budapest", highlight: "Top medical school" },
    ],
    highlights: ["Stipendium Hungaricum application", "MoHE nomination guidance", "Document attestation"],
    intake: "Sep",
    avgCost: "Fully funded (scholarship)",
    language: "English",
    visaNote: "Residence permit · scholarship-backed",
  },
  {
    iso: "KOR",
    name: "South Korea",
    flag: "🇰🇷",
    tag: "GKS full scholarship",
    tagline: "Yonsei · KAIST · SNU",
    blurb:
      "The Global Korea Scholarship covers tuition, monthly stipend, language training, and round-trip flights. Highly competitive but life-changing.",
    image: krImg,
    universities: [
      { name: "Seoul National University", city: "Seoul", highlight: "#1 in Korea" },
      { name: "Yonsei University", city: "Seoul", highlight: "SKY university" },
      { name: "KAIST", city: "Daejeon", highlight: "Asia's MIT" },
    ],
    highlights: ["GKS embassy + university track", "Study plan + SOP coaching", "Korean language prep"],
    intake: "Mar / Sep",
    avgCost: "Fully funded (GKS)",
    language: "English / Korean",
    visaNote: "D-2 student visa · scholarship CoE",
  },
  {
    iso: "TUR",
    name: "Turkey",
    flag: "🇹🇷",
    tag: "Türkiye Bursları",
    tagline: "Tuition + stipend covered",
    blurb:
      "Government scholarship covering tuition, accommodation, monthly stipend, health insurance, and Turkish language training.",
    image: trImg,
    universities: [
      { name: "Boğaziçi University", city: "Istanbul", highlight: "Top Turkish university" },
      { name: "Middle East Technical Univ.", city: "Ankara", highlight: "STEM elite" },
      { name: "Istanbul Technical Univ.", city: "Istanbul", highlight: "Engineering legacy" },
    ],
    highlights: ["Türkiye Bursları application", "Interview preparation", "Document legalization"],
    intake: "Sep",
    avgCost: "Fully funded (scholarship)",
    language: "English / Turkish",
    visaNote: "Student residence permit",
  },
  {
    iso: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    tag: "Cultural & affordable",
    tagline: "Madrid · Barcelona · IE",
    blurb:
      "Affordable tuition, vibrant student cities, and English-taught business and engineering programs at globally recognized institutions.",
    image: esImg,
    universities: [
      { name: "IE University", city: "Madrid", highlight: "Top global business" },
      { name: "University of Barcelona", city: "Barcelona", highlight: "Spain's #1 research" },
      { name: "Pompeu Fabra University", city: "Barcelona", highlight: "International focus" },
    ],
    highlights: ["NIE + visa support", "English-taught programs", "Erasmus+ pathways"],
    intake: "Sep / Feb",
    avgCost: "€1.5k – €20k / year",
    language: "English / Spanish",
    visaNote: "Student visa · NIE registration",
  },
];

export const ISO_TO_DESTINATION: Record<string, DestinationDetail> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.iso, d]),
);
