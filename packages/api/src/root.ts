import { authRouter } from "./router/auth";
import { recipeRouter } from "./router/recipe";
import { userRouter } from "./router/user";
import { nutritionRouter } from "./router/nutrition";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  recipe: recipeRouter,
  user: userRouter,
  nutrition: nutritionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
