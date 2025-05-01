import { Text } from 'react-native';
import React from 'react';
import { usePathname } from 'expo-router';

interface BubbleLetterProps {
  children: string;
  _delay: number;
}

export const BubbleLetter = ({ children, _delay }: BubbleLetterProps) => {
  const pathname = usePathname();
  const isAuthRoute = ['/login', '/signup'].includes(pathname);

  return (
    <Text
      className={`ml-1 font-bubbly-bold text-4xl tracking-widest ${isAuthRoute ? 'text-primary' : 'text-white'}`}
      style={{
        textShadowColor: isAuthRoute ? 'rgba(219, 39, 119, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0
      }}
    >
      {children}
    </Text>
  );
}; 