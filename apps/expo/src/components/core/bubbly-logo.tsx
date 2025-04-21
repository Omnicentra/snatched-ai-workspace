// components/BubblyLogo.tsx (Updated or create AnimatedBubblyLogo.tsx)
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { AnimatedBubbleLetter } from './animated-bubble-letter' // Adjust path if needed

export const BubblyLogo = ({loop = true}: {loop?: boolean}) => {
  // Or rename to AnimatedBubblyLogo
  const logoText = 'Snatched AI'
  const characters = logoText.split('') // Split string into array of characters

  return (
    <View style={styles.logoContainer}>
      {characters.map((char, index) => (
        <AnimatedBubbleLetter
          key={`${char}-${index}`} // Use a unique key
          character={char}
          index={index}
          color="#f472b6" 
          loop={loop}
          // You can optionally pass amplitude, duration, delayFactor here
          // amplitude={3}
          // duration={2000}
          // delayFactor={0.12}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row' // Keep letters side-by-side
  }
})

// No need for BubbleLetter definition here anymore if separated
