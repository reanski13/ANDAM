export const APP_ROLES = [
  "administrator",
  "incident_commander",
  "shelter_registrar",
  "bdrrmo_coordinator",
  "viewer",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const CAPABILITIES = [
  "admin.dashboard.read",
  "admin.audit.read",
  "admin.roles.manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const ROLE_CAPABILITIES: Record<AppRole, readonly Capability[]> = {
  administrator: CAPABILITIES,
  incident_commander: ["admin.dashboard.read"],
  shelter_registrar: ["admin.dashboard.read"],
  bdrrmo_coordinator: ["admin.dashboard.read"],
  viewer: ["admin.dashboard.read"],
};

export const ROLE_LABELS: Record<AppRole, string> = {
  administrator: "Administrator",
  incident_commander: "Incident Commander",
  shelter_registrar: "Shelter Registrar",
  bdrrmo_coordinator: "BDRRMO Coordinator",
  viewer: "Viewer",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function hasCapability(role: AppRole | null, capability: Capability): boolean {
  return role !== null && ROLE_CAPABILITIES[role].includes(capability);
}
