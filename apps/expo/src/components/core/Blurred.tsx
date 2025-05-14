import { ReactNode } from 'react'
import { BlurView } from 'expo-blur'
import { View } from 'react-native'

interface BlurredProps {
  intensity?: number
  tint?: 'light' | 'dark'
  className?: string
  children: ReactNode
}

export const Blurred = ({ intensity = 8, tint = 'light', children }: BlurredProps) => {
  return (
    <View className='relative justify-center items-center'>
      {children}
      <BlurView
        intensity={intensity}
        tint='light'
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          marginRight: 20,
        }}

      />
    </View>
  )
}