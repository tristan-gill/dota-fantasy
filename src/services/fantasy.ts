import { db } from "@/lib/db";
import { InsertPlayerMatchPerformance, matchesTable, playerMatchPerformancesTable, playersTable, userRolesTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { eq, inArray } from "drizzle-orm";
import { userRequiredMiddleware } from "@/services/auth";

// TODO add these
// const OpendotaMatchPlayerSchema = z.object({
//   account_id: z.number(),
//   kills: z.number(),
//   deaths: z.number(),
//   last_hits: z.number(),
//   gold_per_min: z.number(),

// })
// const OpendotaMatchSchema = z.object({
//   match_id: z.number(),
//   players: 
// });

const ProcessMatchByIdSchema = z.object({
  matchId: z.string().nonempty(),
  isPlayoff: z.boolean(),
});
export const processMatchById = createServerFn({ method: "POST" })
  .inputValidator(ProcessMatchByIdSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data: { matchId, isPlayoff }, context: { userSession } }) => {
    const userRoleResponse = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userSession.user.id));
    
    if (
      !userRoleResponse ||
      userRoleResponse.length < 1 ||
      userRoleResponse[0].role !== "ADMIN"
    ) {
      // TODO does this surface any information to the user?
      throw new Error("Unexpected request.");
    }

    const matchResponse = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
    if (matchResponse.status !== 200) {
      console.error(matchResponse.status);
      throw new Error("Unexpected response when getting match data.");
    }
    const match = await matchResponse.json();
    if (!match) {
      throw new Error("No match data found.");
    }

    const matchesResponse = await db
      .insert(matchesTable)
      .values({ steamId: matchId, isPlayoff })
      .returning({ id: matchesTable.id });
    if (!matchesResponse || matchesResponse.length < 1) {
      throw new Error("Unexpected response when saving match.");
    }
    const matchRecord = matchesResponse[0];

    const playerAccountIds: string[] = match.players.map((p: any) => p.account_id.toString());
    const playersResponse = await db
      .select()
      .from(playersTable)
      .where(inArray(playersTable.steamId, playerAccountIds));

    if (!playersResponse) {
      throw new Error("Unable to find players.");
    }

    for (const player of match.players) {
      const playerRecord = playersResponse.find((pr) => pr.steamId === player.account_id.toString());
      if (!playerRecord) {
        console.log(`Could not find playerRecord for ${player.account_id}`);
        continue;
      }

      await db
        .insert(playerMatchPerformancesTable)
        .values({
          playerId: playerRecord.id,
          matchId: matchRecord.id,
          kills: player.kills,
          deaths: player.deaths,
          lastHits: player.last_hits,
          gpm: player.gold_per_min,
          madstoneCount: player.item_uses?.madstone_bundle || 0,
          towerKills: player.tower_kills,
          wardsPlaced: player.obs_placed,
          campsStacked: player.camps_stacked,
          runesGrabbed: player.rune_pickups,
          watchersTaken: player.ability_uses?.ability_lamp_use || 0,
          lotusesGrabbed: 0, // TODO?
          roshanKills: player.roshans_killed,
          teamfightParticipation: player.teamfight_participation,
          stunTime: player.stuns,
          tormentorKills: player.killed?.npc_dota_miniboss || 0,
          courierKills: player.courier_kills,
          firstbloodClaimed: player.firstblood_claimed > 0,
          smokesUsed: player.item_uses?.smoke_of_deceit || 0
        } as InsertPlayerMatchPerformance);
    }
  });
