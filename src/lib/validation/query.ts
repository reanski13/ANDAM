import { z } from "zod";

export const HOURS_MAX = 24 * 365;

export const hoursParam = z.coerce.number().int().min(1).max(HOURS_MAX).default(24);
