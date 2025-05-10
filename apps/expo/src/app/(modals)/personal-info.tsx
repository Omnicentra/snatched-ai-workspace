import { Ionicons } from '@expo/vector-icons'
import { authClient } from '@/utils/auth'
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
  TextInput,
  View,
} from 'react-native'

const InfoField = ({ 
  label, 
  value, 
  onChangeText,
  placeholder,
  editable = true,
  readOnly = false,
}: { 
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  editable?: boolean
  readOnly?: boolean
}) => (
  <View className="mb-6">
    <Text className="font-inter-medium mb-2 text-sm text-gray-600">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      editable={editable}
      className={`rounded-xl border border-gray-200 bg-white px-4 py-3 font-inter text-base text-gray-900 ${!editable ? 'bg-gray-50' : ''}`}
      placeholderTextColor="#9CA3AF"
      readOnly={readOnly}
    />
  </View>
)

export default function PersonalInfoScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')

  // Load user data
  React.useEffect(() => {
    async function loadUserData() {
      setIsLoading(true)
      try {
        const { data: session } = await authClient.getSession()
        if (session?.user) {
          setName(session.user.name || '')
          setEmail(session.user.email || '')
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }
    void loadUserData()
  }, [])

  // Save user data
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await authClient.updateUser({
        name,
      })
      Alert.alert('Success', 'Your information has been updated')
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to update user information')
    } finally {
      setIsSaving(false)
    }
  }

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
          <Text className="font-inter-bold text-xl text-gray-900">Personal Information</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="rounded-2xl bg-white p-6 shadow-sm">
          <InfoField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />
          <InfoField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            editable={false}
            readOnly={true}
          />
          

          {/* Save Button */}
          <Pressable
            className={`mt-4 w-full items-center justify-center rounded-xl py-4 ${isSaving ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-inter-medium text-white">Save Changes</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  )
} 