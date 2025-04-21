import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';

export function ProfileIcon({ size = 24, color = '#292D32', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12.16 10.87c-.1-.01-.22-.01-.33 0-2.38-.08-4.27-2.03-4.27-4.43 0-2.45 1.98-4.44 4.44-4.44 2.45 0 4.44 1.99 4.44 4.44-.01 2.4-1.9 4.35-4.28 4.43Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.16 14.56c-2.42 1.62-2.42 4.26 0 5.87 2.75 1.84 7.26 1.84 10.01 0 2.42-1.62 2.42-4.26 0-5.87-2.74-1.83-7.25-1.83-10.01 0Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
} 