import { Landmark, ShieldCheck, Smartphone, TrendingUp, type LucideIcon } from "lucide-react";
import type { InstitutionType } from "@prisma/client";

interface TypeStyle {
  icon: LucideIcon;
  iconWrap: string;
  badge: string;
  ring: string;
}

// Categorical colors for institution type (bank/government/investment-org),
// validated for CVD-safe pairwise separation and contrast in both light and
// dark mode — see the dataviz skill's validate_palette.js. Light-mode text
// uses the -700 step, dark-mode text the -400 step, both against their
// resepective app surfaces.
export const institutionTypeStyle: Record<InstitutionType, TypeStyle> = {
  BANK: {
    icon: Landmark,
    iconWrap: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    ring: "hover:ring-blue-500/30",
  },
  GOVERNMENT: {
    icon: ShieldCheck,
    iconWrap: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    ring: "hover:ring-amber-500/30",
  },
  INVESTMENT_ORG: {
    icon: TrendingUp,
    iconWrap: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    ring: "hover:ring-violet-500/30",
  },
  DIGITAL_BANK: {
    icon: Smartphone,
    iconWrap: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
    ring: "hover:ring-teal-500/30",
  },
};

/**
 * Product-level status badge for Islamic (Mudaraba/profit-sharing) products —
 * distinct from institutionTypeStyle above on purpose, since Islamic vs
 * conventional is a per-product tag, not a competing institution identity
 * (a bank can offer both). Emerald reads correctly against global
 * Islamic-finance branding conventions; contrast-checked (WCAG text) against
 * both light and dark surfaces, and picked to stay visually distinct from
 * both the brand gradient (deep teal-green, --brand-start/--brand-end) and
 * the violet used for INVESTMENT_ORG above.
 */
export const islamicBadgeClass =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
