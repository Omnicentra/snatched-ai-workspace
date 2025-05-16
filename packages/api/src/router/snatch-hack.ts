import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@omc/db/client";
import { snatchHacks, userSnatchHacks } from "@omc/db/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const snatchHackRouter = createTRPCRouter({
  // Get all snatch hacks
  getSnatchHacks: publicProcedure.query(async () => {
    return db.select().from(snatchHacks).execute();
  }),

  // Get a single snatch hack by ID
  getSnatchHackById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [hack] = await db
        .select()
        .from(snatchHacks)
        .where(eq(snatchHacks.id, input.id))
        .execute();

      if (!hack) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Snatch hack with ID ${input.id} not found`,
        });
      }

      return hack;
    }),

  // Get the user's completed hack for the week
  getUserCompletedHacksForTheWeek: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const { startDate, endDate } = input;

      const completedHacks = await db
        .select()
        .from(userSnatchHacks)
        .where(
          and(
            eq(userSnatchHacks.userId, userId),
            gte(userSnatchHacks.completedDate, startDate),
            lte(userSnatchHacks.completedDate, endDate),
          ),
        )

      return completedHacks;
    }),

  // Get the user's completed hack for today
  getUserCompletedHackForToday: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    const today = new Date().toISOString().split("T")[0];

    const [completedHack] = await db
      .select({
        userHack: userSnatchHacks,
        hack: snatchHacks,
      })
      .from(userSnatchHacks)
      .innerJoin(snatchHacks, eq(userSnatchHacks.snatchHackId, snatchHacks.id))
      .where(
        and(
          eq(userSnatchHacks.userId, userId),
          sql`${userSnatchHacks.completedDate} = ${today}::date`,
        ),
      )
      .execute();

    return completedHack ?? null;
  }),

  // Complete a snatch hack
  completeSnatchHack: protectedProcedure
    .input(
      z.object({
        hackId: z.number(),
        completed: z.boolean(), // true to complete, false to uncomplete
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();

      if (!today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Today's date is not available",
        });
      }

      // Check if there's already a completed hack for today
      const [existingCompletion] = await db
        .select()
        .from(userSnatchHacks)
        .where(
          and(
            eq(userSnatchHacks.userId, userId),
            sql`${userSnatchHacks.completedDate} = ${today}::date`,
          ),
        )
        .execute();

      if (input.completed) {
        // User wants to mark a hack as completed
        if (existingCompletion) {
          // If there's already a completion for today but with a different hack,
          // update it to the new hack
          if (existingCompletion.snatchHackId !== input.hackId) {
            const [updatedHack] = await db
              .update(userSnatchHacks)
              .set({
                snatchHackId: input.hackId,
                completedAt: now,
              })
              .where(eq(userSnatchHacks.id, existingCompletion.id))
              .returning();

            return updatedHack;
          }
          // If it's the same hack, do nothing
          return existingCompletion;
        } else {
          // Create a new completion record
          const [newCompletion] = await db
            .insert(userSnatchHacks)
            .values({
              userId,
              snatchHackId: input.hackId,
              completedAt: now,
              completedDate: today,
            })
            .returning();

          return newCompletion;
        }
      } else {
        // User wants to unmark a hack
        if (
          existingCompletion &&
          existingCompletion.snatchHackId === input.hackId
        ) {
          // Delete the completion record
          await db
            .delete(userSnatchHacks)
            .where(eq(userSnatchHacks.id, existingCompletion.id));
        }

        return { success: true };
      }
    }),
});
