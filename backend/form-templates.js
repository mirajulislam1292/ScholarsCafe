// The five Google Forms Scholars Cafe used before, rebuilt as ready-made forms (Admin → Forms → Templates).
// Titles, introductions, questions, choices and required flags are copied from the originals (November 2026);
// only the layout changed: Google's two-line question titles became a question plus help text, and the
// group headings inside the services list are marked with "# " so they show as headings, not choices.
const DONE = "Thank you! Your response has been recorded.";

const FOLLOW = `📩If you have any question regarding this cohort, feel free to reach out to our FACEBOOK PAGE or E-mail us at: contact.scholarscafe@gmail.com

🔗Subscribe us on:
YouTube: https://www.youtube.com/@ScholarsCafe09

🔗Follow us on:
Facebook: https://www.facebook.com/profile.php?id=61571394902795
Instagram: https://www.instagram.com/scholars_cafe_?igsh=MWQ1Z3F0czI2ODd6bw==
LinkedIn: https://www.linkedin.com/company/scholars-cafe09
TikTok: https://www.tiktok.com/@scholars.cafe?_t=ZS-8tjcQNWzq2H&_r=1`;

const contact = (nameLabel, emailLabel) => [
  { id: "full_name", label: nameLabel, type: "text", required: true, role: "name" },
  { id: "email", label: emailLabel, type: "email", required: true, role: "email" },
  { id: "whatsapp_number", label: "WhatsApp Number", type: "phone", required: true, role: "phone" },
];
const social = (required) => ({
  id: "social_links",
  label: "Provide any of your Social Media Links",
  type: "textarea",
  required,
  help: '(Facebook, LinkedIn, Instagram, etc)\n(If you do not have any, please write "N/A")',
});
const institution = {
  id: "institution",
  label: "Name of the Current/Previous Institution",
  type: "text",
  required: true,
};
const GRADES_HELP =
  "9/10/SSC/HSC, O level/A level/IB/AP/equivalent exams. Add your grades in bullet points. (Example: 9th Grade: SSC=5.00/ O-level= 2A* 2A,  HSC=5.00/ A level=1A* 2A)\n[If not taken, write expected scores and NOTE THEM AS SUCH]";
const grades = (type) => ({
  id: "academic_grades",
  label: "Academic Grades",
  type,
  required: true,
  help: GRADES_HELP,
});
const hearAbout = (
  required,
  options,
  label = "Where did you hear about us?/How did you find us?",
  help,
) => ({
  id: "heard_from",
  label,
  type: "checkbox",
  required,
  ...(help ? { help } : {}),
  options,
  other: true,
});
const SOCIAL_CHANNELS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "WhatsApp",
  "Friend",
];
const hscYear = {
  id: "exam_year",
  label: "Write the Year of your HSC/A2/Alim/equivalent Exam",
  type: "radio",
  required: true,
  options: ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027"],
  other: true,
};
const knowledge = {
  id: "abroad_knowledge",
  label: "What is your knowledge so far about studying abroad for undergraduate degree?",
  type: "radio",
  required: true,
  options: [
    "I don't know anything about study abroad",
    "I know a little bit but still researching",
    "I have enough idea and I need guidance",
    "I know everything about study abroad process",
  ],
  other: true,
};
const major = {
  id: "intended_major",
  label: "What is your intended Major and/or Minor?",
  type: "textarea",
  required: true,
  help: '(If you are unsure, write "Undecided" and explain what subjects or fields more interested to you)',
};
const english = (type) => ({
  id: "english_test",
  label: "What is Your IELTS/Duolingo/TOEFL Score, If Taken?",
  type,
  required: true,
  help: "(If you are preparing for IELTS/Duolingo/TOEFL, write 'Preparing' or you didn't take IELTS/Duolingo/TOEFL test neither preparing write 'N/A')",
});
const sat = (required) => ({
  id: "sat_act",
  label: "What is Your SAT/ACT Score, If Taken?",
  type: "text",
  required,
  help: "(If you are preparing for SAT/ACT, write 'Preparing' or you didn't take the SAT/ACT test neither preparing write 'N/A')",
});
const eca = {
  id: "activities",
  label: "List your Extra-curricular Activities(ECA)",
  type: "textarea",
  required: false,
  help: "(Tell us about more about your extra curricular activities that you have done since high school days. You can list as many ECA's here as many you want. It will help us to know more about you. Don't leave out anything.)",
};
const honors = {
  id: "honors",
  label: "List your Achievements/Honors",
  type: "textarea",
  required: false,
  help: "(Use this box by adding any achievements or honors you have achieved. It can be any International/National/Regional/Olympiad achievements. It can be anything. No worries!!)",
};
const efc = (options) => ({
  id: "family_contribution",
  label: "How much Dollars(USD) can your Family Contribute Per Year for your Education?",
  type: "radio",
  required: true,
  help: "Your college financial aid is impacted by your expected family contribution, which is the U.S. Department of Education’s calculation of the dollar amount your family can hypothetically afford to pay toward your upcoming year of college. US Colleges and Universities expect from you and your family the least amount of money you can contribute every year for the 4 years of undergrad for your education which they called EFC(estimated family contribution). By your EFC(estimated family contribution), they evaluate your profile and provide you the rest of money from the college or university fund which is called the 'Financial Aid.' You can use this https://college.harvard.edu/financial-aid/net-price-calculator to find your EFC.\n\n(This EFC is also determined for other countries as well.)",
  options,
});
const shareMore = {
  id: "share_more",
  label: "Want to share more things about you?",
  type: "textarea",
  required: false,
  help: '(Example: Resume, work examples, portfolio etc. Insert the links/URLs to all files you want to share or use the below "Add any file" option)',
};
const anyFile = (required) => ({
  id: "any_file",
  label: "Add any file (resume, portfolio, work samples, experiences, etc)",
  type: "file",
  required,
});
const payment = (numberRequired, numberHelp, fileRequired) => [
  {
    id: "paid_from",
    label: "Bkash/Nagad Number or Bank Account Number",
    type: "textarea",
    required: numberRequired,
    help: numberHelp,
  },
  { id: "amount_paid", label: "Amount you have Paid", type: "text", required: true },
  {
    id: "transaction_id",
    label: "Transaction ID",
    type: "text",
    required: true,
    help: "(If have any. If not, write N/A)",
  },
  {
    id: "payment_screenshot",
    label: "Screenshot/Picture of the Payment",
    type: "file",
    required: fileRequired,
  },
];
const yesNo = (id, label) => ({ id, label, type: "radio", required: true, options: ["Yes", "No"] });

export const FORM_TEMPLATES = [
  {
    slug: "ed2-rd-bootcamp",
    title: "Scholars Cafe ED II & RD BootCamp Application",
    intro: `Welcome to ScholarsCafe — A Cafe to Ease your Study Abroad Journey.☕🌍
The Early Decision deadline is the most important date on your calendar. You have already missed it.
No worries, still there is a hope. You have still time for ED II and RD Application. Is your application strong enough to stand out at top-tier universities and elite Liberal Arts Colleges? Are you ready for ED II & RD applications? If not, then don't worry.

Scholars Cafe is opening its doors for an intensive "ED II & RD Application Bootcamp" to transform your profile from "good" to "unforgettable".
🚩Note: You don't need to pay any penny to fill up this form. This is an interest form where we will get you know better and we will inform you via email if you are selected with the further information regarding payment within 48 hours. Please keep an eye in your email after filling out this form.

📢 BootCamp Start Date: January 1, 2026
💡 BootCamp End Date: January 7, 2026

✅What we will offer in this BootCamp:
Common App Full Review & Suggestions
Personal Section + Activity Section + Honors Section + Additional Section + Others Full Review & Suggestions
Recommendation Letter Review & Suggestions
Essay (Personal + Supplemental) Writing Review & Suggestions
College List Building (Up to 20 Colleges) based on your profile & EFC
CSS Profile/ISFAA Fillup Review & Suggestions
Navigating Overall College Applications & Suggestions
College Interview Preparation
Counselor + Teacher Portal Walkthrough
Group Sessions/Classes
Post Application Support
24/7 Chat Support
Recorded Live Classes
ALL Online Resources + Materials
A Flexible and Friendly Environment
One-on-One Support based on necessity
⛔What NOT to Expect:
UC Application, Scoir, Applytexas Fillup & Review
University Website Application Fillup & Review
Unlimited College List Building
English Proficiency Test Courses
SAT or Any other Standardized Test Courses
Whole Application Guidance from scratch
N.B. Filling out this form does not guarantee you a spot in the BootCamp. We will evaluate your profile based on the information in this form.

💰Price: ED II & RD Application BootCamp (only for USA)
Sticker Price: 10,000 Taka
Discounted Price: 4,990 Taka🥂 (till 31 december, 2025)
⚠️*LIMITED SEATS AVAILABLE*‼

${FOLLOW.replace("this cohort", "this BootCamp")}`,
    success: DONE,
    published: false,
    notify: true,
    definition: {
      steps: [
        {
          title: "",
          fields: [
            ...contact("Full Name", "Email Address"),
            social(true),
            {
              id: "before_you_continue",
              label: "Please fill out this form carefully, as seats are strictly limited.",
              type: "info",
              help: 'Our team will reach out to you through your email and ask for your resume/activity list/honors/etc to evaluate your profile and select students we can best help transform into "best-of-the-best" candidates for top universities and liberal arts colleges. Our goal is to refine your application to the highest standard to help you secure admission and high scholarships.',
            },
            {
              id: "supporting_materials",
              label:
                "Are you interested in submitting supporting materials (such as your resume, extracurricular list, or honors profile) to help us evaluate your profile for selection?",
              type: "radio",
              required: true,
              options: ["Yes", "No"],
            },
            { id: "common_app_info", label: "Common App informations", type: "info" },
            institution,
            {
              id: "graduation_date",
              label: "Last graduation Date",
              type: "text",
              required: true,
              help: '(mention your high school/12th grade result date); If not given yet, write "Predicted."',
            },
            grades("text"),
            {
              id: "intended_major",
              label: "What is your intended major?",
              type: "text",
              required: true,
              help: '(If you haven\'t decided yet, write "Undecided".)',
            },
            yesNo("english_test_given", "Do you have given any English proficiency test?"),
            yesNo("common_app_complete", "Is your Common App Profile completed?"),
            yesNo(
              "recommendation_letter",
              "Have you collected or written your Recommendation Letter?",
            ),
            yesNo("common_app_essay", "Have you written your Common App Essay?"),
            hearAbout(true, ["Email", ...SOCIAL_CHANNELS]),
          ],
        },
      ],
    },
  },
  {
    slug: "premium-mentorship-fall27",
    title: "Scholars Cafe Premium Mentorship Program Interest Form - Fall'27",
    intro: `Welcome to Scholars Cafe - A Cafe to Ease your Study Abroad Journey.☕🌍
Just like a perfect cup of coffee starts with the right beans, your dream of studying abroad begins with the right guidance. At Scholars Cafe, we blend personalized mentorship, expert consulting, and global opportunities into empowering experience. This is Cafe to make your dream worked over a coffee conversation.
📌Note: You don't need to pay anything to fill out this form. This is an interest form where we will get you know better.


💡Program Timeline: September -  till Visa Interview of that Intake

✅What we will Offer in this Mentorship Program:
3-1 Mentorship (3 Mentor for 1 Mentee)
Common App Fillup & Review
Scoir App Fillup & Review
UC Application Fillup & Review
University Portal Application & Review
Personal Section + Activity Section + Honors Section + Others
Unlimited University & College List Building
Unlimited Recommendation Letter Guidance
Unlimited Essay (Personal + Supplemental) Writing Guidance
CSS Profile/ISFAA Fillup Guidance
Navigating College Applications
Full Instructional English Proficiency Test Courses
Full Instructional SAT or Any other Standardized Test Courses
Counselor + Teacher Portal Walkthrough
College Interview Preparation
Bank Statement/Solvency Guideline
Post-Admission Support (Including Help with Negotiation for Scholarships/Financial Aid)
Full Visa Processing (DS160, CGI, Interview Preparation)
Visa Answer Crafting with Unlimited Mock Interview
Bank Statement/Solvency Guideline
Weekly 2 Live Classes
Recordings of Live Classes
ALL Online Resources + Materials
A Flexible and Friendly Environment
24/7 Chat Support
And more..........................

⚠This Program is highly selective and has very limited seats.

🚩For getting to know you more and about your profile, we will conduct a conversation with you virtually. You will get a Message of Interview within 24 hours. Please keep an eye in your email or WhatsApp number after filling out this form.


💰Sticker Price: 150,000 Taka


🔷You can Pay the Fee in Monthly Installments.

💲𝐅𝐞𝐞𝐬 Installments:
Admission Fee: 50% of the Sticker Price for the first month only (September).
1st Installment: 25% of the rest of the sticker price (November)
2nd Installment: Last 25% of the sticker price (January)


📌Refund Policy:
The Admission Fee is only refundable within two classes. After completing the 1st week classes (first two classes), the admission fee will not be refunded upon request.
Applicants cannot discontinue in the middle of the program.

${FOLLOW}`,
    success: DONE,
    published: false,
    notify: true,
    definition: {
      steps: [
        {
          title: "",
          fields: [
            ...contact("Full Name", "Email"),
            social(true),
            institution,
            {
              id: "grade9_10_institutions",
              label:
                "Mention Any Different Institutions You have have attended in your 9th-10th grade",
              type: "textarea",
              required: false,
            },
            hscYear,
            grades("textarea"),
            knowledge,
            major,
            english("textarea"),
            sat(true),
            eca,
            honors,
            efc([
              "$0-$5,000",
              "$5,000-$10,000",
              "$10,000-$15,000",
              "$15,000-$20,000",
              "$20,000-$25,000",
              "$25,000-$30,000",
              ">$30,000",
            ]),
            shareMore,
            anyFile(false),
            hearAbout(false, SOCIAL_CHANNELS),
          ],
        },
      ],
    },
  },
  {
    slug: "f1-visa-mentorship",
    title: "Scholars Cafe USA F-1 Visa Processing Service",
    intro: `Welcome to Scholars Cafe — A Cafe to Ease your Study Abroad Journey.☕🌍
Just like a perfect cup of coffee starts with the right beans, your dream of studying abroad begins with the right guidance. Pull up a chair, pour a cup of ambition, and let’s start crafting your visa application because success, like great coffee, starts with the right guidance.🎓🛫

📢USA F-1 Visa Mentorship Package (this includes DS-160 Form Fill-up & Review, CGI Portal Fill-up & Review. Proper Documents Organize, Visa Interview Answer Craft, Mock Interviews, Last Minute Guidance,  Interview Day To-do List and A Complete Framework of Visa Application)

👉 5 Sessions - 8,000 BDT

👉 7 Sessions - 10,000 BDT

👉 10 Sessions - 15,000 BDT


📢Only Mock Interview Package (this includes only answer crafting and feedback):

👉 3 sessions -  4,000 BDT

👉 5 Sessions -  6,000 BDT

👉 7 Sessions -  8,000 BDT

(These are customizable based on your urgency and need)

⛔What not to Expect:
Guranteed Visa
Visa Appointment Date Taken
Bank Statment Help (suggestions will be given)
Others not mentioned in (what we offer)
💡After purchasing the service, you will get a confirmation email to your email address within 48 hours. You will also find a WhatsApp Group link where your processing will be conducted.

💳Payment Gateway:
Bank Details:
Account Namer: Md Shahnoor Mridul
Account no-1059166460001
Brac Bank
Mitford branch

🚀Bkash/Nagad: 01308054791 (Personal Bkash/Nagad - Send Money)

🚨**NOTE: The Service Charge is Non-refundable.**

${FOLLOW.replace("this cohort", "USA F-1 Visa Processing services or want to learn more")}`,
    success: DONE,
    published: false,
    notify: true,
    definition: {
      steps: [
        {
          title: "",
          fields: [
            {
              id: "referred_by",
              label: "If this form is referred by someone to you, please write the person's name",
              type: "text",
              required: false,
            },
            {
              id: "discount_code",
              label: 'If you have any "Discount Code", write down below.',
              type: "text",
              required: false,
              help: "Otherwise keep it blank.",
            },
            ...contact("Name", "Email"),
            {
              id: "previously_refused",
              label: "Are you previously refused of USA F-1 Visa?",
              type: "radio",
              required: true,
              options: ["Yes", "No"],
            },
            {
              id: "package",
              label: "Which Package You Want to Purchase?",
              type: "radio",
              required: true,
              help: '(if you select "other", then write the session numbers, specify if it is only mock or not, and write the amount of the sessions told by the mentor)',
              options: [
                "5 Session - 8,000 BDT",
                "7 Sessions - 10,000  BDT",
                "10 Sessions - 15,000 BDT",
                "3 sessions (only mock) -  4,000 BDT",
                "5 sessions (only mock) -  6,000 BDT",
                "7 sessions (only mock) -  8,000 BDT",
              ],
              other: true,
            },
            ...payment(true, "(The Number/Account from you sent the fee)", false),
            hearAbout(true, ["Facebook", "Instagram", "LinkedIn", "TikTok", "WhatsApp", "Friend"]),
            {
              id: "terms",
              label: "Terms and Condition",
              type: "checkbox",
              required: true,
              help: "By clicking Yes, you are agreeing to all of our terms and conditions and officially purchasing the Scholars Cafe USA F-1 Visa Mentorship Program 2026.",
              options: ["Yes"],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "usa-cohort-fall27",
    title: "Scholars Cafe USA Cohort Interest Form - Fall'27",
    intro: `Welcome to Scholars Cafe - A Cafe to Ease Your Study Abroad Journey.☕🌍

Just like a perfect cup of coffee starts with the right beans, your dream of studying abroad begins with the right guidance. At Scholars Cafe, we blend personalized mentorship, expert consulting, and global opportunities into an empowering experience. We help you brew a future full of promise one sip at a time. This is a cafe where your dream comes true through a coffee conversation.☕🎯

Pull up a chair, pour a cup of ambition, and let’s start crafting your global education journey because success, like great coffee, starts with the right preparation.🎓🛫

📌Note: You don't need to pay anything to fill out this form. This is an interest form that will help us get to know you better. In addition, you will get all the information in this single form.


💡Cohort Timeline: November- January


✅What we will offer in this Cohort:
Common App Fill-up & Review
Scoir App Fill-up & Review
Personal Section + Gap Year Section + Activity Section + Honors Section + Others
University & College List Building (Up to 30 universities & colleges)
Recommendation Letter Guidance (Up to 4 LORs)
Essay (Personal + Supplemental + Scholarship) Writing Guidance
CSS Profile/ISFAA Fill-up
Navigating College Applications
Post-Admission Support (Including Help with Negotiation for Scholarships/Financial Aid)
Suggestion-Based Classes on EPT (IELTS, Duolingo) & Standardized Test (SAT)
Counselor + Teacher Portal Walkthrough
College Interview Preparation
Bank Statement/Solvency Guideline
Weekly 2 Live Classes
Recordings of Live Classes
ALL Online Resources + Materials
A Flexible and Friendly Environment
24/7 Chat Support
And more..........................

⛔What NOT to Expect:
Visa Processing Service (This is a separate service that you need to purchase)
UC Application Fill-up & Review
Applytexas Fillup & Review
Full Instructional English Proficiency Test Courses
Full Instructional SAT or Any other Standardized Test Courses
Any other services not mentioned in the section: (What we will offer in this Cohort)

⚠This cohort is highly selective and has very limited seats.

Shortlisted applicants may be invited for a brief interview, after which a final decision will be shared.
You will get an email with further details 48 hours after filling out this form. Please keep an eye on your email after filling out this form.


💰Sticker Price: 60,000 Taka

🔷You can pay the Fee in Three Installments.

💲𝐅𝐞𝐞𝐬 Installments:
Admission Fee: 50% of the Sticker Price for the first month only (September).
1st Installment: 30% of the rest of the sticker price (November)
2nd Installment: Last 20% of the sticker price (January)


🚩Visa Application Service is a separate service. If you are interested, it will be added right after your cohort ends. You can decide to take the Visa Application Service anytime. An extra charge will be added upon the cohort sticker price.


📌Refund Policy:
The Admission Fee is only refundable within two classes. After completing the 1st week classes (first two classes), the admission fee will not be refunded upon request.
Applicants cannot discontinue in the middle of the cohort.
Refunds of each installment will be issued at the end of the month after clearing all previous fees.
No more installments will be charged from the next month the student discontinues.

${FOLLOW.replace("question regarding", "questions regarding").replace("E-mail us", "email us").replace("Subscribe us", "Subscribe to us")}`,
    success: DONE,
    published: false,
    notify: true,
    definition: {
      steps: [
        {
          title: "",
          fields: [
            ...contact("Full Name", "Email"),
            social(false),
            institution,
            {
              id: "grade9_10_institutions",
              label:
                "Mention Any Different Institutions You have have attended in your 9th-10th grade",
              type: "text",
              required: false,
            },
            hscYear,
            grades("textarea"),
            knowledge,
            major,
            english("text"),
            sat(false),
            eca,
            honors,
            {
              id: "unique_story",
              label:
                "Tell us about a very unique story about your life or something meaningful to you in 3 lines.",
              type: "textarea",
              required: false,
              help: 'For example:\n"A cup of cappuccino forced me to............\n"I was astonished when I encountered a sky full of star will push me to study astronomy..............."',
            },
            efc([
              "$0-$5000",
              "$5,000-$10,000",
              "$11,000-$15,000",
              "$15,000-$20,000",
              "$20,000-$25,000",
              "$25,000-$30,000",
              ">$30,000",
            ]),
            shareMore,
            anyFile(true),
            hearAbout(true, SOCIAL_CHANNELS),
          ],
        },
      ],
    },
  },
  {
    slug: "individual-services",
    title: "Scholars Cafe USA College Admission Individual Services",
    intro: `Welcome to Scholars Cafe — A Cafe to Ease Your Study Abroad Journey.☕🌍

Just like a perfect cup of coffee starts with the right beans, your dream of studying abroad begins with the right guidance. At ScholarsCafe, we blend personalized mentorship, expert consulting, and global opportunities into an empowering experience. Whether you're craving the academic buzz of the top colleges of the USA or the cultural aroma of European campuses, we help you brew a future full of promise — one sip at a time. This is Cafe to make your dream work with a coffee conversation.☕🎯

Pull up a chair, pour a cup of ambition, and let’s start crafting your global education journey — because success, like great coffee, starts with the right preparation.🎓🛫
Congratulations, champ!🤸‍♀️

-Why?

The first step is always difficult as HELL! As you have already chosen the path of studying abroad and stepped forward to apply, it is an achievement in itself. You are already a winner. And in this step, we will help you pull up the TROPHY.🏆

Individual USA Undergraduate Admission Services Price:
Common App Fill-up + Review: 5,000 Taka
SCOIR x Coalition App Fill-up + Review: 5,000 Taka
University of California or UC Application Fill-up + Review: 5,000 Taka
University Website Application Fillup + Review: 5,000 Taka
Honors + ECA Section Review + Edit: 1,000 Taka
Counselor + Teacher Part Fill-up (Per App Portal): 2,000 Taka
3 Recommendation Letters (LOR) Review + Editing: 2500 Taka
1 Recommendation Letter (LOR) Review + Editing: 1000 Taka
College List Building (up to 20 Colleges): 8,000 Taka
CSS Fill-up (1-on-1): 2500 Taka
ISFAA Fill-up (1-on-1): 2500 Taka
ECA Guidelines & Resources (Based on your Profile): 2500 Taka
1-to-1 Conversation (1 Hour): 500 Taka
Essay Editing/Reviewing Services:
1 Personal Essay/SOP/Motivational Letter (with Google Meet meeting + Duo Editing): 1500 Taka
1 Supplemental Essay (up to 300 words): 500 Taka
1 Supplemental Essay (up to 500 words): 700 Taka
2 Supplemental Essays: 1000 Taka
3 Supplemental Essays: 1200 Taka
4/5 Supplemental Essays: 1500 Taka
Common App Essay + 5 Supplemental Essays: 2500 Taka
Guidance Program:
LOR Guidance Sessions + Review & Edit (up to 3 LORs): 4,000 Taka
Common App Essay Guidance Sessions + Review & Edit: 10,000 Taka
Supplemental Essay Guidance Sessions + Review & Edit (up to 3): 5,000 Taka

💳Payment Gateway:
Bank Details:
Account Name: Md Shahnoor Mridul
Account number-1059166460001
Brac Bank
Mitford branch

🚀Bkash/Nagad/Rocket: 01308054791 (Personal - Send Money)


🚨**NOTE: The Service Charge(s) is/are Non-refundable.**

${FOLLOW.replace("question regarding this cohort", "questions regarding any individual services or want to learn more").replace("E-mail us", "email us").replace("Subscribe us", "Subscribe to us")}`,
    success: DONE,
    published: false,
    notify: true,
    definition: {
      steps: [
        {
          title: "",
          fields: [
            ...contact("Name", "Email"),
            {
              id: "services",
              label: "Which Services do you want to purchase?",
              type: "checkbox",
              required: true,
              help: "(You can purchase multiple services at a time)",
              options: [
                "Common App Fillup + Review: 5,000 Taka",
                "Scoir x Coalition App Fillup + Review : 5,000 Taka",
                "University of California or UC Application Fillup + Review : 5,000 Taka",
                "University Website Application Fillup & Review : 5,000 Taka",
                "Counselor + Teacher Part Fillup (Per App Portal): 2,000 Taka",
                "3 Recommendation Letter (LOR) Editing: 2,500 Taka",
                "1 Recommendation Letter (LOR) Editing: 1,000 Taka",
                "College List Building (up to 20 Colleges): 8,000 Taka",
                "CSS Fillup (one-on-one): 2,500 Taka",
                "ISFAA Fillup (one-on-one): 2,500 Taka",
                "ECA Guidelines & Resources (Based on your Profile): 2,500 Taka",
                "1-to-1 Conversation (1 Hour): 1,000 Taka",
                "# Essay Editing/Reviewing Services:",
                "1 Personal Essay/SOP/Motivational Letter (with zoom meeting + Duo Editing): 1,500 Taka",
                "1 Supplemental Essay (up to 300 words): 500 Taka",
                "1 Supplemental Essay (up to 500 words): 700 Taka",
                "2 Supplemental Essay : 1,000 Taka",
                "3 Supplemental Essay : 1,200 Taka",
                "4/5 Supplemental Essay : 1,500 Taka",
                "Common App Essay + 5 Supplemental Essay : 2,500 Taka",
                "# Guidance Program:",
                "LOR Guidance Sessions + Review & Edit (up to 3 LORs): 4,000 Taka",
                "Common App Essay Guidance Sessions + Review & Edit: 10,000 Taka",
                "Supplemental Essay Guidance Sessions + Review & Edit (up to 3): 5,000 Taka",
              ],
              other: true,
            },
            ...payment(false, "(The Number/Account from you send the fee)", true),
            hearAbout(
              false,
              [...SOCIAL_CHANNELS, "Parents"],
              "Where have you heard about our Services?/Reference",
              "(for example: Facebook, Instagram, Friends, Parents, etc)",
            ),
            {
              id: "terms",
              label:
                "Attending a college or university with generous financial aid to pursue an undergraduate degree is a dream for most students. However, while some dreams succeed, others falter due to inadequate guidance. Scholars Cafe is here to assist you with the college or university application process. We will make every effort to assist you in any service you choose to purchase. You will receive the best possible personal guidance in your purchase and feel worth every penny.",
              type: "checkbox",
              required: true,
              help: "NB: The College/University admissions process is a holistic review process, and the top colleges are highly selective. We can't guarantee your acceptance, scholarships, let alone your visa approval. Keep in mind that your overall profile and luck are what determine your visa and other approval rates. But we will support any individual services you choose to purchase. If you're convinced, then click Yes.\nBy clicking Yes, you are agreeing to all of our terms & conditions and officially purchasing Scholars Cafe Individual Service(s).",
              options: ["Yes"],
            },
          ],
        },
      ],
    },
  },
];
