import { db } from "@/lib/db";
import { FantasyPlayerTitleEnum, InsertPlayerGamePerformance, gamesTable, playerGamePerformancesTable, playersTable, userRolesTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { eq, inArray } from "drizzle-orm";
import { userRequiredMiddleware } from "@/services/auth";
import heroesJson from "../../public/heroes.json" with { type: "json" };
import activeItems from "../../public/active_items.json" with { type: "json" };

const ProcessSeriesSchema = z.object({
  playoffMatchId: z.string().nullable(),
  gameIds: z.array(z.string().nonempty()),
});
export const processSeries = createServerFn({ method: "POST" })
  .inputValidator(ProcessSeriesSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data: { gameIds, playoffMatchId }, context: { userSession } }) => {
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

    for (const gameId of gameIds) {
      const gameResponse = await fetch(`https://api.opendota.com/api/matches/${gameId}`);
      if (gameResponse.status !== 200) {
        console.error(gameResponse.status);
        throw new Error("Unexpected response when getting game data.");
      }

      // TODO add type
      const game = await gameResponse.json();
      if (!game) {
        throw new Error("No game data found.");
      }

      const gamesResponse = await db
        .insert(gamesTable)
        .values({
          gameId,
          playoffMatchId: playoffMatchId || null
        })
        .returning({ id: gamesTable.id });
      if (!gamesResponse || gamesResponse.length < 1) {
        throw new Error("Unexpected response when saving match.");
      }
      const gameRecord = gamesResponse[0];

      const playerAccountIds: string[] = game.players.map((p: any) => p.account_id.toString());
      const playersResponse = await db
        .select()
        .from(playersTable)
        .where(inArray(playersTable.steamId, playerAccountIds));

      if (!playersResponse) {
        throw new Error("Unable to find players.");
      }

      // calculate aggregate stats for titles

      let maxChatwheels = -1;
      const chatwheelFrequencyMap = new Map();
      if (!!game.chat && game.chat.length > 0) {
        for (const chatEvent of game.chat) {
          if (chatEvent.type === "chatwheel") {
            if (chatwheelFrequencyMap.has(chatEvent.player_slot)) {
              chatwheelFrequencyMap.set(chatEvent.player_slot, chatwheelFrequencyMap.get(chatEvent.player_slot) + 1);
            } else {
              chatwheelFrequencyMap.set(chatEvent.player_slot, 1);
            }
          }
        }

        for (const chatwheelFrequency of chatwheelFrequencyMap.values()) {
          if (chatwheelFrequency > maxChatwheels) {
            maxChatwheels = chatwheelFrequency;
          }
        }
      }

      // TODO need to validate all the titles are accurate
      let maxAssists = 0;
      let maxDeaths = 0;
      let minNetworth = Infinity;
      for (const player of game.players) {
        if (player.net_worth < minNetworth) {
          minNetworth = player.net_worth;
        }
        if (player.deaths > maxDeaths) {
          maxDeaths = player.deaths;
        }
        if (player.assists > maxAssists) {
          maxAssists = player.assists;
        }
      }

      for (const player of game.players) {
        const playerRecord = playersResponse.find((pr) => pr.steamId === player.account_id.toString());
        if (!playerRecord) {
          console.log(`Could not find playerRecord for ${player.account_id}`);
          continue;
        }

        // applicable titles
        const titles: FantasyPlayerTitleEnum[] = [];

        if (!heroesJson.hasOwnProperty(player.hero_id.toString())) {
          throw new Error(`Missing hero ${player.hero_id}`);
        }
        // TODO idk how to type this shit
        // @ts-ignore
        const hero = heroesJson[player.hero_id.toString()];
        if (hero.attr === "str") titles.push("BRAWNY");
        if (hero.attr === "agi") titles.push("DASHING");
        if (hero.attr === "int") titles.push("CANNY");
        if (hero.attr === "uni") titles.push("BALANCED");
        if (hero.green) titles.push("EMERALD");
        if (hero.blue) titles.push("CERULEAN");
        if (hero.red) titles.push("CRIMSON");
        if (hero.otherworld) titles.push("OTHERWORLDLY");
        if (hero.beast) titles.push("BESTIAL");
        if (hero.hirsute) titles.push("HIRSUTE");
        if (hero.elemental) titles.push("ELEMENTAL");

        // TODO more types
        const pick = (game.picks_bans || []).find((pb: any) => pb.hero_id === player.hero_id);
        if (!pick) {
          console.log(game.picks_bans, player.hero_id)
          throw new Error(`Missing draft timing for player ${player.account_id} hero ${player.hero_id}`)
        }
        if (pick.order < 10) titles.push("SACRIFICIAL");
        if (pick.order > 22) titles.push("COVETED");
        if ((player.cosmetics || []).some((c: any) => c.item_rarity === "arcana")) titles.push("GLAMOROUS");
        if (player.kills === 0) titles.push("PACIFICST");
        if (player.net_worth === minNetworth) titles.push("ANT");
        if (player.buyback_log && player.buyback_log[0]?.time < 1800) titles.push("BULL");
        if (player.deaths === maxDeaths) titles.push("PILGRIM");

        let activeItemsCount = 0;
        for (let i = 1; i <= 6; i++) {
          const key = `item_${i}`;
          if (player[key] && activeItems.includes(player[key])) {
            activeItemsCount++;
          }
        }
        if (activeItemsCount >= 4) titles.push("OCTOPUS");
        if (player.assists === maxAssists) titles.push("ACCOMPLICE");
        if (player.item_0 && player.item_1 && player.item_2 && player.item_3 && player.item_4 && player.item_5 && player.backpack_0 && player.backpack_1 && player.backpack_2) {
          titles.push("MULE");
        }
        if (player.lose === 1) titles.push("UNDERDOG");
        if (chatwheelFrequencyMap.has(player.player_slot) && chatwheelFrequencyMap.get(player.player_slot) === maxChatwheels) {
          titles.push("LOQUACIOUS");
        }
        if (player.killed_by && player.killed_by.npc_dota_miniboss === 1) titles.push("TORMENTED");
        if (game.first_blood_time >= 600) titles.push("PATIENT");
        if (game.first_blood_time <= 0) titles.push("ACOLYTE");
        if (game.duration <= 1500) titles.push("DECISIVE");

        await db
          .insert(playerGamePerformancesTable)
          .values({
            playerId: playerRecord.id,
            gameId: gameRecord.id,
            heroId: player.hero_id,
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
            smokesUsed: player.item_uses?.smoke_of_deceit || 0,
            titles,
          } as InsertPlayerGamePerformance);
      }
    }
  });
