import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';
import { StyledButton } from '@/components/core';
import { logger } from '@/lib/logger';
import * as Haptics from 'expo-haptics';
import { checkNotificationPermissions, initializeNotifications } from '@/lib/notifications';
import { 
  notificationsStore$, 
  setMorningNotificationTime, 
  setLunchNotificationTime, 
  setDinnerNotificationTime 
} from '@/stores/notifications.store';


// Reusable Animated View for Fade-in effect
const FadeInView = ({
  children,
  delay = 0,
  duration = 1000,
  style
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  style?: object
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: duration, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: duration, easing: Easing.out(Easing.ease) })
    );
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }]
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
};

// Time selection row component
const TimeSelectionRow = ({
  label,
  subLabel,
  time,
  onTimeChange
}: {
  label: string;
  subLabel: string;
  time: Date;
  onTimeChange: (date: Date) => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onTimeChange(selectedDate);
    }
  };

  const formattedTime = time.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  return (
    <View className="mb-6 rounded-3xl bg-white p-4 shadow-sm border border-gray-100">
      <Pressable 
        className="flex-row items-center justify-between" 
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {
            if (Platform.OS === 'ios') {
              setShowPicker(!showPicker)
            } else {
              setShowPicker(true)
            }
          })
        }}
      >
        <View>
          <Text className="font-inter-bold text-xl text-gray-900">{label}</Text>
          <Text className="font-inter text-sm text-gray-500">{subLabel}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="font-inter-bold text-xl mr-2 text-gray-900">{formattedTime}</Text>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={time}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
};

function NotificationTimeScreen() {
  const router = useRouter();
  
  // Get default values from store for morning
  const [morningTime, setMorningTime] = useState(() => {
    const defaultHour = notificationsStore$.times.morning.hour.get();
    const defaultMinute = notificationsStore$.times.morning.minute.get();
    
    const time = new Date();
    time.setHours(defaultHour, defaultMinute, 0, 0);
    return time;
  });
  
  // Get default values from store for lunch
  const [lunchTime, setLunchTime] = useState(() => {
    const defaultHour = notificationsStore$.times.lunch.hour.get();
    const defaultMinute = notificationsStore$.times.lunch.minute.get();
    
    const time = new Date();
    time.setHours(defaultHour, defaultMinute, 0, 0);
    return time;
  });
  
  // Get default values from store for dinner
  const [dinnerTime, setDinnerTime] = useState(() => {
    const defaultHour = notificationsStore$.times.dinner.hour.get();
    const defaultMinute = notificationsStore$.times.dinner.minute.get();
    
    const time = new Date();
    time.setHours(defaultHour, defaultMinute, 0, 0);
    return time;
  });

  const handleSaveAndContinue = async () => {
    try {
      // Verify permissions first
      const permissionGranted = await checkNotificationPermissions();
      if (!permissionGranted) {
        logger.warn("No notification permission granted; navigating to home");
        router.push('/(tabs)/home');
        return;
      }
      
      // Save all notification times to our store
      setMorningNotificationTime(morningTime.getHours(), morningTime.getMinutes());
      setLunchNotificationTime(lunchTime.getHours(), lunchTime.getMinutes());
      setDinnerNotificationTime(dinnerTime.getHours(), dinnerTime.getMinutes());
      
      // Initialize all notifications with the user's preferred times
      await initializeNotifications();
      
      logger.info(`Notification times saved: 
        Morning: ${morningTime.getHours()}:${morningTime.getMinutes()}, 
        Lunch: ${lunchTime.getHours()}:${lunchTime.getMinutes()}, 
        Dinner: ${dinnerTime.getHours()}:${dinnerTime.getMinutes()}`);
      
      // Navigate to home screen
      router.push('/(tabs)/home');
    } catch (error) {
      logger.error('Error setting up notifications:', error instanceof Error ? error.message : String(error));
      // On error, still proceed to home
      router.push('/(tabs)/home');
    }
  };

  return (
    <View
      className="relative flex-1 bg-white"
      style={{ paddingTop: Constants.statusBarHeight }}
    >
      <StatusBar translucent={true} />
      
      {/* Background Shapes */}
      <View
        style={StyleSheet.absoluteFill}
        className="-z-10 overflow-hidden opacity-50"
      >
        <View style={styles.shape1} />
        <View style={styles.shape2} />
        <View style={styles.shape3} />
      </View>

      {/* Header */}
      <View className="px-8 mt-12 mb-8">
        <FadeInView delay={300} duration={1000}>
          <Text className="text-center font-inter-bold text-3xl text-gray-900">
            What Time Works For You?
          </Text>
        </FadeInView>
        <FadeInView delay={600} duration={1000}>
          <Text className="text-center font-inter-medium text-base mt-4 text-gray-600">
            We'll send you motivational reminders to help you stay on track with your fitness journey
          </Text>
        </FadeInView>
      </View>

      {/* Time Selections */}
      <View className="px-8 flex-1">
        <FadeInView delay={900} duration={1000} style={{ marginBottom: 0 }}>
          <TimeSelectionRow
            label="Morning"
            subLabel="Set up your breakfast time"
            time={morningTime}
            onTimeChange={setMorningTime}
          />
        </FadeInView>
        
        <FadeInView delay={1100} duration={1000} style={{ marginBottom: 0 }}>
          <TimeSelectionRow
            label="Lunch"
            subLabel="Set up your lunch time"
            time={lunchTime}
            onTimeChange={setLunchTime}
          />
        </FadeInView>
        
        <FadeInView delay={1300} duration={1000} style={{ marginBottom: 0 }}>
          <TimeSelectionRow
            label="Dinner"
            subLabel="Set up your dinner time"
            time={dinnerTime}
            onTimeChange={setDinnerTime}
          />
        </FadeInView>
      </View>

      {/* Bottom Button */}
      <View className="px-8 mb-8">
        <FadeInView delay={1500} duration={1000}>
          <StyledButton
            title="Continue"
            onPress={handleSaveAndContinue}
            variant="primary"
          />
        </FadeInView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shape1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: '#FF9A9E',
    borderRadius: 150,
    opacity: 0.2,
    top: -100,
    left: -100
  },
  shape2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#FAD0C4',
    borderRadius: 100,
    opacity: 0.2,
    bottom: -50,
    right: -50
  },
  shape3: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: '#FFECD2',
    borderRadius: 75,
    opacity: 0.2,
    top: '50%',
    right: -50
  }
});

export default withOnboardingTracking(NotificationTimeScreen, 'notification_time'); 