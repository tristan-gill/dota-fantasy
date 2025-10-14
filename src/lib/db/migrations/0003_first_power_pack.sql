CREATE TABLE "user_roster_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"carry_player_score" numeric DEFAULT 0 NOT NULL,
	"mid_player_score" numeric DEFAULT 0 NOT NULL,
	"offlane_player_score" numeric DEFAULT 0 NOT NULL,
	"softSupport_player_score" numeric DEFAULT 0 NOT NULL,
	"hardSupport_player_score" numeric DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updates_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "titles" RENAME COLUMN "title" TO "titleType";--> statement-breakpoint
ALTER TABLE "user_roster_scores" ADD CONSTRAINT "user_roster_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;