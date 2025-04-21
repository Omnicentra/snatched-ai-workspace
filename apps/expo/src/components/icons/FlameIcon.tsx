import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface FlameIconProps {
  size?: number
  color?: string
}

export default function FlameIcon({ size = 60, color = "#FFFFFF" }: FlameIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.75C9.92 6.4 8.25 9.1 8.25 11.25C8.25 13.9 9.9 16.05 12 16.05C14.1 16.05 15.75 13.9 15.75 11.25C15.75 9.1 14.08 6.4 12 3.75ZM12 2C15.17 5.91 17.25 9.34 17.25 11.25C17.25 14.59 14.94 17.55 12 17.55C9.06 17.55 6.75 14.59 6.75 11.25C6.75 9.34 8.83 5.91 12 2Z"
        fill={color}
      />
    </Svg>
  )
} 