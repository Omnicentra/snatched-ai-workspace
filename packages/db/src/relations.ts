import { relations } from "drizzle-orm/relations";
import { users, bodyMeasurements, fitnessBlockers, foodCravings, previousExperiences, workoutCategories, workouts, healthConditions, bodyConsiderations, userWorkoutProgress, fitnessGoals, workoutExercises, exercises, recipes, recipeIngredients, mealPlans, mealSchedule, userMilestoneProgress, milestoneLevels, recipeInstructions, userRecipes } from "./schema";

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({one}) => ({
	user: one(users, {
		fields: [bodyMeasurements.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	bodyMeasurements: many(bodyMeasurements),
	fitnessBlockers: many(fitnessBlockers),
	foodCravings: many(foodCravings),
	previousExperiences: many(previousExperiences),
	healthConditions: many(healthConditions),
	bodyConsiderations: many(bodyConsiderations),
	userWorkoutProgresses: many(userWorkoutProgress),
	fitnessGoals: many(fitnessGoals),
	userMilestoneProgresses: many(userMilestoneProgress),
	mealPlans: many(mealPlans),
	userRecipes: many(userRecipes),
}));

export const fitnessBlockersRelations = relations(fitnessBlockers, ({one}) => ({
	user: one(users, {
		fields: [fitnessBlockers.userId],
		references: [users.id]
	}),
}));

export const foodCravingsRelations = relations(foodCravings, ({one}) => ({
	user: one(users, {
		fields: [foodCravings.userId],
		references: [users.id]
	}),
}));

export const previousExperiencesRelations = relations(previousExperiences, ({one}) => ({
	user: one(users, {
		fields: [previousExperiences.userId],
		references: [users.id]
	}),
}));

export const workoutsRelations = relations(workouts, ({one, many}) => ({
	workoutCategory: one(workoutCategories, {
		fields: [workouts.categoryId],
		references: [workoutCategories.id]
	}),
	userWorkoutProgresses: many(userWorkoutProgress),
	workoutExercises: many(workoutExercises),
}));

export const workoutCategoriesRelations = relations(workoutCategories, ({many}) => ({
	workouts: many(workouts),
}));

export const healthConditionsRelations = relations(healthConditions, ({one}) => ({
	user: one(users, {
		fields: [healthConditions.userId],
		references: [users.id]
	}),
}));

export const bodyConsiderationsRelations = relations(bodyConsiderations, ({one}) => ({
	user: one(users, {
		fields: [bodyConsiderations.userId],
		references: [users.id]
	}),
}));

export const userWorkoutProgressRelations = relations(userWorkoutProgress, ({one}) => ({
	user: one(users, {
		fields: [userWorkoutProgress.userId],
		references: [users.id]
	}),
	workout: one(workouts, {
		fields: [userWorkoutProgress.workoutId],
		references: [workouts.id]
	}),
}));

export const fitnessGoalsRelations = relations(fitnessGoals, ({one}) => ({
	user: one(users, {
		fields: [fitnessGoals.userId],
		references: [users.id]
	}),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({one}) => ({
	workout: one(workouts, {
		fields: [workoutExercises.workoutId],
		references: [workouts.id]
	}),
	exercise: one(exercises, {
		fields: [workoutExercises.exerciseId],
		references: [exercises.id]
	}),
}));

export const exercisesRelations = relations(exercises, ({many}) => ({
	workoutExercises: many(workoutExercises),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({one}) => ({
	recipe: one(recipes, {
		fields: [recipeIngredients.recipeId],
		references: [recipes.id]
	}),
}));

export const recipesRelations = relations(recipes, ({many}) => ({
	recipeIngredients: many(recipeIngredients),
	mealSchedules: many(mealSchedule),
	recipeInstructions: many(recipeInstructions),
	userRecipes: many(userRecipes),
}));

export const mealScheduleRelations = relations(mealSchedule, ({one}) => ({
	mealPlan: one(mealPlans, {
		fields: [mealSchedule.mealPlanId],
		references: [mealPlans.id]
	}),
	recipe: one(recipes, {
		fields: [mealSchedule.recipeId],
		references: [recipes.id]
	}),
}));

export const mealPlansRelations = relations(mealPlans, ({one, many}) => ({
	mealSchedules: many(mealSchedule),
	user: one(users, {
		fields: [mealPlans.userId],
		references: [users.id]
	}),
}));

export const userMilestoneProgressRelations = relations(userMilestoneProgress, ({one}) => ({
	user: one(users, {
		fields: [userMilestoneProgress.userId],
		references: [users.id]
	}),
	milestoneLevel: one(milestoneLevels, {
		fields: [userMilestoneProgress.levelId],
		references: [milestoneLevels.id]
	}),
}));

export const milestoneLevelsRelations = relations(milestoneLevels, ({many}) => ({
	userMilestoneProgresses: many(userMilestoneProgress),
}));

export const recipeInstructionsRelations = relations(recipeInstructions, ({one}) => ({
	recipe: one(recipes, {
		fields: [recipeInstructions.recipeId],
		references: [recipes.id]
	}),
}));

export const userRecipesRelations = relations(userRecipes, ({one}) => ({
	user: one(users, {
		fields: [userRecipes.userId],
		references: [users.id]
	}),
	recipe: one(recipes, {
		fields: [userRecipes.recipeId],
		references: [recipes.id]
	}),
}));