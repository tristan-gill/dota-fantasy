import { db } from "@/lib/db";
import { playoffMatchesTable, predictionsTable, profilesTable, teamsTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";

const GetFinalsPredictionByUserIdSchema = z.object({
  userId: z.string().nonempty()
});
export const getFinalsPredictionByUserId = createServerFn({ method: "GET" })
  .inputValidator(GetFinalsPredictionByUserIdSchema)
  .handler(async ({ data: { userId } }) => {
    const leftTeam = alias(teamsTable, "leftTeam");
    const rightTeam = alias(teamsTable, "rightTeam");
    
    const predictionsResponse = await db
      .select()
      .from(predictionsTable)
      .innerJoin(playoffMatchesTable, eq(playoffMatchesTable.id, predictionsTable.playoffMatchId))
      .innerJoin(leftTeam, eq(leftTeam.id, predictionsTable.teamIdLeft))
      .innerJoin(rightTeam, eq(rightTeam.id, predictionsTable.teamIdRight))
      .where(
        and(
          eq(predictionsTable.userId, userId),
          eq(playoffMatchesTable.round, 8)
        )
      );

    return predictionsResponse?.[0];
  });

export const getLeaderboardPredictions = createServerFn({ method: "GET" })
  .handler(async () => {
    const predictionsResponse = await db
      .select({
        userId: predictionsTable.userId,
        count: count(predictionsTable.userId),
        slug: profilesTable.slug,
        name: profilesTable.name
      })
      .from(playoffMatchesTable)
      .leftJoin(predictionsTable, eq(predictionsTable.playoffMatchId, playoffMatchesTable.id))
      .leftJoin(profilesTable, eq(profilesTable.userId, predictionsTable.userId))
      .where(eq(playoffMatchesTable.winnerId, predictionsTable.winnerId))
      .groupBy(predictionsTable.userId, profilesTable.slug, profilesTable.name);

    return predictionsResponse;
  });