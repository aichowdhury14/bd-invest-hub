import { Landmark, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import type { InstitutionType } from "@prisma/client";

interface TypeStyle {
  icon: LucideIcon;
  iconWrap: string;
  badge: string;
  ring: string;
}

export const institutionTypeStyle: Record<InstitutionType, TypeStyle> = {
  BANK: {
    icon: Landmark,
    iconWrap: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    ring: "hover:ring-blue-500/20",
  },
  GOVERNMENT: {
    icon: ShieldCheck,
    iconWrap: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    ring: "hover:ring-amber-500/20",
  },
  INVESTMENT_ORG: {
    icon: TrendingUp,
    iconWrap: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    ring: "hover:ring-violet-500/20",
  },
};
