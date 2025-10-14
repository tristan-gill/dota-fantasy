ALTER TABLE "user_roster_scores" RENAME COLUMN "softSupport_player_score" TO "soft_support_player_score";--> statement-breakpoint
ALTER TABLE "user_roster_scores" RENAME COLUMN "hardSupport_player_score" TO "hard_support_player_score";--> statement-breakpoint
ALTER TABLE "user_roster_scores" ADD COLUMN "total_score" numeric DEFAULT 0 NOT NULL;