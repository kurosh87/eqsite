CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"report_id" uuid NOT NULL,
	"stripe_payment_intent_id" text,
	"amount" bigint NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "phenotype_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phenotype_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"citations" jsonb,
	"media_urls" jsonb,
	"order" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "report_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"section_type" text NOT NULL,
	"content" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"upload_id" uuid NOT NULL,
	"primary_phenotype_id" uuid NOT NULL,
	"secondary_phenotypes" jsonb,
	"status" text DEFAULT 'preview' NOT NULL,
	"payment_id" text,
	"amount_paid" bigint,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accessed_count" bigint DEFAULT 0,
	"last_accessed" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"report_id" uuid NOT NULL,
	"format" text NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "phenotypes" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "user_uploads" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phenotype_content" ADD CONSTRAINT "phenotype_content_phenotype_id_phenotypes_id_fk" FOREIGN KEY ("phenotype_id") REFERENCES "public"."phenotypes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_sections" ADD CONSTRAINT "report_sections_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_upload_id_user_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."user_uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_primary_phenotype_id_phenotypes_id_fk" FOREIGN KEY ("primary_phenotype_id") REFERENCES "public"."phenotypes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_downloads" ADD CONSTRAINT "user_downloads_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;