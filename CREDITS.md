# Credits and licenses

## Hero footage (`public/media/hero/`), USA only
Each clip: trimmed to 13 s, downscaled with Lanczos (never upscaled), no audio. Desktop 1920×1080, mobile 720×1280 (centre crop of a 2560×1440 source).
H.264 MP4 (CRF 19, capped at 4.5 Mbps desktop / 2.5 Mbps mobile, `+faststart`) plus VP9 WebM. A `.webp` poster per clip is its first frame.

| Files | Place | Source (resolution) | Author | License |
|---|---|---|---|---|
| `d2-columbia.*`, `m1-columbia.*` | Butler Library, Columbia University, New York | [Pexels #5551776](https://www.pexels.com/video/low-angle-video-of-columbian-butler-library-5551776/) (2560×1440) | Armin Rimoldi | Pexels License (free commercial use, no attribution required) |
| `d3-philadelphia-university.*`, `m2-philadelphia-university.*` | University district, Philadelphia | [Pexels #37258585](https://www.pexels.com/video/aerial-view-of-philadelphia-university-area-37258585/) (2560×1440) | K | Pexels License |

Removed: Cambridge, Oxford and Stanford clips (outside the USA focus or too short); New Haven (CC BY) and the second Philadelphia campus clip (owner request, playlist is now two clips).
Not found as free, commercially licensed 1080p+ drone footage (November 2026): Harvard, MIT, Princeton, Stanford (long enough), Yale campus close-ups.
The USA section reuses the desktop posters as its images.

## Page photography (`public/media/pages/`)
Downloaded at 2400 px, saved as WebP at 1920 px (and 960/720 px `-sm` versions). All under the Pexels License (free commercial use, no attribution required).

| Files | Subject | Source | Photographer | Used on |
|---|---|---|---|---|
| `students-walking*.webp` | College students walking on a lawn | [Pexels #7683629](https://www.pexels.com/photo/three-college-students-walking-on-the-ground-7683629/) | RDNE Stock project | /about hero |
| `library*.webp` | Students in a university library | [Pexels #8199659](https://www.pexels.com/photo/students-studying-inside-the-library-8199659/) | Yan Krukau | /about image band |
| `oklahoma-autumn*.webp` | The University of Oklahoma in autumn | [Pexels #19554793](https://www.pexels.com/photo/the-university-of-oklahoma-in-autumn-19554793/) | An Vuong | /programs hero |
| `campus-early-fall*.webp` | College campus in early fall | [Pexels #34623256](https://www.pexels.com/photo/peaceful-college-campus-in-early-fall-34623256/) | Garrison Gao | /programs image band |

## Fonts (`public/fonts/`)
- Funnel Display (variable): SIL Open Font License 1.1 (`LICENSE-FunnelDisplay.txt`). Replace with the designer's files when supplied.
- Inter (variable): SIL Open Font License 1.1 (`LICENSE-Inter.txt`).

## Fonts: Bangla
- Hind Siliguri (Bengali subset, 300/400/500/600): SIL Open Font License 1.1 (`public/fonts/LICENSE-HindSiliguri.txt`). Downloaded only when Bangla text appears.

## Universities
The marquee under the hero shows university names as text only (no logos).
## Code and services (Phases 3–5)
No new third-party assets. Passwords and codes use Node's built-in `crypto` (scrypt, randomInt). Email goes through your Hostinger mailbox (nodemailer, MIT). Admin backend libraries: Express, helmet, express-rate-limit, google-auth-library, mysql2, nodemailer, sharp, zod (all MIT/Apache-2.0).
