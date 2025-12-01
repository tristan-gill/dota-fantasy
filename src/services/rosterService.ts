import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/lib/db";
import { Banner, bannersTable, BannerType, configsTable, FantasyPlayerTitleEnum, gamesTable, PlayerGamePerformance, playerGamePerformancesTable, playersTable, profilesTable, teamsTable, Title, titlesTable, UserBanner, userBannersTable, userRolesTable, userRosterScoresTable, userRostersTable, UserTitle, userTitlesTable } from "@/lib/db/schema";
import { userRequiredMiddleware } from "@/services/auth";
import { alias } from "drizzle-orm/pg-core";

const NUM_TITLE_ROLLS = process.env.NUM_TITLE_ROLLS ? Number(process.env.NUM_TITLE_ROLLS) : 10;
const NUM_BANNER_ROLLS = process.env.NUM_BANNER_ROLLS ? Number(process.env.NUM_BANNER_ROLLS) : 10;

const GetUserRosterSchema = z.object({
  userId: z.string().nonempty()
});
export const getUserRoster = createServerFn({ method: "GET" })
  .inputValidator(GetUserRosterSchema)
  .handler(async ({ data: { userId } }) => {
    const userRostersResponse = await db
      .select()
      .from(userRostersTable)
      .where(eq(userRostersTable.userId, userId));
    
    if (!userRostersResponse || userRostersResponse.length < 1) {
      return;
    }
    
    return userRostersResponse[0];
  });

const GetUserRosterPlayersSchema = z.object({
  userId: z.string().nonempty()
});
export const getUserRosterPlayers = createServerFn({ method: "GET" })
  .inputValidator(GetUserRosterPlayersSchema)
  .handler(async ({ data: { userId } }) => {
    const carryPlayer = alias(playersTable, "carryPlayer");
    const midPlayer = alias(playersTable, "midPlayer");
    const offlanePlayer = alias(playersTable, "offlanePlayer");
    const softSupportPlayer = alias(playersTable, "softSupportPlayer");
    const hardSupportPlayer = alias(playersTable, "hardSupportPlayer");
    
    const userRostersResponse = await db
      .select()
      .from(userRostersTable)
      .leftJoin(carryPlayer, eq(carryPlayer.id, userRostersTable.carryPlayerId))
      .leftJoin(midPlayer, eq(midPlayer.id, userRostersTable.midPlayerId))
      .leftJoin(offlanePlayer, eq(offlanePlayer.id, userRostersTable.offlanePlayerId))
      .leftJoin(softSupportPlayer, eq(softSupportPlayer.id, userRostersTable.softSupportPlayerId))
      .leftJoin(hardSupportPlayer, eq(hardSupportPlayer.id, userRostersTable.hardSupportPlayerId))
      .where(eq(userRostersTable.userId, userId));
    
    if (!userRostersResponse || userRostersResponse.length < 1) {
      return;
    }
    
    return userRostersResponse[0];
  });

const GetUserTitlesSchema = z.object({
  userId: z.string().nonempty()
});
export const getUserTitles = createServerFn({ method: "GET" })
  .inputValidator(GetUserTitlesSchema)
  .handler(async ({ data: { userId } }) => {
    const userTitlesResponse = await db
      .select()
      .from(userTitlesTable)
      .where(
        and(
          eq(userTitlesTable.userId, userId),
          isNull(userTitlesTable.deletedAt)
        )
      );

    return userTitlesResponse;
  });

const GetUserBannersSchema = z.object({
  userId: z.string().nonempty()
});
export const getUserBanners = createServerFn({ method: "GET" })
  .inputValidator(GetUserBannersSchema)
  .handler(async ({ data: { userId } }) => {
    const userBannersResponse = await db
      .select()
      .from(userBannersTable)
      .where(
        and(
          eq(userBannersTable.userId, userId),
          isNull(userBannersTable.deletedAt)
        )
      );

    return userBannersResponse;
  });

export interface PlayerTeam {
  playerId: string;
  playerName: string;
  playerImage: string | null;
  playerPosition: number;
  teamId: string | null;
  teamName: string | null;
  teamImage: string | null;
}
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

export const getBanners = createServerFn({ method: "GET" })
  .handler(async () => {
    const banners = await db
      .select()
      .from(bannersTable);
    
    return banners;
  });

export const getTitles = createServerFn({ method: "GET" })
  .handler(async () => {
    const titles = await db
      .select()
      .from(titlesTable);
    
    return titles;
  });

const getRandomTitleId = (isSecondary: boolean) => {
  const primaryTitles = [
    "1826b0fb-9601-439a-b053-792c6d15b099", // Brawny
    "19a53e54-33a5-47f7-b02e-996d5d67fce4", // Dashing
    "361e0a8c-70d9-4273-9558-abb946470c46", // Canny
    "d0bdc502-7a30-4fc2-80b6-df2aaf609330", // Balanced
    "c0d9be9d-684e-4c8a-bcc6-0f88ca023f76", // Emerald
    "3ddf7791-2125-4404-b1ce-491ecd1669d9", // Cerulean
    "de1eb940-04f4-4027-abed-4a0cffcd0ce5", // Crimson
    "3c903f1e-96eb-4926-be72-58448ef4225f", // Otherworldly
    "5ac36537-ca77-494e-bdd4-b28640aecd59", // Bestial
    "f8e8445c-4138-4c8d-9bdf-3509799e7a00", // Hirsute
    "85a0d03b-6d80-49b6-83bb-c64f75a763f7", // Elemental
    "e526907b-b588-4b09-a3c2-ab19e6547915", // Sacrificial
    "2ee77f89-38c1-46c8-bf09-fab4c5045a8c", // Coveted
    "2c39ca8f-9c28-4191-bb83-ffdc26be538d", // Glamorous
  ];
  const secondaryTitles = [
    "2def306f-6963-4e28-934b-2a75c36fcec7", // Pacifist
    "6b622378-2b5d-4159-b122-bcc8356a5451", // Ant
    "334b208f-dd12-425f-ade8-ac9ce08f9c7a", // Bull
    "f1d3065d-8095-4556-84e3-bddcea45a46f", // Pilgrim
    "ee7b2579-b6da-42cc-80fd-95fa4e40db5a", // Octopus
    "f79fbd2d-1130-4456-89af-4f6a9ea0496f", // Accomplice
    "11b2a3ce-d51c-40a2-bf42-d24b5558b222", // Mule
    "03a5b80f-7632-43ed-a7f9-1cf433849ccb", // Underdog
    "d6a1b59a-8b26-4847-baba-a3fbe9cf6393", // Loquacious
    "18b48887-a576-427b-a62c-bf5ccbbe0743", // Tormented
    "e5205499-040d-4273-8d4c-60401e1f9dc8", // Patient
    "d5dc99a1-ea3c-4ea7-8eac-df36d87a43b4", // Acolyte
    "58e61817-5b4e-488e-abc6-ee0233b2f53b", // Decisive
  ];

  if (isSecondary) {
    return secondaryTitles[Math.floor(Math.random() * secondaryTitles.length)];
  }

  return primaryTitles[Math.floor(Math.random() * primaryTitles.length)];
};

const generateUserBanner = (role: number) => {
  const redBannerIds = [
    "a4859905-7943-4fe5-9add-934813395761", // Kills
    "45892e07-c07a-44fe-95ee-18a304f5bf57", // Deaths
    "05aa96c9-bb59-48d3-9cad-0bf6ffc67b5e", // Last hits
    "997a3bc0-a763-412c-b455-d889156dec47", // GPM
    "d4f5f847-5622-4155-9a4f-27ae6514a93c", // Madstones collected
    "afab0b50-0e1d-4919-915a-afd8d31f2f75", // Towers killed
  ];
  const blueBannerIds = [
    "b28938e1-8438-41ec-b86a-d8f50f745f96", // Wards placed
    "83fdf6f5-1cf1-4172-a581-73b11520f953", // Camps stacked
    "7df5989c-6f4c-4b2c-b2c2-f17ce3e5931b", // Runes grabbed
    "4ca25d9f-9d65-4bf7-9404-03bde6eef8c1", // Watchers taken
    "73789d46-f06c-4ccb-82c2-75e6eb1e17d3", // Smokes used
  ];
  const greenBannerIds = [
    "2fe15c80-d18b-47a1-ac6b-62d682dab7de", // Teamfight participation
    "d6d65ca1-7fb3-4245-aef2-bfd3f0ab9991", // Stun duration
    "7fd909aa-0092-46d9-a8e1-e490195c6d89", // Tormentor kills
    "c67e00f8-f850-4d78-8bdd-3cf4e11c9749", // Courier kills
    "44766940-1a51-4030-9c4c-0e89fde9897e", // First blood
    "48218f0d-354c-43f0-bc78-4c6bfd6c4ebd", // Roshan kills
  ];

  const bannerIds = [];
  if ([1, 3].includes(role)) {
    let redBannerIdsCopy = [...redBannerIds];
    const randomIndex = Math.floor(Math.random() * redBannerIdsCopy.length);
    const firstBannerId = redBannerIdsCopy[randomIndex];
    redBannerIdsCopy.splice(randomIndex, 1);

    bannerIds.push(firstBannerId);
    bannerIds.push(greenBannerIds[Math.floor(Math.random() * greenBannerIds.length)]);
    bannerIds.push(redBannerIdsCopy[Math.floor(Math.random() * redBannerIdsCopy.length)]);
  }
  if ([4,5].includes(role)) {
    let blueBannerIdsCopy = [...blueBannerIds];
    const randomIndex = Math.floor(Math.random() * blueBannerIdsCopy.length);
    const firstBannerId = blueBannerIdsCopy[randomIndex];
    blueBannerIdsCopy.splice(randomIndex, 1);

    bannerIds.push(firstBannerId);
    bannerIds.push(greenBannerIds[Math.floor(Math.random() * greenBannerIds.length)]);
    bannerIds.push(blueBannerIdsCopy[Math.floor(Math.random() * blueBannerIdsCopy.length)]);
  }
  if (role === 2) {
    bannerIds.push(redBannerIds[Math.floor(Math.random() * redBannerIds.length)]);
    bannerIds.push(blueBannerIds[Math.floor(Math.random() * blueBannerIds.length)]);
    bannerIds.push(greenBannerIds[Math.floor(Math.random() * greenBannerIds.length)]);
  }

  const rollForModifier = () => {
    const tierModifiers = [1.1,  1.3,  1.6,  2,   2.5];
    const tierOdds =      [0.45, 0.7, 0.85, 0.95, 1];

    const randomValue = Math.random();
    for (let i = 0; i < 5; i++) {
      if (randomValue <= tierOdds[i]) {
        return {
          tier: i + 1,
          modifier: tierModifiers[i]
        };
      }
    }

    // shouldnt get here
    return {
      tier: 1,
      modifier: tierModifiers[1]
    };
  };
  
  const rollForModifiers = () => {
    for (let i = 0; i < 10; i++) {
      const modifiers = [rollForModifier(), rollForModifier(), rollForModifier()];
      if (modifiers.some((m) => m.tier > 1)) {
        return modifiers;
      }
    }

    return [rollForModifier(), rollForModifier(), rollForModifier()];
  };

  const modifiers = rollForModifiers();

  return {
    bannerTopId: bannerIds[0],
    bannerTopMultiplier: modifiers[0].modifier,
    bannerMiddleId: bannerIds[1],
    bannerMiddleMultiplier: modifiers[1].modifier,
    bannerBottomId: bannerIds[2],
    bannerBottomMultiplier: modifiers[2].modifier
  };
};

const SaveRosterPlayerSchema = z.object({
  carryPlayerId: z.string().optional(),
  midPlayerId: z.string().optional(),
  offlanePlayerId: z.string().optional(),
  softSupportPlayerId: z.string().optional(),
  hardSupportPlayerId: z.string().optional(),
});
export const saveRosterPlayer = createServerFn({ method: "POST" })
  .inputValidator(SaveRosterPlayerSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data, context: { userSession } }) => {
    const configsResponse = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.name, "IS_ROSTER_OPEN"))
      .limit(1);
    
    if (!configsResponse || configsResponse.length < 1) {
      throw new Error("Unable to find configs");
    }

    if (!configsResponse[0].enabled) {
      // TODO how does this look on the client side
      throw new Error("Rosters are closed!");
    }
    
    const userRostersResponse = await db
      .select()
      .from(userRostersTable)
      .where(eq(userRostersTable.userId, userSession.user.id));
    
    if (!userRostersResponse || userRostersResponse.length < 1) {
      throw new Error(`User missing roster ${userSession.user.id}`);
    }

    const userRoster = userRostersResponse[0];
    
    let role = 1;
    if (data.midPlayerId) role = 2;
    if (data.offlanePlayerId) role = 3;
    if (data.softSupportPlayerId) role = 4;
    if (data.hardSupportPlayerId) role = 5;

    // if first time saving need to generate title and banner
    if (
      (data.carryPlayerId && !userRoster.carryPlayerId) ||
      (data.midPlayerId && !userRoster.midPlayerId) ||
      (data.offlanePlayerId && !userRoster.offlanePlayerId) ||
      (data.softSupportPlayerId && !userRoster.softSupportPlayerId) ||
      (data.hardSupportPlayerId && !userRoster.hardSupportPlayerId)
    ) {
      await db
        .insert(userTitlesTable).values({
          userId: userSession.user.id,
          role,
          primaryTitleId: getRandomTitleId(false),
          secondaryTitleId: getRandomTitleId(true),
        });
      
      const bannerData = generateUserBanner(role);
      await db
        .insert(userBannersTable)
        .values({
          userId: userSession.user.id,
          role,
          bannerTopId: bannerData.bannerTopId,
          bannerTopMultiplier: bannerData.bannerTopMultiplier,
          bannerMiddleId: bannerData.bannerMiddleId,
          bannerMiddleMultiplier: bannerData.bannerMiddleMultiplier,
          bannerBottomId: bannerData.bannerBottomId,
          bannerBottomMultiplier: bannerData.bannerBottomMultiplier
        });
    }
    
    await db
      .update(userRostersTable)
      .set({
        ...(role === 1 && { carryPlayerId: data.carryPlayerId }),
        ...(role === 2 && { midPlayerId: data.midPlayerId }),
        ...(role === 3 && { offlanePlayerId: data.offlanePlayerId }),
        ...(role === 4 && { softSupportPlayerId: data.softSupportPlayerId }),
        ...(role === 5 && { hardSupportPlayerId: data.hardSupportPlayerId }),
        updatedAt: sql`NOW()`
      })
      .where(eq(userRostersTable.userId, userSession.user.id));
  });

const GetRosterRollsSchema = z.object({
  userId: z.string().nonempty()
});
export const getRosterRolls = createServerFn({ method: "GET" })
  .inputValidator(GetRosterRollsSchema)
  .handler(async ({ data: { userId }}) => {
    const deletedUserTitlesResponse = await db
      .select({ count: count(userTitlesTable.id)})
      .from(userTitlesTable)
      .where(
        and(
          eq(userTitlesTable.userId, userId),
          isNotNull(userTitlesTable.deletedAt)
        )
      );
    
    if (!deletedUserTitlesResponse || deletedUserTitlesResponse.length < 1) {
      throw new Error(`Unable to load title data for ${userId}`);
    }

    const deletedUserBannersResponse = await db
      .select({ count: count(userBannersTable.id)})
      .from(userBannersTable)
      .where(
        and(
          eq(userBannersTable.userId, userId),
          isNotNull(userBannersTable.deletedAt)
        )
      );
    
    if (!deletedUserBannersResponse || deletedUserBannersResponse.length < 1) {
      throw new Error(`Unable to load banner data for ${userId}`);
    }

    return {
      titleRolls: NUM_TITLE_ROLLS,
      titleRollsUsed: deletedUserTitlesResponse[0].count,
      bannerRolls: NUM_BANNER_ROLLS,
      bannerRollsUsed: deletedUserBannersResponse[0].count
    };
  });


const InsertTitleRollSchema = z.object({
  role: z.int().gte(1).lte(5)
});
export const insertTitleRoll = createServerFn({ method: "POST" })
  .inputValidator(InsertTitleRollSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data: { role }, context: { userSession } }) => {
    const configsResponse = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.name, "IS_ROSTER_OPEN"))
      .limit(1);
    
    if (!configsResponse || configsResponse.length < 1) {
      throw new Error("Unable to find configs");
    }

    if (!configsResponse[0].enabled) {
      throw new Error("Rosters are closed!");
    }
    
    const rollData = await getRosterRolls({ data: { userId: userSession.user.id }});

    if (rollData.titleRollsUsed >= rollData.titleRolls) {
      throw new Error(`Max rolls already used for ${userSession.user.id}`)
    }

    // delete old title
    await db
      .update(userTitlesTable)
      .set({
        deletedAt: sql`NOW()`
      })
      .where(
        and(
          eq(userTitlesTable.userId, userSession.user.id),
          eq(userTitlesTable.role, role)
        )
      );
    
    // insert new record
    await db
      .insert(userTitlesTable).values({
        userId: userSession.user.id,
        role,
        primaryTitleId: getRandomTitleId(false),
        secondaryTitleId: getRandomTitleId(true),
      });
  });

const InsertBannerRollSchema = z.object({
  role: z.int().gte(1).lte(5)
});
export const insertBannerRoll = createServerFn({ method: "POST" })
  .inputValidator(InsertBannerRollSchema)
  .middleware([userRequiredMiddleware])
  .handler(async ({ data: { role }, context: { userSession } }) => {
    const configsResponse = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.name, "IS_ROSTER_OPEN"))
      .limit(1);
    
    if (!configsResponse || configsResponse.length < 1) {
      throw new Error("Unable to find configs");
    }

    if (!configsResponse[0].enabled) {
      throw new Error("Rosters are closed!");
    }
    
    const rollData = await getRosterRolls({ data: { userId: userSession.user.id }});

    if (rollData.bannerRollsUsed >= rollData.bannerRolls) {
      throw new Error(`Max rolls already used for ${userSession.user.id}`)
    }

    // delete old banner
    await db
      .update(userBannersTable)
      .set({
        deletedAt: sql`NOW()`
      })
      .where(
        and(
          eq(userBannersTable.userId, userSession.user.id),
          eq(userBannersTable.role, role)
        )
      );
    
    const bannerData = generateUserBanner(role);
    await db
      .insert(userBannersTable)
      .values({
        userId: userSession.user.id,
        role,
        bannerTopId: bannerData.bannerTopId,
        bannerTopMultiplier: bannerData.bannerTopMultiplier,
        bannerMiddleId: bannerData.bannerMiddleId,
        bannerMiddleMultiplier: bannerData.bannerMiddleMultiplier,
        bannerBottomId: bannerData.bannerBottomId,
        bannerBottomMultiplier: bannerData.bannerBottomMultiplier
      });
  });

export const BASE_SCORE_MULTIPLIERS = {
  "KILLS": 121,
  "DEATHS": 180, // 1800 - 180 * deaths
  "LAST_HITS": 3,
  "GPM": 2,
  "MADSTONE_COUNT": 19,
  "TOWER_KILLS": 340,
  "WARDS_PLACED": 113,
  "CAMPS_STACKED": 170,
  "RUNES_GRABBED": 121,
  "WATCHERS_TAKEN": 121,
  "SMOKES_USE": 283,
  "ROSHAN_KILLS": 850,
  "TEAMFIGHT_PARTICIPATION": 1895,
  "STUN_TIME": 15,
  "TORMENTOR_KILLS": 850,
  "COURIER_KILLS": 850,
  "FIRSTBLOOD_CLAIMED": 1700
};

interface CalculatePlayerFantasyScoreProps {
  playerGamePerformance: PlayerGamePerformance;
  titles: Title[];
  bannerTopType: BannerType;
  bannerTopMultiplier: number;
  bannerMiddleType: BannerType;
  bannerMiddleMultiplier: number;
  bannerBottomType: BannerType;
  bannerBottomMultiplier: number;
}
const calculatePlayerFantasyScore = (props: CalculatePlayerFantasyScoreProps) => {
  const {
    playerGamePerformance,
    titles,
    bannerTopType,
    bannerTopMultiplier,
    bannerMiddleType,
    bannerMiddleMultiplier,
    bannerBottomType,
    bannerBottomMultiplier
  } = props;

  const bannerMultipliers = {
    [bannerTopType]: bannerTopMultiplier,
    [bannerMiddleType]: bannerMiddleMultiplier,
    [bannerBottomType]: bannerBottomMultiplier,
  }

  const baseValues = {
    "KILLS": playerGamePerformance.kills,
    "DEATHS": playerGamePerformance.deaths,
    "LAST_HITS": playerGamePerformance.lastHits,
    "GPM": playerGamePerformance.gpm,
    "MADSTONE_COUNT": playerGamePerformance.madstoneCount,
    "TOWER_KILLS": playerGamePerformance.towerKills,
    "WARDS_PLACED": playerGamePerformance.wardsPlaced,
    "CAMPS_STACKED": playerGamePerformance.campsStacked,
    "RUNES_GRABBED": playerGamePerformance.runesGrabbed,
    "WATCHERS_TAKEN": playerGamePerformance.watchersTaken,
    "SMOKES_USE": playerGamePerformance.smokesUsed,
    "ROSHAN_KILLS": playerGamePerformance.roshanKills,
    "TEAMFIGHT_PARTICIPATION": playerGamePerformance.teamfightParticipation,
    "STUN_TIME": playerGamePerformance.stunTime,
    "TORMENTOR_KILLS": playerGamePerformance.tormentorKills,
    "COURIER_KILLS": playerGamePerformance.courierKills,
    "FIRSTBLOOD_CLAIMED": playerGamePerformance.firstbloodClaimed ? 1 : 0,
  };

  let totalScore = 0;
  for (const key of Object.keys(BASE_SCORE_MULTIPLIERS)) {
    const value = baseValues[key as BannerType];
    let baseScore = value * BASE_SCORE_MULTIPLIERS[key as BannerType];
    if (key === "DEATHS") {
      baseScore = Math.max(1800 - baseScore, 0);
    }

    if (key in bannerMultipliers) {
      baseScore = baseScore * bannerMultipliers[key];
    }

    // console.log(`${key}: ${baseValues[key as BannerType]} -> ${baseScore}`);
    totalScore += baseScore;
  }

  let titleMultiplier = 1;
  for (const title of titles) {
    if (playerGamePerformance.titles?.includes(title.titleType)) {
      titleMultiplier += title.modifier;
    }
  }

  // console.log(`Pretitles total: ${totalScore}`);
  // console.log(`Titles multiplier ${titles.map((t) => t.name)} from ${playerGamePerformance.titles} -> ${titleMultiplier}`);
  // console.log(`Final score: ${totalScore * titleMultiplier}\n`);
  return totalScore * titleMultiplier;
};

export const syncUserRosterScores = createServerFn({ method: "POST" })
  .middleware([userRequiredMiddleware])
  .handler(async ({ context: { userSession }}) => {
    const userRoleResponse = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userSession.user.id));
    
    if (!userRoleResponse || userRoleResponse.length < 1 || userRoleResponse[0].role !== "ADMIN") {
      // TODO does this surface any information to the user?
      throw new Error("Unexpected request.");
    }

    const userRosters = await db
      .select()
      .from(userRostersTable)
      .where(
        and(
          isNotNull(userRostersTable.carryPlayerId),
          isNotNull(userRostersTable.midPlayerId),
          isNotNull(userRostersTable.offlanePlayerId),
          isNotNull(userRostersTable.softSupportPlayerId),
          isNotNull(userRostersTable.hardSupportPlayerId)
        )
      );
    
    if (!userRosters || userRosters.length < 1) {
      throw new Error("No rosters found for sync");
    }
    
    const userTitles = await db
      .select()
      .from(userTitlesTable)
      .where(isNull(userTitlesTable.deletedAt));
    
    if (!userTitles || userTitles.length < 1) {
      throw new Error("No user titles found during sync");
    }
    const userTitlesMap: Record<string, UserTitle[]> = {};
    for (const userTitle of userTitles) {
      if (userTitle.userId in userTitlesMap) {
        userTitlesMap[userTitle.userId].push(userTitle);
      } else {
        userTitlesMap[userTitle.userId] = [userTitle];
      }
    }
    
    const userBanners = await db
      .select()
      .from(userBannersTable)
      .where(isNull(userBannersTable.deletedAt));
    
    if (!userBanners || userBanners.length < 1) {
      throw new Error("No user banners found during sync");
    }
    const userBannersMap: Record<string, UserBanner[]> = {};
    for (const userBanner of userBanners) {
      if (userBanner.userId in userBannersMap) {
        userBannersMap[userBanner.userId].push(userBanner);
      } else {
        userBannersMap[userBanner.userId] = [userBanner];
      }
    }

    const banners = await db
      .select()
      .from(bannersTable);
    
    if (!banners || banners.length < 1) {
      throw new Error("No banners found during sync");
    }
    const bannersMap: Record<string, Banner> = {};
    for (const banner of banners) {
      bannersMap[banner.id] = banner;
    }

    const titles = await db
      .select()
      .from(titlesTable);

    if (!titles || titles.length < 1) {
      throw new Error("No titles found during sync");
    }
    const titlesMap: Record<string, Title> = {};
    for (const title of titles) {
      titlesMap[title.id] = title;
    }

    const playerIdsSet = new Set<string>();
    for (const userRoster of userRosters) {
      playerIdsSet.add(userRoster.carryPlayerId!);
      playerIdsSet.add(userRoster.midPlayerId!);
      playerIdsSet.add(userRoster.offlanePlayerId!);
      playerIdsSet.add(userRoster.softSupportPlayerId!);
      playerIdsSet.add(userRoster.hardSupportPlayerId!);
    }

    const gamePlayerGamePerformances = await db
      .select()
      .from(playerGamePerformancesTable)
      .innerJoin(gamesTable, eq(gamesTable.id, playerGamePerformancesTable.gameId))
      .where(
        and(
          isNotNull(gamesTable.playoffMatchId),
          inArray(playerGamePerformancesTable.playerId, Array.from(playerIdsSet))
        )
      );

    if (!gamePlayerGamePerformances || gamePlayerGamePerformances.length < 1) {
      console.log("No game performances found during sync");
      return;
    }

    // TODO surely some way to improve this craziness
    const getBestScoreForPlayerId = (playerId: string, userBanner: UserBanner, userTitle: UserTitle) => {
      const gamesForPlayer = gamePlayerGamePerformances.filter((g) => g.player_game_performances.playerId === playerId);
      const matchIdsSet = new Set<string>();
      const gamesWithScore = gamesForPlayer.map((g) => {
        const score = calculatePlayerFantasyScore({
          playerGamePerformance: g.player_game_performances,
          titles: [titlesMap[userTitle.primaryTitleId], titlesMap[userTitle.secondaryTitleId]],
          bannerTopType: bannersMap[userBanner.bannerTopId].bannerType,
          bannerTopMultiplier: userBanner.bannerTopMultiplier,
          bannerMiddleType: bannersMap[userBanner.bannerMiddleId].bannerType,
          bannerMiddleMultiplier: userBanner.bannerMiddleMultiplier,
          bannerBottomType: bannersMap[userBanner.bannerBottomId].bannerType,
          bannerBottomMultiplier: userBanner.bannerBottomMultiplier
        });

        if (!!g.games.playoffMatchId) {
          matchIdsSet.add(g.games.playoffMatchId);
        }

        console.log(`Player: ${g.player_game_performances.playerId} Game: ${g.games.gameId} Score: ${score}`);
        return {
          score,
          gameId: g.games.id,
          playoffMatchId: g.games.playoffMatchId
        };
      });

      const bestMatchMap: Record<string, number[]> = {};
      for (const gameWithScore of gamesWithScore) {
        if (!gameWithScore.playoffMatchId) {
          continue;
        }

        if (gameWithScore.playoffMatchId in bestMatchMap) {
          const bm = bestMatchMap[gameWithScore.playoffMatchId];
          bm.push(gameWithScore.score);
          bm.sort((a, b) => b - a);
        } else {
          bestMatchMap[gameWithScore.playoffMatchId] = [gameWithScore.score];
        }
      }

      let bestMatchScore = 0;
      for (const scores of Object.values(bestMatchMap)) {
        const total = scores[0] + scores[1];
        if (total > bestMatchScore) {
          bestMatchScore = total;
        }
      }

      return bestMatchScore;
    };

    for (const userRoster of userRosters) {
      const userBanners = userBannersMap[userRoster.userId];
      if (!userBanners || userBanners.length < 5) {
        throw new Error(`User banners not found for user ${userRoster.userId}`);
      }
      userBanners.sort((a, b) => a.role - b.role);
      const userTitles = userTitlesMap[userRoster.userId];
      if (!userTitles || userTitles.length < 5) {
        throw new Error(`User titles not found for user ${userRoster.userId}`);
      }
      userTitles.sort((a, b) => a.role - b.role);

      const carryPlayerScore = userRoster.carryPlayerId ? getBestScoreForPlayerId(userRoster.carryPlayerId, userBanners[0], userTitles[0]) : 0;
      const midPlayerScore = userRoster.midPlayerId ? getBestScoreForPlayerId(userRoster.midPlayerId, userBanners[1], userTitles[1]) : 0;
      const offlanePlayerScore = userRoster.offlanePlayerId ? getBestScoreForPlayerId(userRoster.offlanePlayerId, userBanners[2], userTitles[2]) : 0;
      const softSupportPlayerScore = userRoster.softSupportPlayerId ? getBestScoreForPlayerId(userRoster.softSupportPlayerId, userBanners[3], userTitles[3]) : 0;
      const hardSupportPlayerScore = userRoster.hardSupportPlayerId ? getBestScoreForPlayerId(userRoster.hardSupportPlayerId, userBanners[4], userTitles[4]) : 0;

      const totalScore = carryPlayerScore + midPlayerScore + offlanePlayerScore + softSupportPlayerScore + hardSupportPlayerScore;

      await db
        .insert(userRosterScoresTable)
        .values({ userId: userRoster.userId, carryPlayerScore, midPlayerScore, offlanePlayerScore, softSupportPlayerScore, hardSupportPlayerScore, totalScore })
        .onConflictDoUpdate({
          target: userRosterScoresTable.userId,
          set: { carryPlayerScore, midPlayerScore, offlanePlayerScore, softSupportPlayerScore, hardSupportPlayerScore, totalScore },
        });
    }
  })

const GetUserRosterScoreSchema = z.object({
  userId: z.string().nonempty()
});
export const getUserRosterScore = createServerFn({ method: "GET" })
  .inputValidator(GetUserRosterScoreSchema)
  .handler(async ({ data: { userId } }) => {
    const userRosterScoreResponse = await db
      .select()
      .from(userRosterScoresTable)
      .where(eq(userRosterScoresTable.userId, userId))
      .limit(1);
    
    if (!userRosterScoreResponse || userRosterScoreResponse.length < 1) {
      return;
    }

    return userRosterScoreResponse[0];
  });

export const getRecentRosterCompletions = createServerFn({ method: "GET"})
  .handler(async () => {
    const predictionActivityResponse = await db
      .select({
        userId: userRostersTable.userId,
        slug: profilesTable.slug,
        name: profilesTable.name,
        updatedAt: userRostersTable.updatedAt
      })
      .from(userRostersTable)
      .innerJoin(profilesTable, eq(profilesTable.userId, userRostersTable.userId))
      .where(
        and(
          isNotNull(userRostersTable.carryPlayerId),
          isNotNull(userRostersTable.midPlayerId),
          isNotNull(userRostersTable.offlanePlayerId),
          isNotNull(userRostersTable.softSupportPlayerId),
          isNotNull(userRostersTable.hardSupportPlayerId)
        )
      )
      .orderBy(desc(userRostersTable.updatedAt))
      .limit(25);
    
    return predictionActivityResponse;
  });

export const getUserRosterScoresLeaderboard = createServerFn({ method: "GET"})
  .handler(async () => {
    const userRosterScoresResponse = await db
      .select()
      .from(userRosterScoresTable)
      .innerJoin(userRostersTable, eq(userRostersTable.userId, userRosterScoresTable.userId))
      .innerJoin(profilesTable, eq(profilesTable.userId, userRosterScoresTable.userId))
      .orderBy(desc(userRosterScoresTable.totalScore));
    
    return userRosterScoresResponse;
  });
