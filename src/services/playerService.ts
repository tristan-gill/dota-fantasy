import { db } from "@/lib/db";
import { playerGamePerformancesTable, playersTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { BASE_SCORE_MULTIPLIERS } from "@/services/rosterService";

export const getTopPlayersLeaderboard = createServerFn({ method: "GET"})
  .handler(async () => {
    const userRosterScoresResponse = await db
      .select({
        totalScore: sql<number>`MAX(
          ${playerGamePerformancesTable.kills} * ${BASE_SCORE_MULTIPLIERS.KILLS} +
          GREATEST(1800 - (${playerGamePerformancesTable.deaths} * ${BASE_SCORE_MULTIPLIERS.DEATHS}), 0) +
          ${playerGamePerformancesTable.lastHits} * ${BASE_SCORE_MULTIPLIERS.LAST_HITS} +
          ${playerGamePerformancesTable.gpm} * ${BASE_SCORE_MULTIPLIERS.GPM} +
          ${playerGamePerformancesTable.madstoneCount} * ${BASE_SCORE_MULTIPLIERS.MADSTONE_COUNT} +
          ${playerGamePerformancesTable.towerKills} * ${BASE_SCORE_MULTIPLIERS.TOWER_KILLS} +
          ${playerGamePerformancesTable.wardsPlaced} * ${BASE_SCORE_MULTIPLIERS.WARDS_PLACED} +
          ${playerGamePerformancesTable.campsStacked} * ${BASE_SCORE_MULTIPLIERS.CAMPS_STACKED} +
          ${playerGamePerformancesTable.runesGrabbed} * ${BASE_SCORE_MULTIPLIERS.RUNES_GRABBED} +
          ${playerGamePerformancesTable.watchersTaken} * ${BASE_SCORE_MULTIPLIERS.WATCHERS_TAKEN} +
          ${playerGamePerformancesTable.roshanKills} * ${BASE_SCORE_MULTIPLIERS.ROSHAN_KILLS} +
          ${playerGamePerformancesTable.smokesUsed} * ${BASE_SCORE_MULTIPLIERS.SMOKES_USE} +
          ${playerGamePerformancesTable.teamfightParticipation} * ${BASE_SCORE_MULTIPLIERS.TEAMFIGHT_PARTICIPATION} +
          ${playerGamePerformancesTable.stunTime} * ${BASE_SCORE_MULTIPLIERS.STUN_TIME} +
          ${playerGamePerformancesTable.tormentorKills} * ${BASE_SCORE_MULTIPLIERS.TORMENTOR_KILLS} +
          ${playerGamePerformancesTable.courierKills} * ${BASE_SCORE_MULTIPLIERS.COURIER_KILLS} +
          case when ${playerGamePerformancesTable.firstbloodClaimed} then ${BASE_SCORE_MULTIPLIERS.FIRSTBLOOD_CLAIMED} else 0 end
        ) as totalScore`,
        name: playersTable.name,
        position: playersTable.position,
        image: playersTable.image
      })
      .from(playersTable)
      .innerJoin(playerGamePerformancesTable, eq(playerGamePerformancesTable.playerId, playersTable.id))
      .groupBy(playersTable.name, playersTable.position, playersTable.image)
      .orderBy(sql`totalScore DESC`);

    return userRosterScoresResponse;
  });
