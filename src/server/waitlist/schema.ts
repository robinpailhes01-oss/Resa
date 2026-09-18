import { z } from "zod";
import { isValidEmail } from "./email-normalize";

const BUSINESS_TYPES = ["institut", "onglerie", "regard_cils", "coiffure_barbier", "spa_soins", "autre"] as const;
const TEAM_SIZES = ["solo", "2_3", "4_plus"] as const;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

/**
 * Contrat du POST /api/waitlist (§10). Les champs inattendus sont rejetés
 * (`strict`), les listes sont fermées, le champ piège doit rester vide.
 */
export const waitlistRequestSchema = z
  .object({
    email: z
      .string()
      .max(254, "email_too_long")
      .refine((value) => isValidEmail(value.trim()), { message: "email_invalid" }),
    businessType: z.preprocess(emptyToUndefined, z.enum(BUSINESS_TYPES).optional()),
    teamSize: z.preprocess(emptyToUndefined, z.enum(TEAM_SIZES).optional()),
    locale: z.literal("fr").optional().default("fr"),
    privacyVersion: z.string().min(1).max(32),
    source: z.literal("landing").optional().default("landing"),
    attribution: z
      .object(Object.fromEntries(UTM_KEYS.map((key) => [key, z.string().max(64).optional()])))
      .strict()
      .optional(),
    idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/).optional(),
    /** Champ piège : doit être absent ou vide. */
    website: z.string().max(0).optional(),
  })
  .strict();

export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;

export const UTM_KEYS_ALLOWED = UTM_KEYS;
