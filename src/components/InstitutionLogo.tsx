import { institutionTypeStyle } from "@/lib/institution-style";
import { logoManifest } from "@/lib/logo-manifest";
import { slugify } from "@/lib/slug";
import type { InstitutionType } from "@prisma/client";

const SIZES = {
  sm: { box: "h-7 w-7", icon: "h-3.5 w-3.5", padding: "p-1" },
  md: { box: "h-9 w-9", icon: "h-[18px] w-[18px]", padding: "p-1" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6", padding: "p-1.5" },
} as const;

/**
 * A few sourced logo files are wordmarks in solid white, meant for a
 * brand-colored navbar — invisible on this component's light tile. Give those
 * a dark backing instead of the default white.
 */
const DARK_TILE_SLUGS = new Set<string>([]);

export function InstitutionLogo({
  name,
  type,
  size = "md",
}: {
  name: string;
  type: InstitutionType;
  size?: keyof typeof SIZES;
}) {
  const slug = slugify(name);
  const filename = logoManifest[slug];
  const style = institutionTypeStyle[type];
  const Icon = style.icon;
  const dims = SIZES[size];

  if (!filename) {
    return (
      <span className={`grid shrink-0 place-items-center rounded-lg ${style.iconWrap} ${dims.box}`}>
        <Icon className={dims.icon} strokeWidth={2} />
      </span>
    );
  }

  const tileBg = DARK_TILE_SLUGS.has(slug) ? "bg-neutral-800" : "bg-white";

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg ring-1 ring-border transition-transform duration-200 group-hover:scale-110 ${tileBg} ${dims.box} ${dims.padding}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local, variably-sized brand assets; next/image needs fixed intrinsic dimensions we don't reliably have */}
      <img src={`/logos/${filename}`} alt={`${name} logo`} className="h-full w-full object-contain" loading="lazy" />
    </span>
  );
}
