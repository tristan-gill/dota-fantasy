ALTER TABLE "configs" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."config_name";--> statement-breakpoint
CREATE TYPE "public"."config_name" AS ENUM('isAcceptingPredictions', 'IS_ROSTER_OPEN');--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "name" SET DATA TYPE "public"."config_name" USING "name"::"public"."config_name";--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "enabled" SET NOT NULL;