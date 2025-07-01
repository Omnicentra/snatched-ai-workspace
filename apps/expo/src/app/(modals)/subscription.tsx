import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import Purchases from 'react-native-purchases';
import { formatDate } from '@/lib/utils';

export default function SubscriptionScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [_packages, setPackages] = useState<PurchasesPackage[]>([])
  const [activePlan, setActivePlan] = useState<{
    productId: string
    name: string
    expiry: string | null
    isActive: boolean
  } | null>(null)

  const loadSubscriptionData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get customer info
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(info)

      // Get available packages
      const offerings = await Purchases.getOfferings()
      const availablePackages = offerings.all.default?.availablePackages ?? []
      setPackages(availablePackages)

      // Determine active plan
      if (info.entitlements.active.premium) {
        const activeEntitlement = info.entitlements.active.premium
        
        // Find active package
        const matchingPackage = availablePackages.find(
          pkg => pkg.product.identifier === activeEntitlement.productIdentifier
        )
        
        setActivePlan({
          productId: activeEntitlement.productIdentifier,
          name: matchingPackage?.product.title ?? 'Premium',
          expiry: activeEntitlement.expirationDate,
          isActive: true
        })
      }
    } catch (e) {
      const error = e as Error
      console.error('Error loading subscription data:', error.message)
      Alert.alert('Error', 'Failed to load subscription information')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSubscriptionData()
  }, [loadSubscriptionData])

  const handleManageSubscription = async () => {
    try {
      await Purchases.showManageSubscriptions()
    } catch (e) {
      const error = e as Error
      console.error('Error opening subscription management:', error.message)
      Alert.alert('Error', 'Unable to open subscription management')
    }
  }

  const handleRestorePurchases = async () => {
    setIsLoading(true)
    try {
      const restoredInfo = await Purchases.restorePurchases()
      if (restoredInfo.activeSubscriptions.length > 0) {
        Alert.alert('Success', 'Your purchases have been restored!')
        await loadSubscriptionData()
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore')
      }
    } catch (e) {
      const error = e as Error
      console.error('Error restoring purchases:', error.message)
      Alert.alert('Error', 'Failed to restore purchases')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanStatus = () => {
    if (!customerInfo) return 'Unknown'

    if (activePlan?.isActive) {
      return 'Active'
    } else if (customerInfo.activeSubscriptions.length > 0) {
      return 'Active'
    }
    return 'Inactive'
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
          <Text className="font-inter-bold text-xl text-gray-900">Subscription</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Subscription Status */}
        <View className="rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-lg text-gray-900">Current Plan</Text>
            <View className={`rounded-full px-3 py-1 ${getPlanStatus() === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`font-inter-medium text-sm ${getPlanStatus() === 'Active' ? 'text-green-700' : 'text-gray-700'}`}>
                {getPlanStatus()}
              </Text>
            </View>
          </View>

          {activePlan ? (
            <>
              <View className="mb-2 flex-row justify-between">
                <Text className="font-inter-medium text-base text-gray-700">Plan</Text>
                <Text className="font-inter-semibold text-base text-gray-900">{activePlan.name}</Text>
              </View>
              
              {activePlan.expiry && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="font-inter-medium text-base text-gray-700">Renewal Date</Text>
                  <Text className="font-inter-semibold text-base text-gray-900">
                    {formatDate(new Date(activePlan.expiry))}
                  </Text>
                </View>
              )}

              <View className="mt-6">
                <Pressable
                  className="rounded-xl bg-pink-500 py-3"
                  onPress={handleManageSubscription}
                >
                  <Text className="font-inter-semibold text-center text-white">
                    Manage Subscription
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View className="items-center">
              <Text className="mb-4 text-center font-inter-medium text-gray-500">
                You don't have an active subscription
              </Text>
              <Pressable
                className="rounded-xl bg-pink-500 px-6 py-3"
                onPress={() => router.replace('/(onboarding)/paywall?inactive=true')}
              >
                <Text className="font-inter-semibold text-white">
                  View Premium Plans
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Restore Purchases */}
        <View className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 font-inter-semibold text-lg text-gray-900">Account Actions</Text>
          <Pressable
            className="flex-row items-center justify-between border-b border-gray-100 py-3"
            onPress={handleRestorePurchases}
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                <Ionicons name="refresh" size={18} color="#1F2937" />
              </View>
              <Text className="font-inter-medium text-base text-gray-900">Restore Purchases</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          
          <Pressable
            className="flex-row items-center justify-between py-3"
            onPress={() => Linking.openURL('https://snatchedai.com/terms')}
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                <Ionicons name="document-text-outline" size={18} color="#1F2937" />
              </View>
              <Text className="font-inter-medium text-base text-gray-900">Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* About RevenueCat */}
        <View className="mt-6 mb-8 items-center">
          <Text className="text-center font-inter text-xs text-gray-400">
            Subscription management powered by RevenueCat
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  )
} 