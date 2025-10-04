
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { playoffGamePredictions, playoffGames, teams } from "@/lib/db/schema";

export const getPlayoffGames = createServerFn({ method: "GET" })
  .handler(async () => {
    const playoffGamesResponse = await db
      .select()
      .from(playoffGames);
    
    if (!playoffGamesResponse || playoffGamesResponse.length < 1) {
      throw new Error('Playoff games not found.');
    }
    return playoffGamesResponse;
  });

export const getTeams = createServerFn({ method: "GET" })
  .handler(async () => {
    const teamsResponse = await db
      .select()
      .from(teams);

    if (!teamsResponse || teamsResponse.length < 1) {
      throw new Error('Teams not found.');
    }

    return teamsResponse;
  });

const GetPlayoffGamesPredictionsByProfileIdSchema = z.object({
  profileId: z.uuid().nonempty()
});
export const getPlayoffGamesPredictionsByProfileId = createServerFn({ method: "GET" })
  .inputValidator(GetPlayoffGamesPredictionsByProfileIdSchema)
  .handler(async ({ data: { profileId } }) => {
    const playoffGamePredictionsResponse = await db
      .select()
      .from(playoffGamePredictions)
      .where(eq(playoffGamePredictions.profileId, profileId));

    return playoffGamePredictionsResponse;
  });