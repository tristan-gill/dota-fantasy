
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { InsertPrediction, predictionsTable, playoffGamesTable, profilesTable, teamsTable } from "@/lib/db/schema";
import { userRequiredMiddleware } from "@/services/auth";

export const getPlayoffGames = createServerFn({ method: "GET" })
  .handler(async () => {
    const playoffGamesResponse = await db
      .select()
      .from(playoffGamesTable);
    
    if (!playoffGamesResponse || playoffGamesResponse.length < 1) {
      throw new Error('Playoff games not found.');
    }
    return playoffGamesResponse;
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

const GetPredictionsByProfileIdSchema = z.object({
  profileId: z.string().nonempty()
});
export type GetPredictionsByProfileId = z.infer<typeof GetPredictionsByProfileIdSchema>
export const getPredictionsByProfileId = createServerFn({ method: "GET" })
  .inputValidator(GetPredictionsByProfileIdSchema)
  .handler(async ({ data: { profileId } }) => {
    const predictionsResponse = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.profileId, profileId));

    return predictionsResponse;
  });

const SavePredictionSchema = z.object({
  playoffGameId: z.string().nonempty(),
  teamIdLeft: z.string().nonempty(),
  teamIdRight: z.string().nonempty(),
  winnerId: z.string().nonempty()
});
export type SavePrediction = z.infer<typeof SavePredictionSchema>

const SavePredictionsSchema = z.object({
  predictions: z.array(SavePredictionSchema)
});
export type SavePredictions = z.infer<typeof SavePredictionsSchema>;

export const savePredictions = createServerFn({ method: "POST" })
  .inputValidator(SavePredictionsSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data, context: { userSession } }) => {
    const profilesResponse = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userSession.user.id))
      .limit(1);
    if (!profilesResponse || profilesResponse.length < 1) {
      throw new Error("Can't save predictions without being logged in.");
    }

    const profile = profilesResponse[0];
    const predictions: InsertPrediction[] = data.predictions.map((p) => {
      return {
        playoffGameId: p.playoffGameId,
        profileId: profile.id,
        teamIdLeft: p.teamIdLeft,
        teamIdRight: p.teamIdRight,
        winnerId: p.winnerId
      };
    })
    // delete old predictions
    await db
      .delete(predictionsTable)
      .where(eq(predictionsTable.profileId, profile.id));

    // save new predictions
    await db
      .insert(predictionsTable)
      .values(predictions);
  });
