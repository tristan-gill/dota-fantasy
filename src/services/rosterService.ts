import { createServerFn } from "@tanstack/react-start";
import { and, eq, or, isNull } from "drizzle-orm";
import z from "zod";

import { db } from "@/lib/db";
import { playersTable, teamsTable, userBannersTable, userRostersTable, userTitlesTable } from "@/lib/db/schema";

const GetUserRosterSchema = z.object({
  userId: z.string().nonempty()
});
// export type GetPredictionsByUserId = z.infer<typeof GetPredictionsByUserIdSchema>;
export const getUserRoster = createServerFn({ method: "GET" })
  .inputValidator(GetUserRosterSchema)
  .handler(async ({ data: { userId } }) => {
    const userRosterResponse = await db
      .select()
      .from(userRostersTable)
      .leftJoin(playersTable, or(
        eq(playersTable.id, userRostersTable.carryPlayerId),
        eq(playersTable.id, userRostersTable.midPlayerId),
        eq(playersTable.id, userRostersTable.offlanePlayerId),
        eq(playersTable.id, userRostersTable.softSupportPlayerId),
        eq(playersTable.id, userRostersTable.hardSupportPlayerId)
      ))
      .leftJoin(userBannersTable, and(
        eq(userBannersTable.userId, userId),
        isNull(userBannersTable.deletedAt)
      ))
      .leftJoin(userTitlesTable, and(
        eq(userTitlesTable.userId, userId),
        isNull(userTitlesTable.deletedAt)
      ))
      .where(eq(userRostersTable.userId, userId));

    return userRosterResponse;
  });

export const getPlayerTeams = createServerFn({ method: "GET" })
  .handler(async () => {
    const playerTeams = await db
      .select({
        playerId: playersTable.id,
        playerName: playersTable.name,
        playerImage: playersTable.image,
        playerPosition: playersTable.position,
        teamId: teamsTable.id,
        teamName: teamsTable.name,
        teamImage: teamsTable.image
      })
      .from(playersTable)
      .leftJoin(teamsTable, eq(playersTable.teamId, teamsTable.id));
    
    return playerTeams;
  });