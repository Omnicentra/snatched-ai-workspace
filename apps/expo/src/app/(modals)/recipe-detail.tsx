import { nutritionStore$ } from "@/stores/nutrition.store"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { use$ } from "@legendapp/state/react"
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

const RecipeDetailScreen = () => {
    const router = useRouter()
    const params = useLocalSearchParams()
    const mealId = params.mealId as string
    const nutrition = use$(nutritionStore$)
    const meal = nutrition.meals[mealId];

    const loggedMeal = nutrition.loggedMeals[mealId];

    const isLogged = !!loggedMeal?.loggedAt

    const handleLogMeal = () => {
        if (!meal) return;
        
        // Initialize or update the logged meal
        nutritionStore$.loggedMeals.set({
            ...nutritionStore$.loggedMeals.get(),
            [mealId]: {
                loggedAt: new Date().toISOString(),
                mealId: mealId,
            }
        });
    };

    if (!meal) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="font-inter-medium text-gray-500">Meal not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header Image */}
            <View className="relative h-[200px]">
                <Image
                    source={{ uri: meal.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-x-0 top-0 flex-row justify-between p-6">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 items-center justify-center rounded-full bg-black/30"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    {isLogged ? (
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <Ionicons name="checkmark" size={24} color="white" />
                        </View>
                    ) : (
                        <Pressable
                            onPress={handleLogMeal}
                            className="h-10 w-10 items-center justify-center rounded-full bg-pink-500"
                        >
                            <MaterialCommunityIcons name="plus" size={24} color="white" />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Title and Status */}
                <View className="py-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-inter-bold text-2xl text-black">
                            {meal.name}
                        </Text>
                        {isLogged && loggedMeal && (
                            <Text className="font-inter-medium text-sm text-green-500">
                                Logged at {new Date(loggedMeal.loggedAt).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <Text className="font-inter-medium mt-1 text-gray-500">
                        {meal.time}
                    </Text>
                </View>

                {/* Nutrition Info */}
                <View className="flex-row justify-between py-4">
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Calories</Text>
                        <Text className="font-inter-bold text-xl">{meal.calories}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Protein</Text>
                        <Text className="font-inter-bold text-xl">{meal.protein}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Carbs</Text>
                        <Text className="font-inter-bold text-xl">{meal.carbs}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Fats</Text>
                        <Text className="font-inter-bold text-xl">{meal.fats}g</Text>
                    </View>
                </View>

                {/* Ingredients */}
                <View className="py-4">
                    <Text className="font-inter-bold mb-4 text-xl text-black">
                        Ingredients
                    </Text>
                    <View className="gap-y-3">
                        {[
                            "2 cups mixed greens",
                            "1 grilled chicken breast",
                            "1/2 avocado",
                            "Cherry tomatoes",
                            "Olive oil dressing"
                        ].map((ingredient, index) => (
                            <View
                                key={index}
                                className="flex-row items-center"
                            >
                                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full border border-gray-200" />
                                <Text className="font-inter text-base text-gray-800">
                                    {ingredient}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Instructions */}
                <View className="py-4">
                    <Text className="font-inter-bold mb-4 text-xl text-black">
                        Instructions
                    </Text>
                    <View className="gap-y-4">
                        {[
                            "Wash and chop all vegetables",
                            "Grill the chicken breast",
                            "Mix ingredients in a bowl",
                            "Add dressing and toss",
                            "Serve immediately"
                        ].map((step, index) => (
                            <View
                                key={index}
                                className="flex-row"
                            >
                                <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                                    <Text className="font-inter-medium text-black">
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text className="flex-1 font-inter text-base text-gray-800">
                                    {step}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Padding */}
                <View className="h-8" />
            </ScrollView>
        </View>
    )
};

export default RecipeDetailScreen; 