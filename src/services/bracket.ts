
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { InsertPrediction, predictionsTable, playoffMatchesTable, profilesTable, teamsTable, configsTable, usersTable } from "@/lib/db/schema";
import { userRequiredMiddleware } from "@/services/auth";

// TODO move to table based services
export const getPlayoffMatches = createServerFn({ method: "GET" })
  .handler(async () => {
    const playoffMatchesResponse = await db
      .select()
      .from(playoffMatchesTable);
    
    if (!playoffMatchesResponse || playoffMatchesResponse.length < 1) {
      throw new Error('Playoff games not found.');
    }
    return playoffMatchesResponse;
  });

export const getTeams = createServerFn({ method: "GET" })
  .handler(async () => {
    const teamsResponse = await db
      .select()
      .from(teamsTable);

    if (!teamsResponse || teamsResponse.length < 1) {
      throw new Error('Teams not found.');
    }

    return teamsResponse;
  });

const GetPredictionsByUserIdSchema = z.object({
  userId: z.string().nonempty()
});
export type GetPredictionsByUserId = z.infer<typeof GetPredictionsByUserIdSchema>
export const getPredictionsByUserId = createServerFn({ method: "GET" })
  .inputValidator(GetPredictionsByUserIdSchema)
  .handler(async ({ data: { userId } }) => {
    const predictionsResponse = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.userId, userId));

    return predictionsResponse;
  });

const SavePredictionSchema = z.object({
  playoffMatchId: z.string().nonempty(),
  teamIdLeft: z.string().nonempty(),
  teamIdRight: z.string().nonempty(),
  winnerId: z.string().nonempty()
});
export type SavePrediction = z.infer<typeof SavePredictionSchema>

const SavePredictionsSchema = z.object({
  predictions: z.array(SavePredictionSchema)
});
export type SavePredictions = z.infer<typeof SavePredictionsSchema>;

// TODO validate predictions length, disallow partials
export const savePredictions = createServerFn({ method: "POST" })
  .inputValidator(SavePredictionsSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data, context: { userSession } }) => {
    const configsResponse = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.name, "isAcceptingPredictions"))
      .limit(1);
    if (!configsResponse || configsResponse.length < 1) {
      throw new Error("Unable to find configs");
    }

    if (!configsResponse[0].enabled) {
      // TODO how does this look on the client side
      throw new Error("Predictions are closed!");
    }

    const predictions: InsertPrediction[] = data.predictions.map((p) => {
      return {
        playoffMatchId: p.playoffMatchId,
        userId: userSession.user.id,
        teamIdLeft: p.teamIdLeft,
        teamIdRight: p.teamIdRight,
        winnerId: p.winnerId
      };
    })
    // delete old predictions
    await db
      .delete(predictionsTable)
      .where(eq(predictionsTable.userId, userSession.user.id));

    // save new predictions
    await db
      .insert(predictionsTable)
      .values(predictions);
  });

// TODO validate this works
export const getPredictionActivity = createServerFn({ method: "GET"})
  .handler(async () => {
    const predictionActivityResponse = await db
      .select({
        userId: profilesTable.userId,
        slug: profilesTable.slug,
        name: profilesTable.name,
        teamName: teamsTable.name,
        teamImage: teamsTable.image,
        createdAt: predictionsTable.createdAt
      })
      .from(predictionsTable)
      .innerJoin(playoffMatchesTable, eq(playoffMatchesTable.id, predictionsTable.playoffMatchId))
      .innerJoin(profilesTable, eq(predictionsTable.userId, profilesTable.userId))
      .innerJoin(teamsTable, eq(teamsTable.id, predictionsTable.winnerId))
      .where(eq(playoffMatchesTable.round, 8)) // GRAND_FINALS_ROUND
      .limit(25);
    return predictionActivityResponse;
  });
