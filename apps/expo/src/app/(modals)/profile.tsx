import { authClient } from '@/utils/auth'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  Linking,
} from 'react-native'

const MenuItem = ({ 
  icon, 
  label, 
  onPress,
  showBorder = true,
}: { 
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBorder?: boolean;
}) => (
  <Pressable 
    onPress={onPress}
    className={`flex-row items-center py-4 ${showBorder ? 'border-b border-gray-100' : ''}`}
  >
    <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-gray-50">
      {icon}
    </View>
    <Text className="flex-1 font-inter-medium text-base text-gray-900">{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [userName, setUserName] = React.useState('')

  // Load user data
  React.useEffect(() => {
    async function loadUserData() {
      setIsLoading(true)
      try {
        const { data: session } = await authClient.getSession()
        if (session?.user) {
          setUserName(session.user.name)
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }
    void loadUserData()
  }, [])

  const menuItems = [
    {
      icon: <Ionicons name="person-outline" size={18} color="#1F2937" />,
      label: 'Personal Information',
      onPress: () => router.push('/(modals)/personal-info')
    },
    {
      icon: <Ionicons name="card-outline" size={18} color="#1F2937" />,
      label: 'Subscription',
      onPress: () => console.log('Navigate to Subscription')
    },
    {
      icon: <Ionicons name="notifications-outline" size={18} color="#1F2937" />,
      label: 'Notifications',
      onPress: () => console.log('Navigate to Notifications')
    },
    {
      icon: <Ionicons name="help-circle-outline" size={18} color="#1F2937" />,
      label: 'Help & Support',
      onPress: () => console.log('Navigate to Help')
    },
    {
      icon: <Ionicons name="document-text-outline" size={18} color="#1F2937" />,
      label: 'Terms & Privacy',
      onPress: async () => {
        await Promise.all([
          Linking.openURL('https://snatchedai.com/terms'),
          Linking.openURL('https://snatchedai.com/privacy')
        ])
      }
    }
  ];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    )
  }

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fce7f3', '#fbcfe8']}
      style={{ flex: 1, paddingTop: Constants.statusBarHeight }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="dark" />
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={20}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/80"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="font-inter-bold text-xl text-gray-900">Profile</Text>
        </View>

        {/* User Info */}
        <View className="mt-8 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-pink-100">
            <Text className="font-inter-bold text-3xl text-pink-500">
              {userName[0]}
            </Text>
          </View>
          <Text className="font-inter-bold text-2xl text-gray-900">{userName}</Text>
          <View className="mt-2 rounded-full bg-pink-50 px-4 py-1">
            <Text className="font-inter-medium text-sm text-pink-500">Premium Member</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="rounded-2xl bg-white p-4 shadow-sm">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
              showBorder={index !== menuItems.length - 1}
            />
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          className="mt-6 w-full items-center justify-center rounded-xl border border-red-200 bg-white py-4 active:bg-red-50"
          onPress={() => {
            void authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.replace('/(auth)/login')
                }
              }
            })
          }}
        >
          <Text className="font-inter-medium text-red-500">Log Out</Text>
        </Pressable>

        {/* Version Number */}
        <Text className="mt-6 text-center font-inter text-sm text-gray-400">
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </LinearGradient>
  );
}
