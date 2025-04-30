import { authRouter } from "./router/auth";
import { recipeRouter } from "./router/recipe";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  recipe: recipeRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
