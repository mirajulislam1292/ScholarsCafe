import site from "@/content/site.json";
import { useCmsList } from "@/lib/cms";

export const SITE = site;

/** Countries currently shown on the site (see src/content/site.json > countries). */
export const ENABLED_COUNTRIES: string[] = site.countries.list
  .filter((c) => c.enabled)
  .map((c) => c.name);

export const isCountryEnabled = (name: string) => ENABLED_COUNTRIES.includes(name);

/** Enabled countries, live from the admin ("Countries") with site.json as the fallback. */
export function useEnabledCountries(): string[] {
  return useCmsList<{ name: string; enabled: boolean }>("countries", site.countries.list)
    .filter((c) => c.enabled)
    .map((c) => c.name);
}
