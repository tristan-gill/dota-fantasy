
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { playoffGamePredictionsTable, playoffGamesTable, teamsTable } from "@/lib/db/schema";

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

const GetPlayoffGamesPredictionsByProfileIdSchema = z.object({
  profileId: z.string().nonempty()
});
// export type GetPlayoffGamesPredictionsByProfileId = z.infer<typeof GetPlayoffGamesPredictionsByProfileIdSchema>
export const getPlayoffGamesPredictionsByProfileId = createServerFn({ method: "GET" })
  .inputValidator(GetPlayoffGamesPredictionsByProfileIdSchema)
  .handler(async ({ data: { profileId } }) => {
    const playoffGamePredictionsResponse = await db
      .select()
      .from(playoffGamePredictionsTable)
      .where(eq(playoffGamePredictionsTable.profileId, profileId));

    return playoffGamePredictionsResponse;
  });