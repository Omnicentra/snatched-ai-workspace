import { api, HydrateClient } from "~/trpc/server";
import RecipesList from "~/app/_components/recipe-list";

export const runtime = "edge";

export default function HomePage() {
  void api.recipe.all.prefetch();

  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-primary">T3</span> Turbo
          </h1>

          <div className="flex flex-col items-center gap-4">
            <RecipesList />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
