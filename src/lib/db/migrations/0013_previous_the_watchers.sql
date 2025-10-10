CREATE TYPE "public"."banner_type_enum" AS ENUM('KILLS', 'DEATHS', 'LAST_HITS', 'GPM', 'MADSTONE_COUNT', 'TOWER_KILLS', 'WARDS_PLACED', 'CAMPS_STACKED', 'RUNES_GRABBED', 'WATCHERS_TAKEN', 'SMOKES_USE', 'ROSHAN_KILLS', 'TEAMFIGHT_PARTICIPATION', 'STUN_TIME', 'TORMENTOR_KILLS', 'COURIER_KILLS', 'FIRSTBLOOD_CLAIMED');--> statement-breakpoint
CREATE TABLE "user_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" integer NOT NULL,
	"banner_top" "banner_type_enum",
	"banner_top_multiplier" numeric,
	"banner_middle" "banner_type_enum",
	"banner_middle_multiplier" numeric,
	"banner_bottom" "banner_type_enum",
	"banner_bottom_multiplier" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" integer NOT NULL,
	"primary_title" "fantasy_title" NOT NULL,
	"secondary_title" "fantasy_title" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_game_performances" DROP COLUMN "lotuses_grabbed";