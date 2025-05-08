import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userDevices } from "@omc/db/schema";

export const userDevicesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        deviceId: z.string(),
        deviceType: z.string().nullable(),
        deviceName: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(userDevices).values({
        userId: parseInt(input.userId),
        deviceId: input.deviceId,
        deviceType: input.deviceType,
        deviceName: input.deviceName,
      }).onConflictDoNothing({
        target: [userDevices.userId, userDevices.deviceId],
      });
    }),
}); 