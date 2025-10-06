import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

export const profilesTable = pgTable("profiles", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  slug: text().unique().notNull(),
  description: text(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("slug_idx").on(table.slug)
]);
// export type Profile = typeof profiles.$inferSelect;

export const teamsTable = pgTable("teams", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  image: text(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
export type Team = typeof teamsTable.$inferSelect;

export const playersTable = pgTable("players", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  steamId: text("steam_id").unique().notNull(),
  teamId: uuid("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
  position: integer().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
// export interface PlayoffGameTabletidk = typeof playoffGames.$inferSelect;
export type PlayoffGame = typeof playoffGamesTable.$inferSelect;

export const predictionsTable = pgTable("predictions", {
  id: uuid().primaryKey().defaultRandom(),
  playoffGameId: uuid("playoff_game_id").references(() => playoffGamesTable.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  teamIdLeft: uuid("team_id_left"),
  teamIdRight: uuid("team_id_right"),
  winnerId: uuid("winner_id"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
export type InsertPrediction = typeof predictionsTable.$inferInsert;
export type Prediction = typeof predictionsTable.$inferSelect;