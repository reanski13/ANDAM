import { describe, expect, it } from "vitest";
import { APP_ROLES, hasCapability, isAppRole } from "./roles";

describe("official role authorization", () => {
  it("grants dashboard access to every assigned official role", () => {
    for (const role of APP_ROLES) {
      expect(hasCapability(role, "admin.dashboard.read")).toBe(true);
    }
  });

  it("reserves role management and audit access for Administrators", () => {
    for (const role of APP_ROLES.filter((role) => role !== "administrator")) {
      expect(hasCapability(role, "admin.roles.manage")).toBe(false);
      expect(hasCapability(role, "admin.audit.read")).toBe(false);
    }
    expect(hasCapability("administrator", "admin.roles.manage")).toBe(true);
    expect(hasCapability("administrator", "admin.audit.read")).toBe(true);
  });

  it("fails closed for missing and unrecognized roles", () => {
    expect(hasCapability(null, "admin.dashboard.read")).toBe(false);
    expect(isAppRole("administrator")).toBe(true);
    expect(isAppRole("superuser")).toBe(false);
    expect(isAppRole({ role: "administrator" })).toBe(false);
  });
});
