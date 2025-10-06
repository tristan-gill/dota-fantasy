ALTER TABLE "playoff_game_predictions" RENAME TO "predictions";--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "playoff_game_predictions_playoff_game_id_playoff_games_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "playoff_game_predictions_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_playoff_game_id_playoff_games_id_fk" FOREIGN KEY ("playoff_game_id") REFERENCES "public"."playoff_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;