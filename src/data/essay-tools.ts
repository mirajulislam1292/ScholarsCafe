// Content for /resources/tools. All wording here is Scholars Cafe's own.
// Admins can replace the value cards (CMS kind "toolValues") and the essay angles ("promptAngles").
import type { PromptArchetype } from "./essay-prompts";

export type ValueCard = { label: string; hint: string; position?: number };
export type PromptAngle = { archetype: PromptArchetype; angle: string; position?: number };

export const DEFAULT_VALUES: ValueCard[] = [
  { label: "Family", hint: "The people who raised you and the duties you carry for them" },
  { label: "Faith", hint: "Beliefs that guide how you act on an ordinary day" },
  { label: "Honesty", hint: "Saying the true thing, even when it costs you" },
  { label: "Curiosity", hint: "Needing to know how and why things work" },
  { label: "Learning", hint: "Getting better at something, slowly and on purpose" },
  { label: "Hard work", hint: "Showing up and doing the boring part too" },
  { label: "Responsibility", hint: "Being the one people can count on" },
  { label: "Kindness", hint: "Small, quiet care for people who need it" },
  { label: "Justice", hint: "Wanting rules and chances to be fair for everyone" },
  { label: "Service", hint: "Using your time for people outside your own circle" },
  { label: "Community", hint: "Belonging to a para, a group or a place, and giving back" },
  { label: "Independence", hint: "Making your own choices and living with them" },
  { label: "Courage", hint: "Doing the thing even when you are scared" },
  { label: "Resilience", hint: "Getting back up after a bad result or a hard year" },
  { label: "Creativity", hint: "Making something that did not exist before" },
  { label: "Beauty", hint: "Noticing and caring about how things look, sound and feel" },
  { label: "Tradition", hint: "Keeping food, language, songs and rituals alive" },
  { label: "Change", hint: "Wanting things to be different and working for it" },
  { label: "Leadership", hint: "Helping a group move in one direction" },
  { label: "Teamwork", hint: "Doing better together than alone" },
  { label: "Friendship", hint: "A few people you would do anything for" },
  { label: "Respect", hint: "Taking other people, and elders, seriously" },
  { label: "Gratitude", hint: "Remembering what others gave up for you" },
  { label: "Humility", hint: "Knowing what you do not know yet" },
  { label: "Ambition", hint: "Wanting more for yourself and for your family" },
  { label: "Excellence", hint: "Not stopping at good enough" },
  { label: "Discipline", hint: "Keeping a routine when nobody is checking" },
  { label: "Patience", hint: "Waiting, practising and not giving up early" },
  { label: "Health", hint: "Looking after your body and mind, and others' too" },
  { label: "Nature", hint: "Rivers, fields, weather and the climate we share" },
  { label: "Adventure", hint: "Trying new places, food and ways of living" },
  { label: "Humour", hint: "Making a hard room lighter" },
  { label: "Empathy", hint: "Feeling what someone else feels before judging" },
  { label: "Fairness", hint: "Equal rules, whether you are rich or poor, girl or boy" },
  { label: "Freedom", hint: "The right to speak, think and choose" },
  { label: "Knowledge", hint: "Books, facts and ideas worth keeping" },
  { label: "Innovation", hint: "Finding a cheaper, faster or smarter way" },
  { label: "Self-reliance", hint: "Solving it yourself before asking for help" },
  { label: "Loyalty", hint: "Staying with people through good and bad times" },
  { label: "Peace", hint: "Calm at home, in your head and between people" },
  { label: "Identity", hint: "Being Bangladeshi, and everything else you are" },
  { label: "Generosity", hint: "Sharing what you have, even when it is little" },
];

/** Reflection prompts for each final value. "{value}" is replaced with the value's name. */
export const REFLECTION_PROMPTS: { theme: string; prompt: string }[] = [
  {
    theme: "Family",
    prompt:
      "Who at home first showed you {value}? Describe one evening, meal or argument where you saw it.",
  },
  {
    theme: "School",
    prompt:
      "Think about your SSC, HSC, O or A Level years. When did {value} help you, or get you into trouble?",
  },
  {
    theme: "Community",
    prompt:
      "Where outside home (your para, mosque, temple, club, tuition batch, online group) have you acted on {value}? What did you actually do?",
  },
  {
    theme: "A cost",
    prompt: "When did holding on to {value} cost you something: marks, money, time or a friend?",
  },
  {
    theme: "Moving abroad",
    prompt:
      "You may soon live far from family. How will {value} look on a campus where nobody knows you yet?",
  },
  {
    theme: "Proof",
    prompt:
      "Name one small, specific object, place or habit that proves {value} matters to you. A reader should be able to picture it.",
  },
];

export const ACTION_VERBS: { group: string; verbs: string[] }[] = [
  {
    group: "Leading",
    verbs: ["Founded", "Led", "Directed", "Organised", "Coordinated", "Chaired", "Mobilised"],
  },
  {
    group: "Building",
    verbs: ["Built", "Designed", "Launched", "Developed", "Programmed", "Created", "Engineered"],
  },
  {
    group: "Teaching",
    verbs: ["Tutored", "Mentored", "Coached", "Trained", "Taught", "Guided", "Explained"],
  },
  {
    group: "Improving",
    verbs: ["Raised", "Grew", "Expanded", "Reduced", "Cut", "Streamlined", "Revived"],
  },
  {
    group: "Researching",
    verbs: ["Researched", "Analysed", "Surveyed", "Tested", "Measured", "Investigated", "Mapped"],
  },
  {
    group: "Helping",
    verbs: ["Supported", "Cared for", "Fed", "Collected", "Distributed", "Volunteered", "Served"],
  },
  {
    group: "Speaking and writing",
    verbs: ["Wrote", "Edited", "Published", "Presented", "Debated", "Translated", "Pitched"],
  },
  {
    group: "Earning and managing",
    verbs: ["Managed", "Sold", "Budgeted", "Negotiated", "Earned", "Scheduled", "Supervised"],
  },
];

export const IMPACT_TEMPLATES: { label: string; template: string; example: string }[] = [
  {
    label: "Numbers",
    template: "[Verb] [how many] [people or things] [how often]; [result with a number]",
    example: "Tutored 12 Class 8 students in maths twice a week; 9 moved up a grade band",
  },
  {
    label: "Scope",
    template: "[Verb] [what] for [who or where], [size of the group or area]",
    example: "Ran a winter clothes drive for 3 villages in Kurigram, 400+ families reached",
  },
  {
    label: "Result",
    template: "[Verb] [what you made or changed]; [what is different now]",
    example: "Built a Bangla flashcard app for my school; 150 students use it before exams",
  },
  {
    label: "Money",
    template: "[Verb] [amount in BDT or USD] for [cause]; used to [outcome]",
    example: "Raised BDT 85,000 for flood relief; bought dry food for 230 households",
  },
  {
    label: "Growth",
    template: "[Verb] [group] from [start] to [now] in [time]",
    example: "Grew our school science club from 6 to 48 members in one year",
  },
  {
    label: "Responsibility at home",
    template: "[Verb] [family duty], [hours per week], so that [what it made possible]",
    example: "Cared for my younger brother 20 hrs/week so my mother could keep her job",
  },
];

/** Words and phrases that rarely add meaning to a 150-character description. */
export const FILLER_WORDS = [
  "very",
  "really",
  "basically",
  "actually",
  "just",
  "various",
  "several",
  "many different",
  "a lot of",
  "lots of",
  "in order to",
  "was responsible for",
  "responsible for",
  "helped to",
  "was able to",
  "successfully",
  "on a daily basis",
  "extremely",
  "quite",
  "somewhat",
];
export const ARTICLES = ["a", "an", "the"];

export const ARCHETYPE_LABEL: Record<PromptArchetype, string> = {
  "why-us": "Why Us",
  community: "Community & Background",
  intellectual: "Intellectual Curiosity",
  extracurricular: "Extracurricular",
  "short-answer": "Short answer",
  other: "Other",
};

export const DEFAULT_ANGLES: PromptAngle[] = [
  // Why Us
  {
    archetype: "why-us",
    angle:
      "Pick two things you could only do at this college (a named course, lab, professor, club or tradition) and link each one to something you already started in Bangladesh.",
  },
  {
    archetype: "why-us",
    angle:
      "Read the college's student newspaper for ten minutes. Find one debate on campus you would actually join, and say what you would bring to it.",
  },
  {
    archetype: "why-us",
    angle:
      "If you talked to a current student or alum, use one detail from that call. If you did not, do not pretend you did.",
  },
  {
    archetype: "why-us",
    angle:
      'Skip rankings, weather and "diverse community". Every college says those. Ask yourself what would be missing from your next four years if this college said no.',
  },
  // Community & Background
  {
    archetype: "community",
    angle:
      "Write about a group you belong to that an admissions officer has never heard of: your batch WhatsApp group, a neighbourhood cricket team, the women in your family who cook for Eid.",
  },
  {
    archetype: "community",
    angle:
      "Show one ordinary moment from home that explains how you see the world. Load-shedding homework by candlelight is common; what did you do in that dark hour that was yours?",
  },
  {
    archetype: "community",
    angle:
      "Being Bangladeshi is not the story by itself. Choose one small part of it (a language habit, a food, a festival, a family rule) and show how it changed a decision you made.",
  },
  {
    archetype: "community",
    angle:
      "Think about a time you were the outsider: the only girl in the robotics team, the village student in a Dhaka college, the English-medium student at a Bangla-medium event. What did you learn about including others?",
  },
  // Intellectual Curiosity
  {
    archetype: "intellectual",
    angle:
      'Start with a real question you could not stop thinking about, not a subject. "Why does the Padma change its course?" is better than "I love geography".',
  },
  {
    archetype: "intellectual",
    angle:
      "Describe what you did after class ended: the YouTube rabbit hole, the book you borrowed, the experiment in your kitchen. Effort without marks is the point.",
  },
  {
    archetype: "intellectual",
    angle:
      "Write about an idea that changed your mind. Say what you believed before, what you read or saw, and what you think now.",
  },
  {
    archetype: "intellectual",
    angle:
      "Connect a classroom topic to something in your city: traffic in Dhaka and maths, garment factories and economics, monsoon floods and physics.",
  },
  // Extracurricular
  {
    archetype: "extracurricular",
    angle:
      "Choose the activity where you changed most, not the one with the biggest title. A tuition job you did every week can beat a one-day club presidency.",
  },
  {
    archetype: "extracurricular",
    angle:
      "Zoom in on one afternoon of the activity. What did your hands do, who was there, what went wrong?",
  },
  {
    archetype: "extracurricular",
    angle:
      "Family work counts. Running the shop counter, caring for a grandparent or teaching a cousin is real responsibility. Write about it without apologising.",
  },
  {
    archetype: "extracurricular",
    angle:
      "End with what you would do next with the activity in college, so the reader sees it is not finished.",
  },
  // Short answer
  {
    archetype: "short-answer",
    angle:
      "Be specific and a little personal. Name the exact book, song, food or place, and add one reason nobody else would give.",
  },
  {
    archetype: "short-answer",
    angle:
      "Use the short answers to show sides of you the long essays did not: your humour, a hobby, a favourite Bangla word.",
  },
  {
    archetype: "short-answer",
    angle:
      "Read every answer out loud. If it sounds like a CV line, rewrite it the way you would say it to a friend.",
  },
  // Other
  {
    archetype: "other",
    angle:
      "Read the prompt three times and underline what it actually asks. Answer that question in your first two sentences, then tell the story.",
  },
  {
    archetype: "other",
    angle:
      "Unusual prompts reward play. Take the question seriously, but let your voice show: a list, a letter or a dialogue can work if it still says something true about you.",
  },
  {
    archetype: "other",
    angle:
      "Do not reuse your Common App personal statement topic. Use this space to add a new piece of information about you.",
  },
];

/** Common App activity-section limits (see ACTIVITY_LIMITS_SOURCE). */
export const ACTIVITY_LIMITS = { position: 50, organization: 100, description: 150, max: 10 };
export const ACTIVITY_LIMITS_SOURCE = {
  url: "https://www.commonapp.org/static/f45949473bb80a91c80aface729d83df/Approaching-Activities.pdf",
  label: "Common App, “Approaching the activities section” (September 2026)",
  asOf: "2026-11-21",
};
