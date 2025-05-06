import type { SnatchHack } from "../types";

export const SNATCH_HACKS: SnatchHack[] = [
  {
    id: 1,
    title: "Posture Check",
    description: "Set hourly reminders to check your posture. Good posture instantly makes you look more toned and confident.",
    icon: "sparkles-outline",
    color: "#A855F7",
    bgColor: "bg-purple-50",
    benefits: [
      {
        text: "Improves core strength and stability",
        iconName: "fitness-outline",
        iconType: "ionicons"
      },
      {
        text: "Reduces back and neck pain",
        iconName: "body-outline",
        iconType: "ionicons"
      },
      {
        text: "Enhances breathing and energy levels",
        iconName: "battery-charging-outline",
        iconType: "ionicons"
      }
    ],
    instructions: [
      'Set an hourly reminder on your phone',
      'When it rings, check your posture: shoulders back, chin tucked',
      'Engage your core and straighten your spine',
      'Hold this position for 30 seconds',
      'Try to maintain awareness throughout the day'
    ]
  },
  {
    id: 2,
    title: "Water Intake",
    description: "Drink a glass of water before each meal. This helps with portion control and keeps your skin glowing.",
    icon: "water-outline",
    color: "#60A5FA",
    bgColor: "bg-blue-50",
    benefits: [
      {
        text: "Hydrates your body after overnight fasting",
        iconName: "water-outline",
        iconType: "ionicons"
      },
      {
        text: "Stimulates digestion and reduces bloating",
        iconName: "stomach",
        iconType: "material-community"
      },
      {
        text: "Provides electrolytes for better hydration",
        iconName: "battery-charging-outline",
        iconType: "ionicons"
      }
    ],
    instructions: [
      'Heat 8oz of water until warm (not boiling)',
      'Squeeze half a lemon into the water',
      'Add a small pinch of pink Himalayan salt',
      'Drink first thing in the morning on an empty stomach'
    ]
  },
  {
    id: 3,
    title: "Mindful Eating",
    description: "Put your fork down between bites. This simple habit helps you eat slower and recognize fullness signals better.",
    icon: "restaurant-outline",
    color: "#F472B6",
    bgColor: "bg-pink-50",
    benefits: [
      {
        text: "Better digestion and nutrient absorption",
        iconName: "stomach",
        iconType: "ionicons"
      },
      {
        text: "Natural portion control through mindfulness",
        iconName: "scale-balance",
        iconType: "material-community"
      },
      {
        text: "Enhanced enjoyment of your meals",
        iconName: "happy-outline",
        iconType: "ionicons"
      }
    ],
    instructions: [
      'Take a deep breath before starting your meal',
      'Put your fork down between each bite',
      'Chew each bite 20-30 times',
      'Notice the flavors and textures',
      'Wait 5 seconds before taking another bite'
    ]
  },
  {
    id: 4,
    title: "Active Breaks",
    description: "Take a 2-minute stretch break every hour. Small movement breaks add up and improve your metabolism.",
    icon: "fitness-outline",
    color: "#10B981",
    bgColor: "bg-green-50",
    benefits: [
      {
        text: "Boosts metabolism and energy levels",
        iconName: "flash-outline",
        iconType: "ionicons"
      },
      {
        text: "Improves circulation and flexibility",
        iconName: "run",
        iconType: "material-community"
      },
      {
        text: "Reduces muscle tension and stiffness",
        iconName: "body-outline",
        iconType: "ionicons"
      }
    ],
    instructions: [
      'Set a timer for every hour of work',
      'Stand up and stretch your arms overhead',
      'Do 10 desk squats or wall pushups',
      'March in place for 30 seconds',
      'Take 5 deep breaths before returning to work'
    ]
  },
  {
    id: 5,
    title: "Sleep Prep",
    description: "Set a bedtime alarm. Quality sleep is crucial for muscle recovery and maintaining a healthy weight.",
    icon: "moon-outline",
    color: "#6366F1",
    bgColor: "bg-indigo-50",
    benefits: [
      {
        text: "Optimizes hormone balance for fat loss",
        iconName: "trending-down",
        iconType: "material-community"
      },
      {
        text: "Enhances muscle recovery and growth",
        iconName: "fitness-outline",
        iconType: "ionicons"
      },
      {
        text: "Reduces late-night snacking urges",
        iconName: "food-apple-outline",
        iconType: "material-community"
      }
    ],
    instructions: [
      'Set a bedtime alarm for 30 minutes before sleep',
      'Dim lights and switch devices to night mode',
      'Do 5 minutes of light stretching',
      'Practice deep breathing or meditation',
      'Keep your bedroom cool and dark'
    ]
  }
]; 