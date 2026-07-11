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

/** Normalized (0..1) region of the frame, relative to the full "then"/"now" photo. */
export interface FocusRegion {
  x: number;
  y: number;
  width: number;
  height: number;
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
  /**
   * Optional crop used only by the change-map's water-detection pass. Some
   * source photos are framed wide (e.g. showing open sea alongside a narrow
   * lagoon channel); on those, the detector needs to zoom into the actual
   * waterway or it locks onto the largest smooth dark area in the frame,
   * which can be the ocean instead of the river/lagoon. Does not affect the
   * Split/Then/Now views, which still show the full photo.
   */
  changeMapFocus?: FocusRegion;
}
