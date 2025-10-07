import { db } from "@/lib/db";
import { accountsTable, profilesTable, userRolesTable, usersTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
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
      throw new Error('Profile not found.');
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
      return undefined;
    }

    return userRoleResponse[0];
  });