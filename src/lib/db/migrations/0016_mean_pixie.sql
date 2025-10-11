CREATE TYPE "public"."banner_color_enum" AS ENUM('RED', 'BLUE', 'GREEN');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner_type" "banner_type_enum" NOT NULL,
	"name" text,
	"description" text,
	"banner_color" "banner_color_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fantasy_titles" RENAME TO "titles";--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_top" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_top" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_middle" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_middle" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_bottom" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_banners" ALTER COLUMN "banner_bottom" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_titles" ADD COLUMN "primary_title_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_titles" ADD COLUMN "secondary_title_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_top_banners_id_fk" FOREIGN KEY ("banner_top") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_middle_banners_id_fk" FOREIGN KEY ("banner_middle") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_bottom_banners_id_fk" FOREIGN KEY ("banner_bottom") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_primary_title_id_titles_id_fk" FOREIGN KEY ("primary_title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_secondary_title_id_titles_id_fk" FOREIGN KEY ("secondary_title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" DROP COLUMN "primary_title";--> statement-breakpoint
ALTER TABLE "user_titles" DROP COLUMN "secondary_title";