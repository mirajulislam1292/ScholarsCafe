import {useCmsLookup} from "@/lib/cms";
import { useCmsValue } from "@/lib/cms";
import { CmsText } from "@/lib/cms";
import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, GraduationCap, Calendar, Wallet, Languages, Stamp, ArrowUpRight } from "lucide-react";
import {
  DESTINATIONS,
  ISO_TO_DESTINATION,
  type DestinationDetail,
} from "@/lib/destinations-data";
import { WA_LINK as CMS_DEFAULT_WA_LINK } from "@/lib/scholars-data";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// approximate longitude/latitude for marker pins
const MARKERS: Record<string, [number, number]> = {
  USA: [-95, 39],
  GBR: [-2, 53],
  CAN: [-100, 58],
  DEU: [10, 51],
  SWE: [16, 62],
  NLD: [5.5, 52],
  FIN: [26, 64],
  NZL: [172, -41],
  HUN: [19, 47],
  KOR: [128, 36],
  TUR: [35, 39],
  ESP: [-3, 40],
};

export function WorldMap() {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  const [active, setActive] = useState<DestinationDetail | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      id="world-map"
      className="relative overflow-hidden bg-[var(--navy-deep)] py-24 md:py-32"
    >
      {/* atmospheric grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-10">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-16">
          <div>
            <span className="kicker text-sky-light"><CmsText id="WorldMap.505e4469013d">Interactive · 12 countries</CmsText></span>
            <h2 className="mt-5 editorial-h2 text-white"><CmsText id="WorldMap.a9ae2d28e56c">
              The world,
              </CmsText><br />
              <span className="font-display italic font-light text-sky-light"><CmsText id="WorldMap.2febf7eba7ba">
                at your fingertips.
              </CmsText></span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/65"><CmsText id="WorldMap.f503db4e7679">
            Hover the map. Click a glowing pin to open the country dossier.
            top universities, scholarships, intake calendar, and visa notes.
          </CmsText></p>
        </div>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0b1f44] to-[#07142a] p-6 shadow-2xl md:hidden">
          <div className="kicker text-sky-light"><CmsText id="WorldMap.e7c82c52e445">Mobile view</CmsText></div>
          <h3 className="mt-4 font-display text-3xl font-extrabold text-white"><CmsText id="WorldMap.a2a8327445d1">
            Explore destinations without clipping.
          </CmsText></h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70"><CmsText id="WorldMap.9e881762227e">
            The interactive world map is available on larger screens. On mobile, use the country chips below to open each destination dossier.
          </CmsText></p>
        </div>

        {/* the map */}
        <div className="relative mt-12 hidden overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0b1f44] to-[#07142a] shadow-2xl md:block">
          <div className="aspect-[16/9] w-full">
            {mounted && (
            <ComposableMap
              projectionConfig={{ scale: 155, center: [15, 25] }}
              width={980}
              height={520}
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const iso = geo.properties.iso_a3 || geo.id;
                    const dest = ISO_TO_DESTINATION[iso];
                    const isActive = !!dest;
                    const isBangladesh = iso === "BGD";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => isActive && setHover(iso)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => isActive && dest && setActive(dest)}
                        style={{
                          default: {
                            fill: isBangladesh
                              ? hover === iso
                                ? "var(--gold-deep)"
                                : "var(--gold)"
                              : isActive
                              ? hover === iso
                                ? "#0ea5e9"
                                : "#1e3a6b"
                              : "#13294b",
                            stroke: "#07142a",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: isActive || isBangladesh ? "pointer" : "default",
                            transition: "fill 0.2s ease",
                          },
                          hover: {
                            fill: isBangladesh ? "var(--gold-deep)" : isActive ? "#38bdf8" : "#13294b",
                            outline: "none",
                          },
                          pressed: { fill: "#0284c7", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              {DESTINATIONS.map((d) => {
                const coord = MARKERS[d.iso];
                if (!coord) return null;
                return (
                  <Marker
                    key={d.iso}
                    coordinates={coord}
                    onClick={() => setActive(d)}
                    onMouseEnter={() => setHover(d.iso)}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: { cursor: "pointer" },
                      hover: { cursor: "pointer" },
                      pressed: { cursor: "pointer" },
                    }}
                  >
                    <circle
                      r={hover === d.iso ? 7 : 4}
                      fill="#38bdf8"
                      stroke="#fff"
                      strokeWidth={1.5}
                      style={{ transition: "r 0.2s" }}
                    />
                    <circle r={10} fill="#38bdf8" opacity={0.25}>
                      <animate
                        attributeName="r"
                        from="6"
                        to="14"
                        dur="2s"
                        begin="0s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.5"
                        to="0"
                        dur="2s"
                        begin="0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </Marker>
                );
              })}
            </ComposableMap>
            )}
          </div>

          {/* legend */}
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky" /><CmsText id="WorldMap.cb9605d35507">
            Click a glowing pin
          </CmsText></div>
        </div>

        {/* country chip rail */}
        <div className="mt-8 flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
          {DESTINATIONS.map((d) => (
            <button
              key={d.iso}
              onClick={() => setActive(d)}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-all hover:-translate-y-0.5 hover:border-sky hover:bg-sky/15 hover:text-white"
            >
              <span className="text-base">{d.flag}</span>
              {d.name}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* country dossier modal */}
      <AnimatePresence>
        {active && <DossierModal dest={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function DossierModal({
  dest,
  onClose,
}: {
  dest: DestinationDetail;
  onClose: () => void;
}) {
 const cmsLabel = useCmsLookup();

  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[2500] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-[1100px] overflow-hidden rounded-t-[28px] bg-card text-foreground shadow-2xl md:rounded-[28px]"
      >
        <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.1fr_1fr]">
          {/* photo side */}
          <div className="relative h-72 overflow-hidden md:h-auto md:min-h-[560px]">
            <img
              src={dest.image}
              alt={dest.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-light">
                {dest.tag}
              </div>
              <div className="mt-3 flex items-end gap-4">
                <span className="text-6xl">{dest.flag}</span>
                <h3 className="font-display text-4xl font-extrabold leading-none">
                  {dest.name}
                </h3>
              </div>
              <p className="mt-3 text-sm italic text-white/80">{dest.tagline}</p>
            </div>
          </div>

          {/* content side */}
          <div className="relative p-7 md:p-10">
            <button
              onClick={onClose}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"
              aria-label={cmsLabel("WorldMap.label.7d9eb7acb13e","Close")}
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {dest.blurb}
            </p>

            {/* quick facts */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Fact icon={<Calendar className="h-4 w-4" />} label={cmsLabel("WorldMap.label.6b627d1cb766","Intake")} value={dest.intake} />
              <Fact icon={<Wallet className="h-4 w-4" />} label={cmsLabel("WorldMap.label.204a5eb2cd28","Cost")} value={dest.avgCost} />
              <Fact icon={<Languages className="h-4 w-4" />} label={cmsLabel("WorldMap.label.a4fe65264ef7","Language")} value={dest.language} />
              <Fact icon={<Stamp className="h-4 w-4" />} label={cmsLabel("WorldMap.label.a725bda1f33e","Visa")} value={dest.visaNote} />
            </div>

            {/* what we cover */}
            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky"><CmsText id="WorldMap.fb3d81a82385">
                What we handle
              </CmsText></div>
              <ul className="mt-3 grid grid-cols-1 gap-2">
                {dest.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-sky" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* universities */}
            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky"><CmsText id="WorldMap.bbb77a237ffd">
                Notable universities
              </CmsText></div>
              <ul className="mt-3 divide-y divide-border">
                {dest.universities.map((u) => (
                  <li key={u.name} className="flex items-start gap-3 py-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{u.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {u.city}
                        <span><CmsText id="WorldMap.a137f17a19a0">·</CmsText></span>
                        <span>{u.highlight}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0284c7] hover:shadow-button"
            ><CmsText id="WorldMap.3ce3ad639329">
              Plan my </CmsText>{dest.name}<CmsText id="WorldMap.1fe289205936"> application
              </CmsText><ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const WA_LINK = useCmsValue("data.WA_LINK", CMS_DEFAULT_WA_LINK);

  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

const WA_LINK = CMS_DEFAULT_WA_LINK;
