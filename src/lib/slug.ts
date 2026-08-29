/** Same slugging rule used by prisma/seed.ts for institution IDs — kept in sync so a
 * logo filename derived from an institution's name always matches its seeded id shape. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
