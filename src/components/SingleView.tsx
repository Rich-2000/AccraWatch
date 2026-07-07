import type { River } from "../types/river";
import { YearBadge } from "./YearBadge";

export function SingleView({ river, which }: { river: River; which: "then" | "now" }) {
  const img = which === "then" ? river.then : river.now;
  return (
    <div className="absolute inset-0">
      <img
        src={img.src}
        alt={`${river.name}, ${img.year} satellite view`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <YearBadge year={img.year} label={which === "then" ? "Then" : "Now"} align="left" tone={which === "now" ? "danger" : "default"} />
    </div>
  );
}
