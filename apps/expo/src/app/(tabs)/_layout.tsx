import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f472b6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 87 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter_500Medium'
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Snatched',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="chart-bar-stacked" 
              size={26} 
              color={color} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons 
              name="dumbbell" 
              size={26} 
              color={color} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons 
              name="silverware-fork-knife" 
              size={26} 
              color={color} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="nutrition-old"
        options={{
          href: null
        }}
      />
    </Tabs>
  )
}
