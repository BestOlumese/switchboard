-- btree_gist: lets the bookings EXCLUDE constraint (invariant I1) combine
-- staff_id equality with tstzrange overlap. Added by hand; Drizzle can't express extensions.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TYPE "public"."business_plan" AS ENUM('starter', 'pro');--> statement-breakpoint
CREATE TYPE "public"."business_vertical" AS ENUM('salon', 'barber', 'auto', 'property', 'clinic');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"vertical" "business_vertical" NOT NULL,
	"timezone" text DEFAULT 'Africa/Lagos' NOT NULL,
	"whatsapp_phone_number_id" text,
	"plan" "business_plan" DEFAULT 'starter' NOT NULL,
	"kora_payout_account" jsonb,
	"agent_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug"),
	CONSTRAINT "businesses_whatsapp_phone_number_id_unique" UNIQUE("whatsapp_phone_number_id")
);
