import React from 'react'
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    Pressable,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Mock data - in a real app, this would come from an API or database
const recipeData = {
    id: 'chicken-salad',
    title: 'Protein-Packed Chicken Salad',
    rating: 4.5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    nutrition: {
        calories: 450,
        protein: 35,
        carbs: 25,
        fats: 20,
        servings: 2
    },
    ingredients: [
        '6 oz grilled chicken breast, diced',
        '2 cups mixed greens',
        '1/2 cup cherry tomatoes, halved',
        '1/4 cup cucumber, sliced',
        '1/4 avocado, diced',
        '2 tbsp olive oil & lemon dressing'
    ],
    instructions: [
        'Grill chicken breast until fully cooked, then dice into bite-sized pieces.',
        'Wash and prepare all vegetables.',
        'In a large bowl, combine mixed greens, tomatoes, cucumber, and avocado.',
        'Add diced chicken on top.',
        'Drizzle with olive oil and lemon dressing, toss everything together.'
    ]
}

export default function RecipeDetailScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()

    // In a real app, you would fetch recipe data based on params.mealId

    return (
        <View className="flex-1 bg-white">
            {/* Header Image */}
            <View className="relative h-[200px]">
                <Image
                    source={{ uri: recipeData.image }}
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
                    <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
                        <Ionicons name="heart-outline" size={24} color="white" />
                    </Pressable>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Title and Rating */}
                <View className="py-4">
                    <Text className="font-inter-bold text-2xl text-black">
                        {recipeData.title}
                    </Text>
                    <View className="mt-2 flex-row items-center">
                        <View className="flex-row">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= Math.floor(recipeData.rating) ? "star" : "star-outline"}
                                    size={16}
                                    color="#FFB800"
                                />
                            ))}
                        </View>
                        <Text className="ml-2 font-inter text-sm text-gray-600">
                            {recipeData.rating} ({recipeData.reviews} reviews)
                        </Text>
                    </View>
                </View>

                {/* Nutrition Info */}
                <View className="flex-row justify-between py-4">
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Calories</Text>
                        <Text className="font-inter-bold text-xl">{recipeData.nutrition.calories}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Protein</Text>
                        <Text className="font-inter-bold text-xl">{recipeData.nutrition.protein}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Carbs</Text>
                        <Text className="font-inter-bold text-xl">{recipeData.nutrition.carbs}g</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-inter-medium text-gray-600">Fats</Text>
                        <Text className="font-inter-bold text-xl">{recipeData.nutrition.fats}g</Text>
                    </View>
                </View>

                {/* Servings */}
                <View className="flex-row items-center justify-between py-2">
                    <Text className="font-inter-bold text-xl text-black">Ingredients</Text>
                    <Pressable className="flex-row items-center">
                        <Text className="font-inter-medium text-gray-600">
                            {recipeData.nutrition.servings} servings
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="black" />
                    </Pressable>
                </View>

                {/* Ingredients */}
                <View className="py-2">
                    {recipeData.ingredients.map((ingredient, index) => (
                        <View
                            key={index}
                            className="mb-3 flex-row items-center"
                        >
                            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full border border-gray-200" />
                            <Text className="font-inter text-base text-gray-800">
                                {ingredient}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Instructions */}
                <View className="py-4">
                    <Text className="mb-4 font-inter-bold text-xl text-black">
                        Instructions
                    </Text>
                    {recipeData.instructions.map((instruction, index) => (
                        <View
                            key={index}
                            className="mb-4 flex-row"
                        >
                            <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                                <Text className="font-inter-medium text-black">
                                    {index + 1}
                                </Text>
                            </View>
                            <Text className="flex-1 font-inter text-base text-gray-800">
                                {instruction}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Bottom Padding */}
                <View className="h-8" />
            </ScrollView>
        </View>
    )
} 