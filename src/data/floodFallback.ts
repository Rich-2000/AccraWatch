import type { FloodNewsArticle } from "../hooks/useFloodNews";

/**
 * This is NOT mocked or invented data. It is a hand-curated, dated snapshot of real,
 * verifiable reporting on the 29 June 2026 Accra/Tema flood disaster, drawn from
 * Reuters, Al Jazeera, GBC Ghana, Graphic Online, CitiNewsroom, Ghana Business News
 * and Pulse Ghana. It exists purely as an offline fallback for when the live GDELT
 * news feed cannot be reached (e.g. network/CORS failure) — the UI always labels it
 * clearly as a "verified summary" rather than a live feed, and every item links to
 * its real source article. Update the `asOf` date and entries periodically as the
 * situation develops.
 */

export const FALLBACK_AS_OF = "2026-07-06";

export const fallbackArticles: FloodNewsArticle[] = [
  {
    id: "fallback-1",
    title: "Ghana confirms 12 dead after Accra's heaviest single-day rainfall in years",
    url: "https://www.usnews.com/news/world/articles/2026-06-30/heavy-rains-hit-ghana-killing-at-least-12-in-floods",
    domain: "reuters.com",
    sourceCountry: "GH",
    publishedAt: new Date("2026-06-30T10:00:00Z"),
  },
  {
    id: "fallback-2",
    title: "Search continues for 7 missing as Accra flood toll holds at 12, over 38,000 displaced",
    url: "https://www.aljazeera.com/news/2026/6/30/heavy-rainfall-kills-dozens-in-ghana-ivory-coast",
    domain: "aljazeera.com",
    sourceCountry: "QA",
    publishedAt: new Date("2026-06-30T14:00:00Z"),
  },
  {
    id: "fallback-3",
    title: "Mahama orders demolition of waterway obstructions, cites tripling of June rainfall since 2024",
    url: "https://www.graphic.com.gh/news/general-news/ghana-news-demolish-structures-obstructing-waterways-president-directs-mmdas-govt-votes-ghc300m-for-flood-impact.html",
    domain: "graphic.com.gh",
    sourceCountry: "GH",
    publishedAt: new Date("2026-07-01T09:00:00Z"),
  },
  {
    id: "fallback-4",
    title: "Finance Ministry releases GH¢350m for emergency flood relief and drainage mitigation",
    url: "https://www.citinewsroom.com/2026/07/finance-ministry-releases-gh%C2%A2350m-for-flood-relief/",
    domain: "citinewsroom.com",
    sourceCountry: "GH",
    publishedAt: new Date("2026-07-01T12:00:00Z"),
  },
  {
    id: "fallback-5",
    title: "Armed Forces launch 'Operation Boafo' rescue and post-flood recovery across Greater Accra",
    url: "https://www.graphic.com.gh/news/general-news/ghana-news-govt-activates-post-flood-recovery-armed-forces-lead-operational-response.html",
    domain: "graphic.com.gh",
    sourceCountry: "GH",
    publishedAt: new Date("2026-07-02T09:00:00Z"),
  },
  {
    id: "fallback-6",
    title: "How decades of wetland loss and drain-blocking turned routine rain into citywide flooding",
    url: "https://www.ghanabusinessnews.com/2026/07/01/accras-water-bodies-were-killed-and-buried-under-a-concrete-jungle-that-now-haunts-residents/",
    domain: "ghanabusinessnews.com",
    sourceCountry: "GH",
    publishedAt: new Date("2026-07-01T08:00:00Z"),
  },
  {
    id: "fallback-7",
    title: "Mahama declares July 10–11 National General Cleaning Days across 7 flood-hit regions",
    url: "https://www.pulse.com.gh/story/president-mahama-declares-2-day-national-clean-up-exercise-in-7-regions-after-deadly-floods-2026070613594594202",
    domain: "pulse.com.gh",
    sourceCountry: "GH",
    publishedAt: new Date("2026-07-06T07:00:00Z"),
  },
];

export interface FallbackKeyFact {
  label: string;
  value: string;
  note: string;
}

export interface FallbackSource {
  label: string;
  url: string;
  date: string;
}

export const fallbackBrief = {
  asOf: FALLBACK_AS_OF,
  headline:
    "Torrential rain on 29 June 2026 — about 140mm in a single day, the highest in years — flooded large parts of Accra, Tema and surrounding districts across the Greater Accra, Volta and Central regions.",

  keyFacts: [
    { label: "Confirmed deaths", value: "12", note: "3 women, 8 men, 1 child" },
    { label: "People affected", value: "38,000+", note: "displaced or stranded" },
    { label: "Households displaced", value: "7,761", note: "across affected MMDAs" },
    { label: "Still missing", value: "7", note: "as of 1 Jul 2026" },
    { label: "Rescued", value: "470+", note: "by fire service, day 2 alone" },
    { label: "Rainfall recorded", value: "~140mm", note: "single day, 29 Jun 2026" },
  ] satisfies FallbackKeyFact[],

  rainfallTrend: [
    { period: "June 2024 (30 days)", value: "~85mm" },
    { period: "June 2025 (30 days)", value: "~172mm" },
    { period: "June 2026 (30 days)", value: "~333mm" },
  ],

  causes: [
    "Rapid, largely unplanned urban expansion built directly into natural floodplains and river buffers",
    "Wetlands and lagoon margins (Korle, Chemu, Sakumono, Densu delta) filled with refuse then reclaimed for housing",
    "Solid waste and construction debris blocking drains, culverts and watercourse outlets to the sea",
    "Weak enforcement of building and environmental regulations amid decades of uncontrolled sprawl",
    "Accelerating rainfall intensity: June rainfall roughly quadrupled between 2024 and 2026, giving drains no time to recover between storms",
    "Accra's geography — a coastal plain hemmed between the Akwapim range and the Atlantic — concentrates runoff toward the city centre",
  ],

  geography: [
    { area: "Odaw–Korle corridor (central Accra, Agbogbloshie, Kaneshie)", note: "Principal drainage backbone; blocked outlet backs up the whole channel" },
    { area: "Circle & central Accra", note: "Major roads and lorry parks submerged" },
    { area: "Weija–Gbawe / Ga West (Densu basin)", note: "Encroachment on the Densu delta Ramsar wetland" },
    { area: "Ablekuma North (Awoshie/Lafa Stream)", note: "Long-standing flash-flood hotspot" },
    { area: "Tema / Chemu Lagoon (industrial harbour city)", note: "Among the hardest-hit districts; industrial effluent worsens flushing" },
    { area: "La Dade-Kotopon, Ayawaso Central, Korle Klottey, Krowor, Okaikwei North", note: "First-phase relief distribution zones" },
    { area: "Ga East, Shai Osudoku, Ada East & West", note: "Second-phase relief distribution zones" },
  ],

  damages: [
    "Homes, businesses, markets and roads submerged across Accra, Tema and surrounding towns",
    "Major arterial roads impassable; transport network disrupted for days",
    "Traders at markets and lorry parks reported heavy losses as floodwater destroyed goods and equipment",
    "Two state agencies reported heavy equipment losses from the flooding",
    "A fire at a rubber factory broke out amid the flooding, slowing firefighting response",
    "Cumulative flood losses in Ghana over the past decade are estimated to exceed US$1.7 billion",
  ],

  response: [
    "GH¢300–350 million released from the Contingency Fund for relief and mitigation (roughly split between direct humanitarian aid and drainage/infrastructure works)",
    "National Post-Flood Mitigation Task Force activated, led operationally by the Ghana Armed Forces ('Operation Boafo')",
    "NADMO relief distribution rolled out in phases to affected MMDAs (food, water, shelter materials, blankets, medical supplies)",
    "President Mahama directed MMDAs to identify and demolish structures obstructing waterways",
    "July 10–11, 2026 declared National General Cleaning Days across 7 flood-affected regions",
    "Longer-term plan (~20 years) to relocate some government institutions and ease pressure on Accra via a new growth centre",
  ],

  sources: [
    { label: "Reuters — Heavy Rains Hit Ghana, Killing at Least 12 in Floods", url: "https://www.usnews.com/news/world/articles/2026-06-30/heavy-rains-hit-ghana-killing-at-least-12-in-floods", date: "30 Jun 2026" },
    { label: "Al Jazeera — Heavy rainfall kills dozens in Ghana, Ivory Coast", url: "https://www.aljazeera.com/news/2026/6/30/heavy-rainfall-kills-dozens-in-ghana-ivory-coast", date: "30 Jun 2026" },
    { label: "Graphic Online — Demolish structures obstructing waterways", url: "https://www.graphic.com.gh/news/general-news/ghana-news-demolish-structures-obstructing-waterways-president-directs-mmdas-govt-votes-ghc300m-for-flood-impact.html", date: "1 Jul 2026" },
    { label: "CitiNewsroom — Finance Ministry releases GH¢350m for flood relief", url: "https://www.citinewsroom.com/2026/07/finance-ministry-releases-gh%C2%A2350m-for-flood-relief/", date: "1 Jul 2026" },
    { label: "Ghana Business News — Accra's water bodies killed and buried", url: "https://www.ghanabusinessnews.com/2026/07/01/accras-water-bodies-were-killed-and-buried-under-a-concrete-jungle-that-now-haunts-residents/", date: "1 Jul 2026" },
    { label: "Pulse Ghana — National General Cleaning Days declared", url: "https://www.pulse.com.gh/story/president-mahama-declares-2-day-national-clean-up-exercise-in-7-regions-after-deadly-floods-2026070613594594202", date: "6 Jul 2026" },
  ] satisfies FallbackSource[],
};
