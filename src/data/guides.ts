// Long-form guides: one pre-rendered page each at /resources/blog/<slug> (scripts/generate-index.js).
// Every fee, date and rule is checked against the official page linked next to it. When a figure
// changes, update it here, update `checked`, and keep the link. If a figure can't be confirmed on an
// official page, leave it out rather than guess. Never promise visa or scholarship outcomes.
//
// Text format: paragraphs and list items are plain strings. Links are written as [text](url):
// internal links start with "/", external ones with "https://".

export type GuideBlock = string | { list: string[] } | { steps: string[] };

export type Guide = {
  slug: string;
  /** <title>: about 60 characters or fewer, includes the target keyword. */
  title: string;
  /** Meta description: about 155 characters or fewer. */
  description: string;
  /** Short name for the breadcrumb trail and the blog list. */
  crumb: string;
  h1: string;
  /** First paragraph (uses the keyword). */
  lead: string;
  published: string;
  /** When the facts were last checked against the official sources (ISO date). */
  checked: string;
  sections: { h2: string; blocks: GuideBlock[] }[];
  faqs: { q: string; a: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "study-abroad-from-bangladesh",
    title: "Study Abroad from Bangladesh: Step-by-Step | Scholars Cafe",
    description:
      "How to study abroad from Bangladesh, step by step: choosing a country, tests, documents, applications, funding, the student visa and getting ready to fly.",
    crumb: "Study abroad from Bangladesh",
    h1: "How to study abroad from Bangladesh: a step-by-step guide",
    lead: "Planning to study abroad from Bangladesh can feel like a hundred small tasks at once. It gets easier when you do them in order. This guide walks you through the whole process, from picking a country to the week before your flight, so you and your family know what comes next and what it will cost to get there.",
    published: "2026-11-28",
    checked: "2026-11-28",
    sections: [
      {
        h2: "Step 1: Choose a country and a level of study",
        blocks: [
          "Start with three questions: what do you want to study, at what level (bachelor's, master's or PhD), and what can your family realistically spend each year? Your answers narrow the list of countries quickly.",
          "Each country works differently for students from Bangladesh:",
          {
            list: [
              "**United States:** many universities, a flexible first two years where you can change your major, and need-based or merit aid at some colleges. The student visa is the F-1. See our [US student visa guide](/resources/blog/student-visa-usa-from-bangladesh).",
              "**United Kingdom:** master's degrees are usually one year, which lowers the total cost. Funding includes Chevening, Commonwealth and GREAT Scholarships. See our [UK scholarships guide](/resources/blog/uk-scholarships-for-bangladeshi-students).",
              "**Australia:** you need a Confirmation of Enrolment, health cover and a Genuine Student answer for the visa. See our [Australia student visa guide](/resources/blog/australia-student-visa-fee-for-bangladesh).",
              "**Canada, Europe and Asia:** also worth a look. Check the country's official immigration website for its current study permit rules before you plan around it.",
            ],
          },
          "Look up the official cost of attendance on each university's own website, not on a forum. Tuition, housing, food and health insurance all add up, and the visa will ask you to show you can pay for them.",
        ],
      },
      {
        h2: "Step 2: Plan your English and admission tests",
        blocks: [
          "Most universities ask for an English test such as IELTS, TOEFL iBT, PTE Academic or the Duolingo English Test. Which tests are accepted, and the minimum scores, are set by each university and sometimes by the visa rules too. Check both before you book.",
          "Some US colleges ask for the SAT or ACT, while many are test-optional. Some graduate programs ask for the GRE or GMAT. Give yourself time to retake a test if your first score falls short, and book test dates well before application deadlines.",
        ],
      },
      {
        h2: "Step 3: Get your documents ready early",
        blocks: [
          "Documents take longer than students expect, especially when they need signatures from a school or a bank. Start this list early:",
          {
            list: [
              "A valid passport. Apply or renew through the [Department of Immigration and Passports](https://www.dip.gov.bd/) if yours will expire soon.",
              "SSC and HSC (or O and A Level) certificates and transcripts, plus university transcripts for postgraduate study.",
              "English test results.",
              "Recommendation letters from teachers or employers.",
              "A personal statement or essays, written by you.",
              "A CV or activity list.",
              "Financial documents: bank statements, sponsor letters and proof of income.",
            ],
          },
          "Keep a scanned copy of everything in one folder. You will upload the same papers many times.",
        ],
      },
      {
        h2: "Step 4: Build a balanced list and apply",
        blocks: [
          "Apply to a mix of universities: some where your grades are well above the usual admit profile, some where you are a typical applicant, and a few reaches. Read each university's international admissions page for its deadlines, required documents and application fee.",
          "Essays matter, especially for the US and for scholarships. Write about real experiences in your own voice. Our [programs](/programs) page explains how our mentors help with the college list and essays if you want support.",
        ],
      },
      {
        h2: "Step 5: Work out how you will pay",
        blocks: [
          "Look at funding at the same time as admissions, not after. The main sources are:",
          {
            list: [
              "University scholarships and financial aid, listed on each university's website.",
              "Government scholarships such as [Chevening](https://www.chevening.org/scholarship/bangladesh/) and [Commonwealth Scholarships](https://cscuk.fcdo.gov.uk/scholarships/) for the UK.",
              "Family savings, an education loan from a bank, or a sponsor.",
            ],
          },
          "Most student visas ask you to prove you can cover tuition and living costs. Keep your funds in clear, documented form, and ask your bank how long it takes to issue statements and solvency certificates.",
        ],
      },
      {
        h2: "Step 6: Apply for your student visa",
        blocks: [
          "Once you accept an offer, the university sends the document the visa needs: an I-20 for the US, a CAS for the UK, or a CoE for Australia. Then you apply for the visa itself. Each country's rules and fees are different, so read the official pages and our country guides:",
          {
            list: [
              "USA: [F-1 student visa from Bangladesh](/resources/blog/student-visa-usa-from-bangladesh)",
              "UK: [Student visa on GOV.UK](https://www.gov.uk/student-visa)",
              "Australia: [Subclass 500 fee and checklist](/resources/blog/australia-student-visa-fee-for-bangladesh)",
            ],
          },
          "Apply as early as the rules allow. Be honest on every form. Nobody can guarantee a visa, so be careful with anyone who promises one.",
        ],
      },
      {
        h2: "Step 7: Get ready to leave",
        blocks: [
          "After the visa, a few last jobs remain:",
          {
            list: [
              "Book a flight that lands before your orientation, within the dates your visa allows.",
              "Arrange housing, and confirm your health insurance starts when you arrive.",
              "Carry original documents in your hand luggage: passport, visa, offer letter, I-20 or CAS or CoE, and financial papers.",
              "Bring some money in the local currency or a card that works abroad for the first weeks.",
              "Read the university's pre-arrival emails and join its orientation.",
            ],
          },
        ],
      },
      {
        h2: "Where Scholars Cafe can help",
        blocks: [
          "Our mentors work with Bangladeshi students on college lists, essays, scholarships and visa interview practice. You can see what we offer on our [services](/services) page. If you would like to talk through your plan, [book a free consultation](/book). There is no pressure to sign up.",
        ],
      },
    ],
    faqs: [
      {
        q: "When should I start planning to study abroad from Bangladesh?",
        a: "Start about 12 to 18 months before you want to begin classes. That leaves time for English tests, documents, applications, scholarship deadlines and the visa.",
      },
      {
        q: "Do I need IELTS to study abroad?",
        a: "Most universities ask for an English test, but many accept others such as TOEFL iBT, PTE Academic or the Duolingo English Test. Check each university's admissions page, and check the visa rules for the country too.",
      },
      {
        q: "Can I study abroad without paying full fees?",
        a: "Some students do, through university aid or scholarships such as Chevening, Commonwealth or GREAT Scholarships for the UK. These are competitive, so apply to several and have a backup plan.",
      },
    ],
  },
  {
    slug: "uk-scholarships-for-bangladeshi-students",
    title: "UK Scholarships for Bangladeshi Students | Scholars Cafe",
    description:
      "UK scholarships for Bangladeshi students: Chevening, Commonwealth and GREAT Scholarships, university awards, who can apply, and how to apply.",
    crumb: "UK scholarships for Bangladeshi students",
    h1: "UK scholarships for Bangladeshi students",
    lead: "There are real UK scholarships for Bangladeshi students, from fully funded government awards to tuition discounts from individual universities. This guide explains the main schemes, who can apply, how the applications work, and the visa costs you should plan for even with a scholarship.",
    published: "2026-11-28",
    checked: "2026-11-28",
    sections: [
      {
        h2: "Chevening Scholarships",
        blocks: [
          "Chevening is the UK government's scholarship for future leaders. It funds a [one-year master's degree in the UK](https://www.chevening.org/scholarships/), and Bangladesh is an eligible country. Chevening's own pages explain exactly what the award covers.",
          "To apply, [Chevening says you must](https://www.chevening.org/scholarships/who-can-apply/):",
          {
            list: [
              "be a citizen of a Chevening-eligible country, such as Bangladesh",
              "commit to returning to your home country for at least two years after your scholarship ends",
              "have at least two years' work experience after your undergraduate degree, equal to 2,800 hours. Full-time, part-time, voluntary work and internships can count",
              "hold an undergraduate degree that qualifies you for a UK master's",
              "apply to three different eligible UK university courses and get an unconditional offer from one of them by the deadline",
            ],
          },
          "There is no upper age limit. You cannot apply if you are a British or dual British citizen.",
          "**Timeline:** for the 2027/28 cycle, applications opened in August 2026 and closed in October 2026, so this round is closed. Chevening's [application timeline](https://www.chevening.org/scholarships/application-timeline/) shows interviews from March to April 2027 and results in mid-June 2027. Expect the next round to follow a similar pattern, and check the [Bangladesh page](https://www.chevening.org/scholarship/bangladesh/) for the exact dates.",
        ],
      },
      {
        h2: "Commonwealth Scholarships",
        blocks: [
          "The Commonwealth Scholarship Commission (CSC) funds master's and PhD study in the UK for people who could not afford it otherwise. Bangladesh is eligible for both.",
          "**Commonwealth Master's Scholarships** are for [one-year taught master's courses](https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/), not MBAs. You need at least an upper second-class (2:1) honours first degree, or a lower second plus a relevant postgraduate qualification. The CSC page lists what it covers, including approved return airfare, full tuition fees and a monthly stipend (£1,712, or £2,000 at London universities, at the time of checking).",
          "**Commonwealth PhD Scholarships** fund [36 months of full-time doctoral study](https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships/) and need a supporting statement from a proposed UK supervisor.",
          "**How to apply from Bangladesh:** the CSC does not take direct applications. You apply to the CSC online and also to a nominator. For Bangladesh, the [national nominating agency](https://cscuk.fcdo.gov.uk/national-nominating-agencies/) is the Secondary and Higher Education Division of the Ministry of Education ([shed.gov.bd](https://shed.gov.bd/)). It sets its own closing dates and selection rules, so watch its notices.",
          "**Timeline:** applications for 2027/28 closed on 20 October 2026, with results expected by July 2027.",
        ],
      },
      {
        h2: "GREAT Scholarships",
        blocks: [
          "GREAT Scholarships give [£10,000 towards tuition fees](https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships) for a one-year taught postgraduate course. They are funded by the UK government's GREAT Britain Campaign, the British Council and the universities. Bangladesh is one of the eligible countries.",
          "For 2026-27, the [Bangladesh page](https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/bangladesh) lists Cranfield University, Leeds Arts University, Keele University, the University of Manchester, Ulster University, the University of East Anglia, the University of Glasgow, the University of Hull and the University of Portsmouth.",
          "You need a Bangladeshi passport and permanent residence, an undergraduate degree, and the university's English requirement. You apply through each university, and each one sets its own deadline and subjects.",
        ],
      },
      {
        h2: "University scholarships",
        blocks: [
          "Most UK universities offer their own scholarships for international students. Many are partial awards that reduce tuition, and some are automatic once you hold an offer. To find them:",
          {
            list: [
              "Go to the university's own scholarships or fees page and filter for international or postgraduate students.",
              "Note whether you need a separate application, and its deadline. Some close months before the course starts.",
              "Check whether the award depends on your grades, your subject or your country.",
            ],
          },
          "Treat any scholarship list on a third-party site as a starting point only. The university's page is the one that counts.",
        ],
      },
      {
        h2: "How to apply for UK scholarships for Bangladeshi students",
        blocks: [
          {
            steps: [
              "Choose your course first. Most awards need an offer, or at least an application, to a specific course.",
              "Make a list of every scheme you are eligible for and its deadline. Government awards close up to a year before the course starts.",
              "Write each essay or statement for that scheme. Chevening, for example, looks at leadership and networking, while Commonwealth looks at development impact.",
              "Ask referees early and give them your deadlines.",
              "Prepare for interviews where the scheme has them.",
              "Keep applying to universities while you wait. Results come late in the cycle.",
            ],
          },
        ],
      },
      {
        h2: "Visa costs to plan for, even with a scholarship",
        blocks: [
          "You will still need a UK Student visa. On [GOV.UK](https://www.gov.uk/student-visa), the fee to apply from outside the UK is £558, and the earliest you can apply is 6 months before your course starts. You also need a Confirmation of Acceptance for Studies (CAS) from your university.",
          "You usually pay the [Immigration Health Surcharge](https://www.gov.uk/healthcare-immigration-application/how-much-pay) too: £776 per year for students.",
          "Unless your scholarship covers it, you must show [money for living costs](https://www.gov.uk/student-visa/money): £1,529 a month in London or £1,171 a month outside London, for up to 9 months, held for at least 28 days in a row.",
          "Bangladesh is on the UK's [TB test country list](https://www.gov.uk/tb-test-visa/countries-where-you-need-a-tb-test-to-enter-the-uk), so check whether you need a test at an approved clinic before you apply.",
        ],
      },
      {
        h2: "Getting help",
        blocks: [
          "Scholarship essays take several drafts. If you want a mentor to read yours or help you plan your list, see our [services](/services) or [book a free consultation](/book). For the bigger picture, read [how to study abroad from Bangladesh](/resources/blog/study-abroad-from-bangladesh).",
        ],
      },
    ],
    faqs: [
      {
        q: "Can Bangladeshi students get a fully funded scholarship in the UK?",
        a: "Yes. Chevening and Commonwealth Scholarships are fully funded awards open to Bangladeshi citizens. They are competitive, and each has its own eligibility rules and deadlines.",
      },
      {
        q: "Do I need work experience for Chevening?",
        a: "Yes. Chevening asks for at least two years of work experience after your undergraduate degree, equal to 2,800 hours. Voluntary work and internships can count.",
      },
      {
        q: "Who nominates Bangladeshi candidates for Commonwealth Scholarships?",
        a: "The national nominating agency for Bangladesh is the Secondary and Higher Education Division of the Ministry of Education. You apply to it and to the Commonwealth Scholarship Commission.",
      },
      {
        q: "How much is a GREAT Scholarship worth?",
        a: "GREAT Scholarships give £10,000 towards tuition fees for a one-year taught postgraduate course at a participating UK university.",
      },
    ],
  },
  {
    slug: "student-visa-usa-from-bangladesh",
    title: "Student Visa USA from Bangladesh: F-1 Guide | Scholars Cafe",
    description:
      "How to get a student visa for the USA from Bangladesh: the I-20, SEVIS fee, DS-160, visa fee, the interview at the US Embassy Dhaka and documents to bring.",
    crumb: "Student visa USA from Bangladesh",
    h1: "Student visa USA from Bangladesh: the F-1 process",
    lead: "If you have been admitted to a US university, the next step is the F-1 student visa. Getting a student visa for the USA from Bangladesh follows a fixed order: the I-20, the SEVIS fee, the DS-160 form, the visa fee and an interview at the US Embassy in Dhaka. This guide explains each step and the documents to bring.",
    published: "2026-11-28",
    checked: "2026-11-28",
    sections: [
      {
        h2: "The student visa USA from Bangladesh, step by step",
        blocks: [
          {
            steps: [
              "**Get admitted and receive your Form I-20.** Your university must be certified by the Student and Exchange Visitor Program (SEVP). After you accept its offer and send proof of funding, it issues a Form I-20 with your SEVIS ID. Check that your name matches your passport.",
              "**Pay the SEVIS I-901 fee.** It is $350 for F-1 students, according to [ICE](https://www.ice.gov/sevis/i901), and you pay it at [fmjfee.com](https://www.fmjfee.com/). This fee is separate from the visa fee. Print the payment confirmation.",
              "**Fill in the DS-160.** This is the online visa application at [ceac.state.gov](https://ceac.state.gov/genniv/). Answer every question truthfully and keep the confirmation page with its barcode.",
              "**Pay the visa application fee.** The fee for an F-1 visa is $185 under the US fee schedule ([22 CFR 22.1](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-C/part-22/section-22.1)). The [US Embassy in Bangladesh](https://bd.usembassy.gov/visas/) says visa application fees are non-refundable.",
              "**Book your interview.** The embassy directs applicants to [ustraveldocs.com](https://ustraveldocs.com/bd/en/) to pay and schedule. Interviews for applicants in Bangladesh are at the US Embassy in Dhaka.",
              "**Attend the interview** with your documents, then follow the officer's instructions on passport collection.",
            ],
          },
        ],
      },
      {
        h2: "Documents to bring to the interview",
        blocks: [
          "Bring originals, neatly organised so you can hand over what the officer asks for:",
          {
            list: [
              "Your valid passport",
              "The DS-160 confirmation page",
              "Your Form I-20, signed by you and your school",
              "The SEVIS I-901 fee receipt",
              "The visa fee receipt and appointment confirmation",
              "A photo that meets the US visa photo rules, if asked",
              "Financial evidence: bank statements, sponsor letters, proof of income, and any scholarship or aid letter",
              "Academic records: SSC and HSC or O and A Level certificates, transcripts and test scores",
            ],
          },
          "The officer may not ask to see most of these, but you should have them ready.",
        ],
      },
      {
        h2: "Rules to know before you apply",
        blocks: [
          "**Social media:** the US Embassy in Bangladesh says F, M and J visa applicants must set the privacy settings on all their social media accounts to public, to allow vetting. Do this before your interview.",
          "**The visitor visa bond is not for students:** the embassy's $20,000 bond notice applies to B1/B2 visitor visas for Bangladeshi nationals, not to the F-1.",
          "**Other fees:** some visas also carry a reciprocity issuance fee, which depends on your nationality. Check [Bangladesh's reciprocity schedule](https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Bangladesh.html) and the official fee pages for any new fees before you pay.",
          "**Policies change:** US visa rules have changed several times recently. Read the notices on the [embassy's visa page](https://bd.usembassy.gov/visas/) and [travel.state.gov](https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html) close to your interview date.",
        ],
      },
      {
        h2: "Preparing for the interview",
        blocks: [
          "The interview is short. The officer wants to understand your study plan, how you will pay, and your ties to Bangladesh. Good preparation means:",
          {
            list: [
              "Knowing why you chose your university and course, in your own words.",
              "Knowing your costs from the I-20 and who is paying them.",
              "Speaking clearly and honestly. Memorised scripts tend to sound memorised.",
              "Bringing documents that match what you wrote on the DS-160.",
            ],
          },
          "No one can guarantee a visa, and you should be wary of anyone who says they can.",
        ],
      },
      {
        h2: "How Scholars Cafe can help",
        blocks: [
          "Our mentors run mock F-1 interviews and help students check their documents. See our [programs](/programs) and [services](/services), or [book a free consultation](/book) to talk through your case. If you are still choosing where to study, start with [how to study abroad from Bangladesh](/resources/blog/study-abroad-from-bangladesh).",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a US student visa cost from Bangladesh?",
        a: "The F-1 visa application fee is $185 and the SEVIS I-901 fee is $350, both at the time of checking. A reciprocity fee or other new fees may also apply, so check the official fee pages before you pay.",
      },
      {
        q: "Where is the F-1 visa interview held for Bangladeshi students?",
        a: "Applicants in Bangladesh interview at the US Embassy in Dhaka. You pay the fee and book the appointment through ustraveldocs.com, as directed by the embassy.",
      },
      {
        q: "Is the SEVIS fee the same as the visa fee?",
        a: "No. The SEVIS I-901 fee is paid to the US Department of Homeland Security at fmjfee.com. The visa application fee is a separate payment for the visa itself.",
      },
      {
        q: "Do I need a public social media account for the F-1 visa?",
        a: "The US Embassy in Bangladesh says F, M and J applicants must set all social media accounts to public to allow vetting.",
      },
    ],
  },
  {
    slug: "australia-student-visa-fee-for-bangladesh",
    title: "Australia Student Visa Fee for Bangladesh | Scholars Cafe",
    description:
      "The Australia student visa fee for Bangladesh, plus the subclass 500 documents checklist, Genuine Student requirement, proof of funds and OSHC.",
    crumb: "Australia student visa fee for Bangladesh",
    h1: "Australia student visa fee for Bangladesh, and what else you need",
    lead: "The Australia student visa fee for Bangladesh applicants starts at AUD 2,500 for the main applicant, according to the Department of Home Affairs. This guide explains that fee, the extra costs around it, and everything else the subclass 500 Student visa asks for: your CoE, a Genuine Student answer, proof of funds and health cover.",
    published: "2026-11-28",
    checked: "2026-11-28",
    sections: [
      {
        h2: "The Australia student visa fee for Bangladesh",
        blocks: [
          "The [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500) costs from AUD 2,500 for the main applicant. There is an extra charge for each family member included in the application.",
          "Other costs can come on top, such as health checks, police certificates and biometrics. Home Affairs suggests using its Visa Pricing Estimator to work out your total, but notes that the estimator leaves out those other costs.",
          "From 28 November 2026, a new Onshore Application Charge applies to some Student visa applications made inside Australia. It does not change the fee for a first application from Bangladesh, which is made from outside Australia.",
          "Fees change, so check the Home Affairs page on the day you pay.",
        ],
      },
      {
        h2: "Who can apply",
        blocks: [
          "Home Affairs says you must:",
          {
            list: [
              "apply online through ImmiAccount, from outside Australia (unless an exemption applies)",
              "be enrolled in a course and hold a valid Confirmation of Enrolment (CoE) when the visa is decided",
              "hold Overseas Student Health Cover (OSHC), unless an exemption applies",
              "be 6 years or older, and have a welfare arrangement if you are under 18",
              "meet the Genuine Student requirement, plus the health and character requirements",
            ],
          },
          "The visa lets you stay for up to 6 years in line with your enrolment, and work up to 48 hours a fortnight while your course is in session.",
        ],
      },
      {
        h2: "Documents checklist",
        blocks: [
          "ImmiAccount shows a document checklist for your case. Most Bangladeshi applicants should prepare:",
          {
            list: [
              "Passport",
              "Confirmation of Enrolment (CoE) from your Australian provider",
              "Genuine Student answers, with supporting documents",
              "English test results, if required for your course and case",
              "Evidence of funds, if the checklist asks for it",
              "OSHC policy details",
              "Academic transcripts and certificates",
              "Employment documents, if you have worked",
              "Welfare arrangement details if you are under 18",
            ],
          },
        ],
      },
      {
        h2: "Genuine Student (GS), which replaced GTE",
        blocks: [
          "The [Genuine Student requirement](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement) applies to applications lodged on or after 23 March 2024. It replaced the old Genuine Temporary Entrant (GTE) statement.",
          "Instead of a separate statement, you answer questions in the online form, in English, with a 150-word limit for each answer. The questions cover:",
          {
            list: [
              "your current circumstances, such as ties to family, community and work, and your economic situation",
              "why you want this course with this provider in Australia, and what you understand about the course and living in Australia",
              "how the course will benefit you",
              "any other relevant information",
            ],
          },
          "Home Affairs gives more weight to answers backed by documents, such as transcripts, employment letters and evidence of your situation in Bangladesh. If a similar course is available at home, explain why you chose Australia.",
        ],
      },
      {
        h2: "Financial capacity: proof you can pay",
        blocks: [
          "If your document checklist asks for evidence of funds, you must attach it when you apply. Home Affairs may refuse an application without asking again if it is missing. Even if the checklist doesn't ask, the department can request it later.",
          "Accepted evidence includes money deposited with a financial institution, loans from a government or financial institution, and scholarships. The minimum amounts for living costs, tuition and travel are set by Home Affairs. Check the current figures on the [subclass 500 page](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500) before you prepare your statements.",
          "Instead, you can show that your parents or partner earned at least AUD 87,856 in the 12 months before you apply (AUD 102,500 if family members come with you). This must be shown with official government documents such as tax assessments, not bank statements.",
        ],
      },
      {
        h2: "Overseas Student Health Cover (OSHC)",
        blocks: [
          "You need OSHC from an approved Australian insurer. If you apply from outside Australia, your cover must start on the day you arrive, not the day your course starts. You must not enter Australia before your OSHC begins, and you must keep it until you leave.",
        ],
      },
      {
        h2: "After you apply",
        blocks: [
          "Home Affairs may ask for biometrics, and you then have 14 days to provide them. If you did not do your health exams before applying, ImmiAccount will tell you whether you need them. Processing times vary, so use the official processing time guide rather than a fixed number from a website.",
          "Applications from outside Australia are processed in line with a Ministerial Direction; for those lodged on or after 14 November 2025, that is Ministerial Direction 115.",
        ],
      },
      {
        h2: "Getting help",
        blocks: [
          "Home Affairs says only a registered migration agent, a legal practitioner or an exempt person can give you immigration assistance. Scholars Cafe helps with university choices, applications and essays. See our [services](/services) or [book a free consultation](/book). You may also find our [study abroad from Bangladesh guide](/resources/blog/study-abroad-from-bangladesh) useful.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is the Australia student visa fee for Bangladesh?",
        a: "The subclass 500 Student visa costs from AUD 2,500 for the main applicant, with an extra charge for each family member. Health checks, police certificates and biometrics can add to the cost.",
      },
      {
        q: "Is GTE still required for an Australian student visa?",
        a: "No. Applications lodged on or after 23 March 2024 are assessed under the Genuine Student (GS) requirement. You answer GS questions in the online form, up to 150 words each.",
      },
      {
        q: "When must my OSHC start?",
        a: "If you apply from outside Australia, your OSHC must start on the day you arrive in Australia, not the day your course begins.",
      },
      {
        q: "Can I use my parents' income instead of bank savings?",
        a: "Yes. You can show your parents or partner earned at least AUD 87,856 in the 12 months before you apply, or AUD 102,500 if family members come with you, using official government documents such as tax assessments.",
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
