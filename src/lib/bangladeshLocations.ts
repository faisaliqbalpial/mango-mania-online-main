import UPAZILAS_DATA from "@/upazilas.json";

export type UpazilaEntry = { en: string; bn: string };

/** Canonical district names (UI) → keys in upazilas.json */
export const DISTRICT_ALIASES: Record<string, string> = {
  Barishal: "Barisal",
  Chattogram: "Chittagong",
  "Cox's Bazar": "Coxs Bazar",
  Cumilla: "Comilla",
  Jashore: "Jessore",
};

const JSON_TO_CANONICAL: Record<string, string> = Object.fromEntries(
  Object.entries(DISTRICT_ALIASES).map(([canonical, jsonKey]) => [jsonKey, canonical]),
);

export function getUpazilasForDistrict(district: string): UpazilaEntry[] {
  const key = DISTRICT_ALIASES[district] ?? district;
  const list = UPAZILAS_DATA[key as keyof typeof UPAZILAS_DATA];
  return Array.isArray(list) ? list : [];
}

export function getUpazilaLabel(district: string, upazilaEn: string, lang: "bn" | "en"): string {
  const match = getUpazilasForDistrict(district).find((u) => u.en === upazilaEn);
  if (match) return lang === "bn" ? match.bn : match.en;
  return upazilaEn;
}

/** All districts for the selector (canonical names, sorted). */
export function getDistrictList(extraNames: string[]): string[] {
  const set = new Set<string>([
    ...extraNames,
    ...Object.keys(UPAZILAS_DATA).map((k) => JSON_TO_CANONICAL[k] ?? k),
  ]);
  return [...set].sort((a, b) => a.localeCompare(b));
}
