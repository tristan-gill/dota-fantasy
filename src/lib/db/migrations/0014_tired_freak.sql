CREATE TABLE "user_rosters_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"carry_player_id" uuid,
	"mid_player_id" uuid,
	"offlane_player_id" uuid,
	"soft_support_player_id" uuid,
	"hard_support_player_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_carry_player_id_players_id_fk" FOREIGN KEY ("carry_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_mid_player_id_players_id_fk" FOREIGN KEY ("mid_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_offlane_player_id_players_id_fk" FOREIGN KEY ("offlane_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_soft_support_player_id_players_id_fk" FOREIGN KEY ("soft_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters_table" ADD CONSTRAINT "user_rosters_table_hard_support_player_id_players_id_fk" FOREIGN KEY ("hard_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;