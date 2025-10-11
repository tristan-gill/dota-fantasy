CREATE TYPE "public"."banner_color_enum" AS ENUM('RED', 'BLUE', 'GREEN');--> statement-breakpoint
CREATE TYPE "public"."banner_type_enum" AS ENUM('KILLS', 'DEATHS', 'LAST_HITS', 'GPM', 'MADSTONE_COUNT', 'TOWER_KILLS', 'WARDS_PLACED', 'CAMPS_STACKED', 'RUNES_GRABBED', 'WATCHERS_TAKEN', 'SMOKES_USE', 'ROSHAN_KILLS', 'TEAMFIGHT_PARTICIPATION', 'STUN_TIME', 'TORMENTOR_KILLS', 'COURIER_KILLS', 'FIRSTBLOOD_CLAIMED');--> statement-breakpoint
CREATE TYPE "public"."config_name" AS ENUM('isAcceptingPredictions');--> statement-breakpoint
CREATE TYPE "public"."fantasy_title" AS ENUM('BRAWNY', 'DASHING', 'CANNY', 'BALANCED', 'EMERALD', 'CERULEAN', 'CRIMSON', 'OTHERWORLDLY', 'BESTIAL', 'HIRSUTE', 'ELEMENTAL', 'SACRIFICIAL', 'COVETED', 'GLAMOROUS', 'PACIFICST', 'ANT', 'BULL', 'PILGRIM', 'OCTOPUS', 'ACCOMPLICE', 'MULE', 'UNDERDOG', 'LOQUACIOUS', 'TORMENTED', 'PATIENT', 'ACOLYTE', 'DECISIVE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner_type" "banner_type_enum" NOT NULL,
	"name" text,
	"description" text,
	"banner_color" "banner_color_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "config_name" NOT NULL,
	"enabled" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" text NOT NULL,
	"playoff_match_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_game_performances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid,
	"game_id" uuid,
	"kills" integer,
	"deaths" integer,
	"last_hits" integer,
	"gpm" integer,
	"madstone_count" integer,
	"tower_kills" integer,
	"wards_placed" integer,
	"camps_stacked" integer,
	"runes_grabbed" integer,
	"watchers_taken" integer,
	"roshan_kills" integer,
	"teamfight_participation" numeric,
	"stun_time" numeric,
	"tormentor_kills" integer,
	"courier_kills" integer,
	"firstblood_claimed" boolean,
	"smokes_used" integer,
	"titles" "fantasy_title"[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"steam_id" text NOT NULL,
	"team_id" uuid,
	"position" integer NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_steam_id_unique" UNIQUE("steam_id")
);
--> statement-breakpoint
CREATE TABLE "playoff_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round" integer NOT NULL,
	"sequence" integer NOT NULL,
	"team_id_left" uuid,
	"team_id_right" uuid,
	"winner_id" uuid,
	"is_upper" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playoff_match_id" uuid,
	"user_id" text,
	"team_id_left" uuid,
	"team_id_right" uuid,
	"winner_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" "fantasy_title" NOT NULL,
	"modifier" numeric NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_secondary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" integer NOT NULL,
	"banner_top_id" uuid NOT NULL,
	"banner_top_multiplier" numeric NOT NULL,
	"banner_middle_id" uuid NOT NULL,
	"banner_middle_multiplier" numeric NOT NULL,
	"banner_bottom_id" uuid NOT NULL,
	"banner_bottom_multiplier" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_rosters" (
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
CREATE TABLE "user_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" integer NOT NULL,
	"primary_title_id" uuid NOT NULL,
	"secondary_title_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_playoff_match_id_playoff_matches_id_fk" FOREIGN KEY ("playoff_match_id") REFERENCES "public"."playoff_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_game_performances" ADD CONSTRAINT "player_game_performances_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_game_performances" ADD CONSTRAINT "player_game_performances_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_playoff_match_id_playoff_matches_id_fk" FOREIGN KEY ("playoff_match_id") REFERENCES "public"."playoff_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_top_id_banners_id_fk" FOREIGN KEY ("banner_top_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_middle_id_banners_id_fk" FOREIGN KEY ("banner_middle_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_banners" ADD CONSTRAINT "user_banners_banner_bottom_id_banners_id_fk" FOREIGN KEY ("banner_bottom_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_carry_player_id_players_id_fk" FOREIGN KEY ("carry_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_mid_player_id_players_id_fk" FOREIGN KEY ("mid_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_offlane_player_id_players_id_fk" FOREIGN KEY ("offlane_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_soft_support_player_id_players_id_fk" FOREIGN KEY ("soft_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rosters" ADD CONSTRAINT "user_rosters_hard_support_player_id_players_id_fk" FOREIGN KEY ("hard_support_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_primary_title_id_titles_id_fk" FOREIGN KEY ("primary_title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_secondary_title_id_titles_id_fk" FOREIGN KEY ("secondary_title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "slug_idx" ON "profiles" USING btree ("slug");