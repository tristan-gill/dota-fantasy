import { db } from "@/lib/db";
import { configNameEnum, configsTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";

export const getConfigs = createServerFn({ method: "GET" })
  .handler(async () => {
    const configsResponse = await db
      .select()
      .from(configsTable);
    return configsResponse;
  });

const GetConfigSchema = z.object({
  name: z.enum(configNameEnum.enumValues)
});
export const getConfig = createServerFn({ method: "GET" })
  .inputValidator(GetConfigSchema)
  .handler(async ({ data: { name }}) => {
    const configResponse = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.name, name));
    
    if (!configResponse || configResponse.length < 1) {
      return;
    }
    
    return configResponse[0].enabled;
  });