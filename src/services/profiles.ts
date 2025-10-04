import { db } from "@/lib/db";
import { accounts, profiles, users } from "@/lib/db/schema";
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
        userId: profiles.userId,
        slug: profiles.slug,
        description: profiles.description,
        name: users.name,
        image: users.image,
        discordId: accounts.accountId
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .innerJoin(accounts, eq(accounts.userId, users.id))
      .where(eq(profiles.slug, data.slug))
      .limit(1);
    
    if (!response || response.length < 1) {
      throw new Error('Profile not found.');
    }

    return response[0];
  });