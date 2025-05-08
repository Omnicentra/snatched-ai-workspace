import { relations } from "drizzle-orm/relations";
import { user, bodyMeasurements, fitnessBlockers, foodCravings, previousExperiences, workoutCategories, workouts, healthConditions, bodyConsiderations, userWorkoutProgress, fitnessGoals, workoutExercises, exercises, recipes, recipeIngredients, mealPlans, mealSchedule, userMilestoneProgress, milestoneLevels, recipeInstructions, userRecipes, recipeCategories, session, account, workoutPlans, workoutPlanDays, userDevices } from "./schema";

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({one}) => ({
	user: one(user, {
		fields: [bodyMeasurements.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
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
	sessions: many(session),
	accounts: many(account),
	workoutPlans: many(workoutPlans),
	devices: many(userDevices),
}));

export const fitnessBlockersRelations = relations(fitnessBlockers, ({one}) => ({
	user: one(user, {
		fields: [fitnessBlockers.userId],
		references: [user.id]
	}),
}));

export const foodCravingsRelations = relations(foodCravings, ({one}) => ({
	user: one(user, {
		fields: [foodCravings.userId],
		references: [user.id]
	}),
}));

export const previousExperiencesRelations = relations(previousExperiences, ({one}) => ({
	user: one(user, {
		fields: [previousExperiences.userId],
		references: [user.id]
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
	user: one(user, {
		fields: [healthConditions.userId],
		references: [user.id]
	}),
}));

export const bodyConsiderationsRelations = relations(bodyConsiderations, ({one}) => ({
	user: one(user, {
		fields: [bodyConsiderations.userId],
		references: [user.id]
	}),
}));

export const userWorkoutProgressRelations = relations(userWorkoutProgress, ({one}) => ({
	user: one(user, {
		fields: [userWorkoutProgress.userId],
		references: [user.id]
	}),
	workout: one(workouts, {
		fields: [userWorkoutProgress.workoutId],
		references: [workouts.id]
	}),
}));

export const fitnessGoalsRelations = relations(fitnessGoals, ({one}) => ({
	user: one(user, {
		fields: [fitnessGoals.userId],
		references: [user.id]
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
	user: one(user, {
		fields: [mealPlans.userId],
		references: [user.id]
	}),
}));

export const userMilestoneProgressRelations = relations(userMilestoneProgress, ({one}) => ({
	user: one(user, {
		fields: [userMilestoneProgress.userId],
		references: [user.id]
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
	user: one(user, {
		fields: [userRecipes.userId],
		references: [user.id]
	}),
	recipe: one(recipes, {
		fields: [userRecipes.recipeId],
		references: [recipes.id]
	}),
}));

export const workoutPlansRelations = relations(workoutPlans, ({one, many}) => ({
	user: one(user, {
		fields: [workoutPlans.userId],
		references: [user.id]
	}),
	workoutPlanDays: many(workoutPlanDays),
}));

export const workoutPlanDaysRelations = relations(workoutPlanDays, ({one}) => ({
	workoutPlan: one(workoutPlans, {
		fields: [workoutPlanDays.planId],
		references: [workoutPlans.id]
	}),
	workout: one(workouts, {
		fields: [workoutPlanDays.workoutId],
		references: [workouts.id]
	}),
}));

export const recipeCategoriesRelations = relations(recipeCategories, ({many}) => ({
	recipes: many(recipes),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userDevicesRelations = relations(userDevices, ({one}) => ({
	user: one(user, {
		fields: [userDevices.userId],
		references: [user.id]
	}),
}));