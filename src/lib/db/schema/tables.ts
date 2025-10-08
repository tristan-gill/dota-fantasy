import { boolean, index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// export type Player = typeof players.$inferSelect;

export const playoffGamesTable = pgTable("playoff_games", {
  id: uuid().primaryKey().defaultRandom(),
  round: integer().notNull(),
  sequence: integer().notNull(),
  teamIdLeft: uuid("team_id_left"),
  teamIdRight: uuid("team_id_right"),
  winnerId: uuid("winner_id"),
  isUpper: boolean("is_upper").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// export interface PlayoffGameTabletidk = typeof playoffGames.$inferSelect;
export type PlayoffGame = typeof playoffGamesTable.$inferSelect;

export const predictionsTable = pgTable("predictions", {
  id: uuid().primaryKey().defaultRandom(),
  playoffGameId: uuid("playoff_game_id").references(() => playoffGamesTable.id, { onDelete: "cascade" }),
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
])
export const configsTable = pgTable("configs", {
  id: uuid().primaryKey().defaultRandom(),
  name: configNameEnum().notNull(),
  enabled: boolean(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchesTable = pgTable("matches", {
  id: uuid().primaryKey().defaultRandom(),
  steamId: text("steam_id").notNull(),
  isPlayoff: boolean("is_playoff").default(false),
});

export const playerMatchPerformancesTable = pgTable("player_match_performance", {
  id: uuid().primaryKey().defaultRandom(),
  playerId: uuid("player_id").references(() => playersTable.id, { onDelete: "cascade" }),
  matchId: uuid("match_id").references(() => matchesTable.id, { onDelete: "cascade" }),
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
  lotusesGrabbed: integer("lotuses_grabbed"),
  roshanKills: integer("roshan_kills"),
  teamfightParticipation: numeric("teamfight_participation"),
  stunTime: numeric("stun_time"),
  tormentorKills: integer("tormentor_kills"),
  courierKills: integer("courier_kills"),
  firstbloodClaimed: boolean("firstblood_claimed"),
  smokesUsed: integer("smokes_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type InsertPlayerMatchPerformance = typeof playerMatchPerformancesTable.$inferInsert;