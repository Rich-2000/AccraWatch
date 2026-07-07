export interface RiverImage {
  src: string;
  year: number;
  width: number;
  height: number;
}

export interface RiverSource {
  label: string;
  url: string;
}

export interface River {
  id: string;
  name: string;
  shortName: string;
  waterBody: "River" | "Lagoon" | "Stream";
  area: string;
  then: RiverImage;
  now: RiverImage;
  aspectRatio: number;
  summary: string;
  causes: string[];
  floodLink: string;
  status: "critical" | "severe" | "watch";
  sourceCredit: string;
  sources: RiverSource[];
}
