import { createServerFn } from "@tanstack/react-start";
import { userRequiredMiddleware } from "@/services/auth";
import z from "zod";
import { db } from "@/lib/db";
import { playoffMatchesTable, userRolesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// TODO rename to playoffMatches

const UpdatePlayoffMatchSchema = z.object({
  id: z.string().nonempty(),
  teamIdLeft: z.string().nullable(),
  teamIdRight: z.string().nullable(),
  winnerId: z.string().nullable()
});
// TODO validate predictions length, disallow partials
export const updatePlayoffMatch = createServerFn({ method: "POST" })
  .inputValidator(UpdatePlayoffMatchSchema)
  // TODO maybe write a roles type middleware
  .middleware([userRequiredMiddleware])
  .handler(async ({ data, context: { userSession } }) => {
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

    const { id, teamIdLeft, teamIdRight, winnerId } = data;
    await db
      .update(playoffMatchesTable)
      .set({
        teamIdLeft,
        teamIdRight,
        winnerId,
      })
      .where(eq(playoffMatchesTable.id, id));
  });