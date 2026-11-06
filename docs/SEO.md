# SEO plan for scholarscafe.com (November 2026)

**Goal:** rank on Google's first page when Bangladeshi students search for studying in the USA, using only methods Google's Search Essentials allow.

Nobody can honestly guarantee position 1. The short, broad phrase "study abroad" is dominated by large brands with years of authority (IDP, newspapers, government pages). What a new, honest site _can_ win are specific searches that match exactly what Scholars Cafe does: **USA admissions and scholarships for students from Bangladesh**. Expect the first results in about 2–4 months and steady growth over 6–12 months, provided the site is indexed and new guides keep coming.

## 1. Where we stand

- **Google and Bing don't show scholarscafe.com yet.** A search for the name returns no pages from the site, only posts from the Scholars Cafe YouTube channel. Step 0 is to get indexed (§5).
- **Technical basics were missing.** There was no sitemap, no canonical addresses, no share image and no structured data. The titles didn't contain search terms ("About - Scholars Cafe"). **Fixed in this change** (§4).
- **Risky claims in the old Google snippet.** "Bangladesh's #1 study abroad consultancy" and "USA, UK, Canada, Germany & 8+ more countries" (only USA is offered). Unprovable superlatives hurt trust and can break advertising rules. **Removed.**
- **Thin content.** Pages have about 400–900 words, and blog posts have no pages of their own, so Google can't rank them. This is the biggest gap (§3).

## 2. Competitors (what ranks today for "study in USA from Bangladesh")

| Site                                                                     | Why it ranks                                                                                                         | Our angle against it                                                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| IDP (idp.com/bangladesh)                                                 | Global brand, huge authority, a page per city/country/topic (visa, scholarships, consultants in Dhaka)               | Can't out-brand it. Win on depth for **USA-only, full-scholarship, undergraduate** questions IDP covers thinly |
| AIMS Education (aimseducation.co.uk/bd)                                  | Long dated guides: "Study in the USA from Bangladesh in 2026: universities, requirements, cost & scholarships"       | Better, mentor-written, up-to-date guides with real numbers and sources                                        |
| GMC Studies (gmc-studies.com)                                            | Many long-tail pages: "study in USA without IELTS", "US student visa for Bangladeshi students", "step by step guide" | Same topics, written by people who did it (E-E-A-T), with Bangla versions                                      |
| Shakil Education (shakiledu.com)                                         | Heavy blog volume on scholarships and country lists                                                                  | Quality over volume; scaled thin posts are a Google spam risk                                                  |
| Boost Education, BHE UNI, Study Info Centre, uni2study, 10 Minute School | Country guides with intakes, costs, timelines                                                                        | Specialise: USA undergrad + financial aid (CSS Profile/ISFAA), where most of them are generic                  |

**Pattern:** the winners have **one page per question**, 1,500–3,000 words, dated "2026", with costs in BDT, timelines, document lists and FAQs. None of them show who wrote the guide or their own US-admissions experience. That's the gap Scholars Cafe can fill, as mentors who went through it.

## 3. Keyword map and content plan (one page per topic)

Write each as its own page (blog post with its own URL, see §6), 1,500–2,500 words, in your own words. Use real numbers with sources (US Embassy Dhaka, EducationUSA, Common App, College Board, university pages), a date, the author's name and experience, and a short FAQ.

| Priority | Page (target search)                                                        | Notes                                                                             |
| -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1        | Study in the USA from Bangladesh: complete 2027 guide                       | Pillar page; links to all the others                                              |
| 1        | Full scholarships in the USA for Bangladeshi students                       | Need-based aid, which universities meet full need for internationals, honest odds |
| 1        | CSS Profile and ISFAA for Bangladeshi families (step by step)               | Few competitors cover this well                                                   |
| 1        | US F-1 student visa from Bangladesh: documents, interview questions, fees   | Link to the official embassy pages for fees                                       |
| 2        | Cost of studying in the USA from Bangladesh (in BDT)                        | Tuition vs. aid, living costs, the $2,000/month remittance rule                   |
| 2        | SAT, Duolingo or IELTS? What US universities need from Bangladeshi students | Test-optional explained                                                           |
| 2        | Common App essay guide with Bangladeshi examples (with permission)          | Your strength                                                                     |
| 2        | US university application timeline for Fall 2027 (month by month)           | Update every year                                                                 |
| 3        | Study in the USA without IELTS                                              | High search volume; be accurate                                                   |
| 3        | Community college to university transfer route                              | Budget option                                                                     |
| 3        | Bangla versions of the top 4 pages                                          | Bangla searches have little competition                                           |

**Publishing rhythm:** 2 strong pages a month beats 20 thin ones. Update each page yearly and change the date only when the content really changes.

## 4. Technical SEO done in this change

- **Titles and descriptions:** honest, keyword-led, the right length, and unique on every page.
- **Canonical address on every page:** `https://scholarscafe.com/...`, so `www` and other variants don't split rankings.
- **Share image and tags:** Open Graph and Twitter cards with a 1200×630 image (`public/og/scholars-cafe.jpg`), for good previews on Facebook, WhatsApp and LinkedIn.
- **Structured data (JSON-LD):** EducationalOrganization (name, logo, email, phone, the social profiles, area served: Bangladesh) and WebSite. Only true, visible facts. No address, because the site doesn't list one.
- **`sitemap.xml`:** built automatically with every deploy; `robots.txt` points to it. The design-system page and the form shell are excluded.
- **Already in place:** pages are pre-rendered (Google sees full HTML), HTTPS, a `www` → main-domain redirect, a mobile-first layout, compressed images and self-hosted fonts.

## 5. What you need to do (in order)

1. **Google Search Console** (free): https://search.google.com/search-console
   - Add the **Domain** property `scholarscafe.com`. Google gives you a TXT record; add it in hPanel → Domains → DNS. Tell me the record and I can add it.
   - Then **Sitemaps → submit `sitemap.xml`**, and use **URL inspection → Request indexing** for `/`, `/programs`, `/services` and `/resources`.
2. **Bing Webmaster Tools** (free, also feeds DuckDuckGo): https://www.bing.com/webmasters. You can import from Search Console.
3. **Fix the 6 old SEO overrides in the admin.** Website → **SEO titles**: they still hold the old titles ("About - Scholars Cafe"…) and replace the new ones in browsers. Either **Unpublish** all 6, which lets the new built-in titles apply (recommended), or paste in the new titles listed in the PR.
4. **Google Business Profile** (free): https://business.google.com. Only with a real address or a defined service area in Bangladesh, and the same name, phone and website everywhere. Don't use a fake address; that gets profiles suspended.
5. **Link your own profiles to the website:** put `scholarscafe.com` in the YouTube channel description and links, Facebook "About", the LinkedIn company page, and the Instagram and TikTok bios (`/links`).
6. **Reviews:** ask real students to review you on Google (once the Business Profile exists). Never buy reviews or offer anything in exchange for them.

## 6. Next build steps I recommend

- **Blog posts as real pages** (`/blog/<slug>`), pre-rendered at build time from the admin, with their own titles, dates, authors and Article structured data, and included in the sitemap. Today posts only open inside the home page, so they can't rank. This is the most important next step for SEO.
- **Author pages** for the founders and mentors (education, universities, experience) to show expertise.
- **A Bangla section** (`/bn/...`) with `hreflang` tags for the top guides.
- **Page speed:** check https://pagespeed.web.dev on the live site and fix what it flags (the hero video is the heaviest item).

## 7. What we will not do (it gets sites demoted or removed by Google)

- Buying links, link exchanges or private blog networks. Paid placements must be marked `rel="sponsored"`.
- Mass-produced or AI-spun pages without real value (Google's "scaled content abuse" policy).
- Hidden text, keyword stuffing, doorway pages ("best consultancy in Dhaka / in Sylhet / in Chittagong" copies), or showing Google different content from visitors.
- Fake reviews, fake addresses, fake statistics, or "guaranteed visa/scholarship" claims.
- Copying competitors' text. Write originally and cite sources.

Sources used for the competitor review: search results for "study in USA from Bangladesh consultancy", "best study abroad consultancy in Bangladesh 2026", "how to study in USA from Bangladesh step by step cost visa ratio 2026", including [IDP Dhaka](https://www.idp.com/bangladesh/usa-education-consultants/dhaka), [AIMS Education](https://aimseducation.co.uk/bd/?p=1670), [GMC Studies](https://gmc-studies.com/how-to-study-in-usa-from-bangladesh-step-by-step-guide/), [Shakil Education](https://www.shakiledu.com/), [Boost Education](https://www.boosteducationservice.co.uk/study-in-usa-from-bangladesh/), [BHE UNI](https://bheuni.io/study-in-usa), [Study Info Centre](https://studyinfocentre.com/blog/usa/country/study-in-the-usa-from-bangladesh), [uni2study](https://www.uni2study.com/articles/applying-to-us-universities-from-bangladesh-timeline-documents-and-costs) and [10 Minute School](https://10minuteschool.com/en/product/study-abroad/). Google policy background: [Google Search Central blog, March 2024 spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies).
