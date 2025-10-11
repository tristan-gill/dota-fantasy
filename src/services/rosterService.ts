import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/lib/db";
import { bannersTable, playersTable, teamsTable, titlesTable, userBannersTable, userRostersTable, userTitlesTable } from "@/lib/db/schema";
import { userRequiredMiddleware } from "@/services/auth";

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
    bannerIds.push(redBannerIds[Math.floor(Math.random() * redBannerIds.length)]);
    bannerIds.push(greenBannerIds[Math.floor(Math.random() * greenBannerIds.length)]);
    bannerIds.push(redBannerIds[Math.floor(Math.random() * redBannerIds.length)]);
  }
  if ([4,5].includes(role)) {
    bannerIds.push(blueBannerIds[Math.floor(Math.random() * blueBannerIds.length)]);
    bannerIds.push(greenBannerIds[Math.floor(Math.random() * greenBannerIds.length)]);
    bannerIds.push(blueBannerIds[Math.floor(Math.random() * blueBannerIds.length)]);
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
          bannerTopMultiplier: bannerData.bannerTopMultiplier.toString(),
          bannerMiddleId: bannerData.bannerMiddleId,
          bannerMiddleMultiplier: bannerData.bannerMiddleMultiplier.toString(),
          bannerBottomId: bannerData.bannerBottomId,
          bannerBottomMultiplier: bannerData.bannerBottomMultiplier.toString()
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
      })
      .where(eq(userRostersTable.userId, userSession.user.id));
  });


export const getRosterRolls = createServerFn({ method: "GET" })
  .middleware([userRequiredMiddleware])
  .handler(async ({ context: { userSession }}) => {
    const deletedUserTitlesResponse = await db
      .select({ count: count(userTitlesTable.id)})
      .from(userTitlesTable)
      .where(
        and(
          eq(userTitlesTable.userId, userSession.user.id),
          isNotNull(userTitlesTable.deletedAt)
        )
      );
    
    if (!deletedUserTitlesResponse || deletedUserTitlesResponse.length < 1) {
      throw new Error(`Unable to load title data for ${userSession.user.id}`);
    }

    const deletedUserBannersResponse = await db
      .select({ count: count(userBannersTable.id)})
      .from(userBannersTable)
      .where(
        and(
          eq(userBannersTable.userId, userSession.user.id),
          isNotNull(userBannersTable.deletedAt)
        )
      );
    
    if (!deletedUserBannersResponse || deletedUserBannersResponse.length < 1) {
      throw new Error(`Unable to load banner data for ${userSession.user.id}`);
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
    const rollData = await getRosterRolls();

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
    const rollData = await getRosterRolls();

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
        bannerTopMultiplier: bannerData.bannerTopMultiplier.toString(),
        bannerMiddleId: bannerData.bannerMiddleId,
        bannerMiddleMultiplier: bannerData.bannerMiddleMultiplier.toString(),
        bannerBottomId: bannerData.bannerBottomId,
        bannerBottomMultiplier: bannerData.bannerBottomMultiplier.toString()
      });
  });