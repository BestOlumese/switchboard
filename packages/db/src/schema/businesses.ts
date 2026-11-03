import { boolean, jsonb, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { id, timestamps } from './_columns.ts';

export const businessVertical = pgEnum('business_vertical', [
  'salon',
  'barber',
  'auto',
  'property',
  'clinic',
]);

export const businessPlan = pgEnum('business_plan', ['starter', 'pro']);

/** Shape is pinned down in P5 (payouts). Opaque until then. */
export type KoraPayoutAccount = Record<string, unknown>;

export const businesses = pgTable('businesses', {
  id: id(),
  name: text().notNull(),
  /** Public booking URL: /b/<slug> */
  slug: text().notNull().unique(),
  vertical: businessVertical().notNull(),
  /** IANA zone. Storage is UTC; this is for display and working-hours conversion. */
  timezone: text().notNull().default('Africa/Lagos'),
  /** Routes inbound WhatsApp messages to a business, so at most one business per number. */
  whatsappPhoneNumberId: text().unique('businesses_whatsapp_phone_number_id_unique'),
  plan: businessPlan().notNull().default('starter'),
  koraPayoutAccount: jsonb().$type<KoraPayoutAccount>(),
  agentEnabled: boolean().notNull().default(true),
  ...timestamps,
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
