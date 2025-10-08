ALTER TABLE "predictions" DROP CONSTRAINT "predictions_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "profile_id";