import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { createRecipeSchema, recipes } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const recipeRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.recipes.findMany({
      orderBy: desc(recipes.id),
      limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.recipes.findFirst({
        where: eq(recipes.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(createRecipeSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(recipes).values({
        title: input.title,
        description: input.description,
        servings: input.servings,
        prepTimeMinutes: input.prepTimeMinutes,
        calories: input.calories,
        proteinGrams: input.proteinGrams,
        carbsGrams: input.carbsGrams,
        fatsGrams: input.fatsGrams,
        imageUrl: input.imageUrl,
        rating: input.rating,
        reviewCount: input.reviewCount,
      });
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(recipes).where(eq(recipes.id, input));
  }),
} satisfies TRPCRouterRecord;
