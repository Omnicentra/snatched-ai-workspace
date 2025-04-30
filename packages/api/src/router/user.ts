import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { images } from "../utils/benchmark-images";
import { protectedProcedure, publicProcedure } from "../trpc";
import { analyzeBodyImages } from "../utils/gemini";

type BodyShapeEnum = keyof typeof images;

export const userRouter = {
  /**
   * bodyRating
   * Accepts image URLs and desired body shape to calculate various body-rating scores
   */
  bodyRating: protectedProcedure
    .input(
      z.object({
        imageKeys: z.array(z.string()),
        desiredBodyShape: z.enum(Object.keys(images) as [BodyShapeEnum, ...BodyShapeEnum[]]),
      })
    )
    .mutation(async (opts) => {
      const { imageKeys, desiredBodyShape } = opts.input;
      
      if (imageKeys.length !== 3) {
        throw new Error("Exactly 3 images are required: front, back, and side views");
      }

      return analyzeBodyImages(imageKeys, desiredBodyShape);
    }),
} satisfies TRPCRouterRecord;
