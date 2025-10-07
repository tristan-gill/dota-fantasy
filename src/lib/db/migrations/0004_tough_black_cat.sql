CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"steamId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_match_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid,
	"match_id" uuid,
	"kills" integer,
	"deaths" integer,
	"lastHits" integer,
	"gpm" integer,
	"madstoneCount" integer,
	"towerKills" integer,
	"wardsPlaced" integer,
	"campsStacked" integer,
	"runesGrabbed" integer,
	"watchersTaken" integer,
	"lotusesGrabbed" integer,
	"roshanKills" integer,
	"teamfightParticipation" numeric,
	"stunTime" numeric,
	"tormentorKills" integer,
	"courierKills" integer,
	"firstbloodClaimed" boolean,
	"smokesUsed" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_match_performance" ADD CONSTRAINT "player_match_performance_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_performance" ADD CONSTRAINT "player_match_performance_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configs" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "configs" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "playoff_games" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "playoff_games" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "deleted_at";