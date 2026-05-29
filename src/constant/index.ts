// ─── Role Enum ────────────────────────────────────────────────────────────────

export const ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const satisfies Record<string, Role>;
