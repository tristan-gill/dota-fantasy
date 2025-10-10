CREATE TYPE "public"."fantasy_title" AS ENUM('BRAWNY', 'DASHING', 'CANNY', 'BALANCED', 'EMERALD', 'CERULEAN', 'CRIMSON', 'OTHERWORLDLY', 'BESTIAL', 'HIRSUTE', 'ELEMENTAL', 'SACRIFICIAL', 'COVETED', 'GLAMOROUS', 'PACIFICST', 'ANT', 'BULL', 'PILGRIM', 'OCTOPUS', 'ACCOMPLICE', 'MULE', 'UNDERDOG', 'LOQUACIOUS', 'TORMENTED', 'PATIENT', 'ACOLYTE', 'DECISIVE');--> statement-breakpoint
CREATE TABLE "fantasy_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" "fantasy_title" NOT NULL,
	"modifier" numeric NOT NULL,
	"name" text,
	"description" text,
	"is_secondary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" RENAME TO "games";--> statement-breakpoint
ALTER TABLE "player_match_performance" RENAME TO "player_game_performances";--> statement-breakpoint
ALTER TABLE "playoff_games" RENAME TO "playoff_matches";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "steam_id" TO "game_id";--> statement-breakpoint
ALTER TABLE "player_game_performances" RENAME COLUMN "match_id" TO "game_id";--> statement-breakpoint
ALTER TABLE "predictions" RENAME COLUMN "playoff_game_id" TO "playoff_match_id";--> statement-breakpoint
ALTER TABLE "player_game_performances" DROP CONSTRAINT "player_match_performance_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "player_game_performances" DROP CONSTRAINT "player_match_performance_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_playoff_game_id_playoff_games_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "playoff_match_id" uuid;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_playoff_match_id_playoff_matches_id_fk" FOREIGN KEY ("playoff_match_id") REFERENCES "public"."playoff_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_game_performances" ADD CONSTRAINT "player_game_performances_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_game_performances" ADD CONSTRAINT "player_game_performances_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_playoff_match_id_playoff_matches_id_fk" FOREIGN KEY ("playoff_match_id") REFERENCES "public"."playoff_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "is_playoff";