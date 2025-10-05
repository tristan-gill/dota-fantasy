ALTER TABLE "playoff_games" ADD COLUMN "is_upper" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "playoff_games" DROP COLUMN "is_hidden";