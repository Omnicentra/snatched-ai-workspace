import { authRouter } from "./router/auth";
import { recipeRouter } from "./router/recipe";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  recipe: recipeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
