import { db } from "@/lib/db";
import { accountsTable, playersTable, profilesTable, userRolesTable, usersTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { userRequiredMiddleware } from "@/services/auth";

const GetProfileBySlugSchema = z.object({
  slug: z.string().nonempty()
});
export const getProfileBySlug = createServerFn({ method: "GET" })
  .inputValidator(GetProfileBySlugSchema)
  .handler(async ({ data }) => {
    const response = await db
      .select({
        id: profilesTable.id,
        userId: profilesTable.userId,
        slug: profilesTable.slug,
        description: profilesTable.description,
        name: usersTable.name,
        image: usersTable.image,
        discordId: accountsTable.accountId
      })
      .from(profilesTable)
      .innerJoin(usersTable, eq(usersTable.id, profilesTable.userId))
      .innerJoin(accountsTable, eq(accountsTable.userId, usersTable.id))
      .where(eq(profilesTable.slug, data.slug))
      .limit(1);
    
    if (!response || response.length < 1) {
      return;
    }

    return response[0];
  });

const GetProfileByUserIdSchema = z.object({
  userId: z.string().nonempty()
});
export const getProfileByUserId = createServerFn({ method: "GET" })
  .inputValidator(GetProfileByUserIdSchema)
  .handler(async ({ data }) => {
    const response = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, data.userId))
      .limit(1);
    
    if (!response || response.length < 1) {
      throw new Error('Profile not found.');
    }

    return response[0];
  });

export const getUserRole = createServerFn({ method: "GET" })
  .middleware([userRequiredMiddleware])
  .handler(async ({ context: { userSession } }) => {
    const userRoleResponse = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userSession.user.id));
    
    if (!userRoleResponse || userRoleResponse.length < 1) {
      return;
    }

    return userRoleResponse[0];
  });

// function delay(time: number) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }
// export const populatePlayerImages = createServerFn({ method: "GET" })
//   .middleware([userRequiredMiddleware])
//   .handler(async ({ context: { userSession } }) => {
//     const playersResponse = await db
//       .select()
//       .from(playersTable)
//       .where(isNull(playersTable.image));

//     if (!playersResponse) {
//       throw new Error("Unable to find players.");
//     }

//     for (const player of playersResponse) {
//       const playerResponse = await fetch(`https://api.opendota.com/api/players/${player.steamId}`);
//       if (playerResponse.status !== 200) {
//         console.error(playerResponse.status);
//         console.log(player)
//         throw new Error("Unexpected response when getting player data.");
//       }
//       const playerData = await playerResponse.json();

//       console.log(player.name)
//       await db
//         .update(playersTable)
//         .set({ image: playerData.profile.avatarfull })
//         .where(eq(playersTable.id, player.id));
      
//       await delay(1200);
//     }
//   });