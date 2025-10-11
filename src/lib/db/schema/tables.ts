import { boolean, index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// TODO split this into separate files

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at")
});

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
]);
export const userRolesTable = pgTable("user_roles", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  role: userRoleEnum().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profilesTable = pgTable("profiles", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  slug: text().unique().notNull(),
  name: text(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("slug_idx").on(table.slug)
]);
// export type Profile = typeof profiles.$inferSelect;

export const teamsTable = pgTable("teams", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  image: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type Team = typeof teamsTable.$inferSelect;

export const playersTable = pgTable("players", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  steamId: text("steam_id").unique().notNull(),
  teamId: uuid("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
  position: integer().notNull(),
  image: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// export type Player = typeof players.$inferSelect;

export const playoffMatchesTable = pgTable("playoff_matches", {
  id: uuid().primaryKey().defaultRandom(),
  round: integer().notNull(),
  sequence: integer().notNull(),
  teamIdLeft: uuid("team_id_left"),
  teamIdRight: uuid("team_id_right"),
  winnerId: uuid("winner_id"),
  isUpper: boolean("is_upper").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// export interface PlayoffMatchTabletidk = typeof playoffMatches.$inferSelect;
export type PlayoffMatch = typeof playoffMatchesTable.$inferSelect;

export const predictionsTable = pgTable("predictions", {
  id: uuid().primaryKey().defaultRandom(),
  playoffMatchId: uuid("playoff_match_id").references(() => playoffMatchesTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  teamIdLeft: uuid("team_id_left"),
  teamIdRight: uuid("team_id_right"),
  winnerId: uuid("winner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type InsertPrediction = typeof predictionsTable.$inferInsert;
export type Prediction = typeof predictionsTable.$inferSelect;

// TODO screaming snake case?
export const configNameEnum = pgEnum("config_name", [
  "isAcceptingPredictions",
]);
export const configsTable = pgTable("configs", {
  id: uuid().primaryKey().defaultRandom(),
  name: configNameEnum().notNull(),
  enabled: boolean(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gamesTable = pgTable("games", {
  id: uuid().primaryKey().defaultRandom(),
  gameId: text("game_id").notNull(),
  playoffMatchId: uuid("playoff_match_id").references(() => playoffMatchesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const fantasyPlayerTitleEnum = pgEnum("fantasy_title", [
  "BRAWNY",
  "DASHING",
  "CANNY",
  "BALANCED",
  "EMERALD",
  "CERULEAN",
  "CRIMSON",
  "OTHERWORLDLY",
  "BESTIAL",
  "HIRSUTE",
  "ELEMENTAL",
  "SACRIFICIAL",
  "COVETED",
  "GLAMOROUS",
  "PACIFICST",
  "ANT",
  "BULL",
  "PILGRIM",
  "OCTOPUS",
  "ACCOMPLICE",
  "MULE",
  "UNDERDOG",
  "LOQUACIOUS",
  "TORMENTED",
  "PATIENT",
  "ACOLYTE",
  "DECISIVE"
]);

export const playerGamePerformancesTable = pgTable("player_game_performances", {
  id: uuid().primaryKey().defaultRandom(),
  playerId: uuid("player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  gameId: uuid("game_id").references(() => gamesTable.id, { onDelete: "cascade" }),
  kills: integer(),
  deaths: integer(),
  lastHits: integer("last_hits"),
  gpm: integer(),
  madstoneCount: integer("madstone_count"),
  towerKills: integer("tower_kills"),
  wardsPlaced: integer("wards_placed"),
  campsStacked: integer("camps_stacked"),
  runesGrabbed: integer("runes_grabbed"),
  watchersTaken: integer("watchers_taken"),
  // lotusesGrabbed: integer("lotuses_grabbed"),
  roshanKills: integer("roshan_kills"),
  teamfightParticipation: numeric("teamfight_participation"),
  stunTime: numeric("stun_time"),
  tormentorKills: integer("tormentor_kills"),
  courierKills: integer("courier_kills"),
  firstbloodClaimed: boolean("firstblood_claimed"),
  smokesUsed: integer("smokes_used"),
  titles: fantasyPlayerTitleEnum().array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type InsertPlayerGamePerformance = typeof playerGamePerformancesTable.$inferInsert;

export const titlesTable = pgTable("titles", {
  id: uuid().primaryKey().defaultRandom(),
  title: fantasyPlayerTitleEnum().notNull(),
  modifier: numeric().notNull(),
  name: text().notNull(),
  description: text(),
  isSecondary: boolean("is_secondary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type FantasyPlayerTitleEnum = typeof fantasyPlayerTitleEnum.enumValues[number];

export const userTitlesTable = pgTable("user_titles", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  role: integer().notNull(),
  primaryTitleId: uuid("primary_title_id").references(() => titlesTable.id, { onDelete: "cascade" }).notNull(),
  secondaryTitleId: uuid("secondary_title_id").references(() => titlesTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
export type UserTitle = typeof userTitlesTable.$inferSelect;

export const bannerColorEnum = pgEnum("banner_color_enum", [
  "RED",
  "BLUE",
  "GREEN"
]);
export const bannerTypeEnum = pgEnum("banner_type_enum", [
  // RED
  "KILLS",
  "DEATHS",
  "LAST_HITS",
  "GPM",
  "MADSTONE_COUNT",
  "TOWER_KILLS",

  // BLUE
  "WARDS_PLACED",
  "CAMPS_STACKED",
  "RUNES_GRABBED",
  "WATCHERS_TAKEN",
  "SMOKES_USE",

  // GREEN
  "ROSHAN_KILLS",
  "TEAMFIGHT_PARTICIPATION",
  "STUN_TIME",
  "TORMENTOR_KILLS",
  "COURIER_KILLS",
  "FIRSTBLOOD_CLAIMED"
]);

export const bannersTable = pgTable("banners", {
  id: uuid().primaryKey().defaultRandom(),
  bannerType: bannerTypeEnum("banner_type").notNull(),
  name: text(),
  description: text(),
  bannerColor: bannerColorEnum("banner_color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type Banner = typeof bannersTable.$inferSelect;

export const userBannersTable = pgTable("user_banners", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  role: integer().notNull(),
  bannerTopId: uuid("banner_top_id").references(() => bannersTable.id, { onDelete: "cascade" }).notNull(),
  bannerTopMultiplier: numeric("banner_top_multiplier").notNull(),
  bannerMiddleId: uuid("banner_middle_id").references(() => bannersTable.id, { onDelete: "cascade" }).notNull(),
  bannerMiddleMultiplier: numeric("banner_middle_multiplier").notNull(),
  bannerBottomId: uuid("banner_bottom_id").references(() => bannersTable.id, { onDelete: "cascade" }).notNull(),
  bannerBottomMultiplier: numeric("banner_bottom_multiplier").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
export type UserBanner = typeof userBannersTable.$inferSelect;

export const userRostersTable = pgTable("user_rosters", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  carryPlayerId: uuid("carry_player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  midPlayerId: uuid("mid_player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  offlanePlayerId: uuid("offlane_player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  softSupportPlayerId: uuid("soft_support_player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  hardSupportPlayerId: uuid("hard_support_player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});