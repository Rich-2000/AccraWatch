import type { River } from "../types/river";

export const rivers: River[] = [
  {
    id: "odaw-river",
    name: "Odaw River",
    shortName: "Odaw",
    waterBody: "River",
    area: "Ashongman / Achimota corridor, Accra",
    then: { src: "/images/odaw-river-then-2007.jpg", year: 2007, width: 1280, height: 634 },
    now: { src: "/images/odaw-river-now-2026.jpg", year: 2026, width: 1280, height: 632 },
    aspectRatio: 1280 / 634,
    summary:
      "The Odaw is Accra's principal drainage channel, carrying storm-water from the northern suburbs through the city centre before emptying into the Korle Lagoon. Imagery of this upstream reach shows farmland and scattered compounds giving way to dense, tightly packed housing that now presses directly against the watercourse.",
    causes: [
      "Unplanned residential sprawl built into the river's natural floodplain",
      "Loss of vegetated buffer that once slowed and absorbed runoff",
      "Downstream channel narrowed by construction debris and solid waste",
    ],
    floodLink:
      "The Odaw–Korle system is the drainage backbone for central Accra; when upstream buffers like this disappear, stormwater reaches the city centre faster and higher, a pattern authorities linked to the June 2026 flooding.",
    status: "critical",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      {
        label: "Graphic Online — GARID flood project extended to 2027 as Odaw dredging reaches 40%",
        url: "https://www.graphic.com.gh/news/general-news/arid-flood-control-project-extended-to-2027-as-odaw-dredging-reaches-just-over-40.html",
      },
      {
        label: "Adomonline — Accra Mayor on the Odaw River demolition drive",
        url: "https://www.adomonline.com/they-know-their-locations-are-illegal-accra-mayor-on-demolition-drive/",
      },
      {
        label: "Ghana Business News — After nearly $1bn spent, little has changed with Accra's floods",
        url: "https://www.ghanabusinessnews.com/2026/07/02/after-nearly-billion-dollars-spent-little-seem-to-change-with-accra-floods/",
      },
    ],
  },
  {
    id: "korle-lagoon",
    name: "Korle Lagoon",
    shortName: "Korle",
    waterBody: "Lagoon",
    area: "Korle Gonno, near Agbogbloshie, Accra",
    then: { src: "/images/korle-lagoon-then-2001.jpg", year: 2001, width: 1280, height: 573 },
    now: { src: "/images/korle-lagoon-now-2025.jpg", year: 2025, width: 1280, height: 684 },
    aspectRatio: 1280 / 573,
    summary:
      "Korle Lagoon receives the Odaw River just before it reaches the sea, next to the Agbogbloshie market and scrapyard. The comparison shows the lagoon's open water narrowing and its banks crowding with informal settlement and waste, long documented as among the most degraded water bodies on the West African coast.",
    causes: [
      "Decades of solid and e-waste dumping from the adjoining Agbogbloshie scrapyard",
      "Encroachment of housing and market structures onto the lagoon's banks",
      "Sediment and refuse choking the outlet to the sea, reducing flushing",
    ],
    floodLink:
      "As the final outlet for central Accra's stormwater, a choked Korle Lagoon backs up the whole Odaw channel — a key reason Kaneshie, Agbogbloshie and Odawna flood first and hardest in heavy rain.",
    status: "critical",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      { label: "Wikipedia — Korle Lagoon", url: "https://en.wikipedia.org/wiki/Korle_Lagoon" },
      {
        label: "The Herald Ghana — How Accra's Korle Lagoon fell from pride to polluted nightmare",
        url: "https://theheraldghana.com/how-accras-korle-lagoon-fell-from-pride-to-polluted-nightmare/",
      },
      {
        label: "GBC Ghana Online — Agbogbloshie pollution resurges as AMA and communities respond",
        url: "https://www.gbcghanaonline.com/features/agbogbloshie-air/2026/",
      },
    ],
  },
  {
    id: "chemu-lagoon",
    name: "Chemu Lagoon",
    shortName: "Chemu",
    waterBody: "Lagoon",
    area: "Tema, Greater Accra",
    then: { src: "/images/chemu-lagoon-then-2003.jpg", year: 2003, width: 1280, height: 603 },
    now: { src: "/images/chemu-lagoon-now-2024.jpg", year: 2024, width: 1280, height: 617 },
    aspectRatio: 1280 / 603,
    summary:
      "Chemu Lagoon sits inside Tema's industrial harbour city, hemmed in by factories, fuel depots and dense housing. Between the two captures, the surrounding built footprint thickens noticeably while the lagoon channel itself grows narrower and darker, consistent with long-standing reports of industrial effluent and waste discharge.",
    causes: [
      "Industrial and residential effluent discharged directly into the lagoon",
      "Storage tank farms and factories built up to the water's edge",
      "Reduced tidal flushing as the channel narrows and silts up",
    ],
    floodLink:
      "Tema West and the Tema Metropolitan area were among the hardest-hit districts in the June 2026 floods, with thousands displaced — Chemu's shrinking, polluted channel leaves the surrounding low-lying industrial district with little capacity to absorb heavy rain.",
    status: "severe",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      {
        label: "DailyGuide Network — Gov't to dredge Tema's Chemu Lagoon",
        url: "https://dailyguidenetwork.com/govt-to-dredge-tema-chemu-lagoon/",
      },
      {
        label: "GhanaWeb — Chemu Lagoon, an end in sight?",
        url: "https://www.ghanaweb.com/GhanaHomePage/business/Chemu-Lagoon-an-end-in-sight-120267",
      },
    ],
  },
  {
    id: "densu-river",
    name: "Densu River",
    shortName: "Densu",
    waterBody: "River",
    area: "Peri-urban Ga West / Weija corridor, Accra",
    then: { src: "/images/densu-river-then-2009.jpg", year: 2009, width: 1280, height: 640 },
    now: { src: "/images/densu-river-now-2024.jpg", year: 2024, width: 1280, height: 629 },
    aspectRatio: 1280 / 640,
    summary:
      "The Densu feeds the Weija reservoir, a major source of drinking water for Accra, and its delta is a Ramsar-listed wetland. This stretch shows open farmland and green wetland replaced by tightly gridded residential development, a pattern typical of Accra's fast-growing western suburbs.",
    causes: [
      "Rapid conversion of farmland and wetland buffer into housing plots",
      "Loss of the vegetated floodplain that historically absorbed river overflow",
      "Encroachment pressure on the wider Densu Delta Ramsar wetland downstream",
    ],
    floodLink:
      "Ga West and Weija-Gbawe were named among the flood-affected districts in June 2026; a river basin with less wetland left to absorb runoff sends more water downstream, faster.",
    status: "watch",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      { label: "Wikipedia — Densu River", url: "https://en.wikipedia.org/wiki/Densu_River" },
      {
        label: "The Fourth Estate — Ghana's Ramsar sites at the mercy of encroachers",
        url: "https://thefourthestategh.com/2025/04/ticking-time-bomb-ghanas-ramsar-sites-at-the-mercy-of-encroachers/",
      },
      {
        label: "CitiNewsroom — Investor digs trench at Panbros Salt site, part of the Densu Delta Ramsar Site, without approval",
        url: "https://citinewsroom.com/2025/10/chinese-investor-digs-trench-at-panbros-salt-site-without-municipal-approval/",
      },
    ],
  },
  {
    id: "sakumono-lagoon",
    name: "Sakumono Lagoon",
    shortName: "Sakumono",
    waterBody: "Lagoon",
    area: "Sakumono / Tema Community, Greater Accra",
    then: { src: "/images/sakumono-lagoon-then-2003.jpg", year: 2003, width: 1280, height: 559 },
    now: { src: "/images/sakumono-lagoon-now-2024.jpg", year: 2024, width: 1280, height: 627 },
    aspectRatio: 1280 / 559,
    summary:
      "Sakumono is a Ramsar-listed coastal wetland that once buffered a wide green floodplain between Accra and Tema. Across these captures the open lagoon and its surrounding marsh visibly shrink as residential estates and roads close in from nearly every side.",
    causes: [
      "Large-scale housing estates built directly on the wetland's historic floodplain",
      "Fragmentation of the marsh by roads and drainage channels",
      "Reduced capacity to buffer storm surge and heavy-rain runoff for nearby estates",
    ],
    floodLink:
      "Coastal wetlands like Sakumono are natural flood buffers; as estates replace marsh, nearby low-lying communities lose the sponge effect that once absorbed the kind of rainfall recorded in June 2026.",
    status: "severe",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      {
        label: "The Conversation — An important wetland in Ghana is under siege",
        url: "https://theconversation.com/an-important-wetland-in-ghana-is-under-siege-researchers-investigate-the-real-issues-269016",
      },
      {
        label: "Graphic Online — Illegal structures demolished at Sakumo Ramsar site to curb flooding",
        url: "https://www.graphic.com.gh/news/general-news/illegal-structures-demolished-at-sakumo-ramsar-site-to-curb-flooding.html",
      },
      {
        label: "Ghanaian Times — Demolition at Sakumono Ramsar site: a necessary evil",
        url: "https://ghanaiantimes.com.gh/demolition-at-sakumono-ramsar-site-a-necessary-evil/",
      },
    ],
  },
  {
    id: "awoshie-lafa-stream",
    name: "Awoshie Lafa Stream",
    shortName: "Lafa Stream",
    waterBody: "Stream",
    area: "Awoshie / Ablekuma, Accra",
    then: { src: "/images/awoshie-lafa-stream-then-2002.jpg", year: 2002, width: 1280, height: 631 },
    now: { src: "/images/awoshie-lafa-stream-now-2022.jpg", year: 2022, width: 1280, height: 602 },
    aspectRatio: 1280 / 631,
    summary:
      "The Lafa Stream runs through the densely populated Awoshie and Ablekuma neighbourhoods, an area with a long record of flash flooding. The comparison shows its natural green buffer, visible in the earlier capture, almost entirely replaced by continuous rooftops pressed against the watercourse.",
    causes: [
      "Structures built directly within the stream's natural buffer and floodway",
      "Near-total loss of permeable, vegetated ground for rainfall to soak into",
      "Undersized or blocked culverts where the stream passes under roads",
    ],
    floodLink:
      "Ablekuma North was listed among the districts affected in the June 2026 disaster; streams like the Lafa, once open and buffered, now flood the homes built over them within minutes of heavy rain.",
    status: "critical",
    sourceCredit: "Airbus / Maxar Technologies satellite basemap imagery",
    sources: [
      { label: "Wikipedia — Awoshie", url: "https://en.wikipedia.org/wiki/Awoshie" },
      {
        label: "GhanaWeb — Areas badly hit by Accra's floods after heavy rains",
        url: "https://www.ghanaweb.com/GhanaHomePage/NewsArchive/Here-are-areas-badly-hit-by-Accra-floods-after-heavy-rains-2041010",
      },
      {
        label: "Graphic Online — Accra floods: 12 dead, 7 missing, Interior Minister tells Parliament",
        url: "https://www.graphic.com.gh/news/general-news/ghana-news-12-dead-7-missing-interior-minister-tells-parliament.html",
      },
    ],
  },
];
