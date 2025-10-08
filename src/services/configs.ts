import { db } from "@/lib/db";
import { configsTable } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";

export const getConfigs = createServerFn({ method: "GET" })
  .handler(async () => {
    const configsResponse = await db
      .select()
      .from(configsTable);
    return configsResponse;
  });