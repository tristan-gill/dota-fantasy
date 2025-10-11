ALTER TABLE "user_banners" RENAME COLUMN "banner_top" TO "banner_top_id";--> statement-breakpoint
ALTER TABLE "user_banners" RENAME COLUMN "banner_middle" TO "banner_middle_id";--> statement-breakpoint
ALTER TABLE "user_banners" RENAME COLUMN "banner_bottom" TO "banner_bottom_id";--> statement-breakpoint
ALTER TABLE "user_banners" DROP CONSTRAINT "user_banners_banner_top_banners_id_fk";
--> statement-breakpoint
ALTER TABLE "user_banners" DROP CONSTRAINT "user_banners_banner_middle_banners_id_fk";
--> statement-breakpoint
ALTER TABLE "user_banners" DROP CONSTRAINT "user_banners_banner_bottom_banners_id_fk";
--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_top_id_banners_id_fk" FOREIGN KEY ("banner_top_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_middle_id_banners_id_fk" FOREIGN KEY ("banner_middle_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_bottom_id_banners_id_fk" FOREIGN KEY ("banner_bottom_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;