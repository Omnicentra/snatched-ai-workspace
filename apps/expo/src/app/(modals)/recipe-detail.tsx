import { nutritionStore$ } from "@/stores/nutrition.store"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { use$ } from "@legendapp/state/react"
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
    Animated,
    ActivityIndicator,
} from 'react-native'
import { api } from "@/utils/api"

const RecipeDetailScreen = () => {
    const router = useRouter()
    const params = useLocalSearchParams()
    const mealId = Number(params.mealId)
    const nutrition = use$(nutritionStore$)
    const { data: recipe, isLoading } = api.nutrition.getRecipeById.useQuery({ 
        id: mealId
    }, {
        enabled: !isNaN(mealId),
    })
    const loggedMeal = nutrition.loggedMeals[mealId.toString()]?.get();
    const isLogged = !!loggedMeal?.loggedAt;

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handleLogMeal = () => {
        if (!recipe) return;
        
        // Start animation sequence
        Animated.parallel([
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Update the store after animation
            nutritionStore$.loggedMeals.set({
                ...nutritionStore$.loggedMeals.get(),
                [mealId.toString()]: {
                    loggedAt: new Date().toISOString(),
                    mealId: mealId.toString(),
                }
            });
        });
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#EC4899" />
                <Text className="font-inter-medium mt-4 text-gray-500">Loading recipe...</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="font-inter-medium text-gray-500">Recipe not found</Text>
            </View>
        );
    }

    const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

    // Get meal time based on recipe title/category
    const getMealTime = () => {
        const title = recipe.title.toLowerCase();
        if (title.includes("breakfast") || title.includes("oatmeal") || title.includes("toast") || title.includes("parfait")) {
            return "8:00 AM";
        } else if (title.includes("lunch") || title.includes("salad") || title.includes("wrap") || title.includes("bowl")) {
            return "12:30 PM"; 
        } else if (title.includes("snack") || title.includes("protein") || title.includes("energy")) {
            return "3:30 PM";
        } else {
            return "7:00 PM"; // dinner default
        }
    };

    return (
        <ScrollView className="flex-1 bg-background">
            {/* Header Image */}
            <View className="relative h-[200px]">
                <Image
                    source={{ uri: recipe.imageUrl || defaultImage }}
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
                    <Animated.View
                        style={{
                            transform: [
                                { scale: scaleAnim },
                                { rotate: isLogged ? '0deg' : spin }
                            ],
                        }}
                    >
                        {isLogged ? (
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                <Ionicons name="checkmark" size={24} color="white" />
                            </View>
                        ) : (
                            <Pressable
                                onPress={handleLogMeal}
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: '#EC4899' }}
                            >
                                <MaterialCommunityIcons name="plus" size={24} color="white" />
                            </Pressable>
                        )}
                    </Animated.View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Title and Status */}
                <View className="py-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-inter-bold text-2xl text-black">
                            {recipe.title}
                        </Text>
                        {isLogged && loggedMeal && (
                            <Text className="font-inter-medium text-sm text-green-500">
                                Logged at {new Date(loggedMeal.loggedAt).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <Text className="font-inter-medium mt-1 text-gray-500">
                        {getMealTime()}
                    </Text>
                </View>

                {/* Nutrition Info */}
                <View className="flex-row justify-between py-4">
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Calories</Text>
                        <Text className="font-inter-bold text-xl">{recipe.calories}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Protein</Text>
                        <Text className="font-inter-bold text-xl">{recipe.proteinGrams}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Carbs</Text>
                        <Text className="font-inter-bold text-xl">{recipe.carbsGrams}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Fats</Text>
                        <Text className="font-inter-bold text-xl">{recipe.fatsGrams}g</Text>
                    </View>
                </View>

                {/* Ingredients */}
                <View className="py-4">
                    <Text className="font-inter-bold mb-4 text-xl text-black">
                        Ingredients
                    </Text>
                    <View className="gap-y-3">
                        {recipe.ingredients ? (
                            recipe.ingredients.map((ingredient, index) => (
                                <View
                                    key={index}
                                    className="flex-row items-center"
                                >
                                    <View className="mr-3 h-6 w-6 items-center justify-center rounded-full border border-gray-200" />
                                    <Text className="font-inter text-base text-gray-800">
                                        {ingredient.amount} {ingredient.unit} {ingredient.ingredientName}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text className="font-inter text-gray-500">No ingredients available</Text>
                        )}
                    </View>
                </View>

                {/* Instructions */}
                <View className="py-4">
                    <Text className="font-inter-bold mb-4 text-xl text-black">
                        Instructions
                    </Text>
                    <View className="gap-y-4">
                        {recipe.instructions ? (
                            recipe.instructions.map((instruction, index) => (
                                <View
                                    key={index}
                                    className="flex-row"
                                >
                                    <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                                        <Text className="font-inter-medium text-black">
                                            {instruction.stepNumber}
                                        </Text>
                                    </View>
                                    <Text className="flex-1 font-inter text-base text-gray-800">
                                        {instruction.instruction}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text className="font-inter text-gray-500">No instructions available</Text>
                        )}
                    </View>
                </View>

                {/* Bottom Padding */}
                <View className="h-8" />
            </ScrollView>
        </ScrollView>
    )
};

export default RecipeDetailScreen; 