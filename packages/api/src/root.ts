import { authRouter } from "./router/auth";
import { recipeRouter } from "./router/recipe";
import { userRouter } from "./router/user";
import { nutritionRouter } from "./router/nutrition";
import { workoutRouter } from "./router/workout";
import { exerciseRouter } from "./router/exercise";
import { createTRPCRouter } from "./trpc";
import { userDevicesRouter } from "./router/user-devices";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  recipe: recipeRouter,
  user: userRouter,
  nutrition: nutritionRouter,
  workout: workoutRouter,
  exercise: exerciseRouter,
  userDevices: userDevicesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
