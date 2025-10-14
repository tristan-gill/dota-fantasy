import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      ...schema,
      users: schema.usersTable,
      accounts: schema.accountsTable,
      sessions: schema.sessionsTable,
      verifications: schema.verificationsTable,
    }
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      disableDefaultScope: true,
      scope: ["identify"],
      prompt: "consent",
      mapProfileToUser: async (profile) => {
        return {
          email: profile.id,
        }
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        // set slug for profile based on de-duped discord name
        after: async (user) => {
          const slug = user.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, "") // Remove leading and trailing hyphens
            .substring(0, 50) // Limit length
          
          const duplicateSlugCheck = await db
            .select()
            .from(schema.profilesTable)
            .where(eq(schema.profilesTable.slug, slug));
          
          if (!duplicateSlugCheck || duplicateSlugCheck.length < 1) {
            await db.insert(schema.profilesTable).values({
              userId: user.id,
              slug,
              name: user.name,
            });
          } else {
            // Generate a 4-character random string
            const randomString = Math.random().toString(36).substring(2, 6).toLowerCase();
            await db.insert(schema.profilesTable).values({
              userId: user.id,
              slug: slug + randomString,
              name: user.name,
            });
          }

          await db.insert(schema.userRostersTable).values({
            userId: user.id
          });
        }
      }
    }
  }
});
