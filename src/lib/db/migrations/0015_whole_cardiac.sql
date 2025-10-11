ALTER TABLE "user_rosters_table" RENAME TO "user_rosters";--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_carry_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_mid_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_offlane_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_soft_support_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" DROP CONSTRAINT "user_rosters_table_hard_support_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_carry_player_id_players_id_fk" FOREIGN KEY ("carry_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_mid_player_id_players_id_fk" FOREIGN KEY ("mid_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_offlane_player_id_players_id_fk" FOREIGN KEY ("offlane_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_soft_support_player_id_players_id_fk" FOREIGN KEY ("soft_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_hard_support_player_id_players_id_fk" FOREIGN KEY ("hard_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;