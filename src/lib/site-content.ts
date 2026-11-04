import site from "@/content/site.json";

export const SITE = site;

/** Countries currently shown on the site (see src/content/site.json > countries). */
export const ENABLED_COUNTRIES: string[] = site.countries.list
  .filter((c) => c.enabled)
  .map((c) => c.name);

export const isCountryEnabled = (name: string) => ENABLED_COUNTRIES.includes(name);
