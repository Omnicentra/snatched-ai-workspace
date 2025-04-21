"use client";

import { api } from "~/trpc/react";

export default function RecipesList() {
  const { data: recipes, isLoading, refetch } = api.recipe.all.useQuery();

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        className="rounded-full bg-primary px-4 py-2 font-semibold text-white"
        disabled={isLoading}
        onClick={() => refetch()}
      >
        {isLoading ? "Loading..." : "Fetch Recipes"}
      </button>
      {recipes && (
        <div className="mt-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="mb-2">
              {recipe.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
