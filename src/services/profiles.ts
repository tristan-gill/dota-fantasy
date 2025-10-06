import { db } from "@/lib/db";
import { accountsTable, profilesTable, usersTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

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