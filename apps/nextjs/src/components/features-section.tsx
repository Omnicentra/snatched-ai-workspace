import { Camera, Calendar, Sparkles, BarChart3, Utensils, Lightbulb, Shirt, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@omc/ui/card"

export default function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Body Analysis",
      description:
        "3-photo scanner with front, side, back input to estimate waist/hip ratio, body shape, posture, and transformation timeline.",
      icon: <Camera className="h-12 w-12 text-pink-500" />,
    },
    {
      title: "Plan Generator Engine",
      description:
        "Create custom plans from user input and scan analysis, including daily workouts, meal plans, snatch hacks, and styling tips.",
      icon: <Sparkles className="h-12 w-12 text-pink-500" />,
    },
    {
      title: "Daily Plan & Task Manager",
      description:
        "Auto-generates daily task page with workout, meal, hack, and style recommendations. Track task completion with motivational copy & streaks.",
      icon: <Calendar className="h-12 w-12 text-pink-500" />,
    },
    {
      title: "Photorealistic Before & After",
      description: "Display side-by-side comparison to visualize your transformation journey.",
      icon: <BarChart3 className="h-12 w-12 text-pink-500" />,
    },
  ]

  const subFeatures = [
    {
      title: "Daily Workouts",
      description: "Video and text-based workouts tailored to your goals.",
      icon: <CheckCircle2 className="h-6 w-6 text-pink-500" />,
    },
    {
      title: "Meal Plans",
      description: "3 meals + snacks designed for your body and preferences.",
      icon: <Utensils className="h-6 w-6 text-pink-500" />,
    },
    {
      title: "Snatch Hacks",
      description: "Quick lifestyle tricks to boost your transformation.",
      icon: <Lightbulb className="h-6 w-6 text-pink-500" />,
    },
    {
      title: "Styling Tips",
      description: "Outfit recommendations and shopping links.",
      icon: <Shirt className="h-6 w-6 text-pink-500" />,
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Playful & Empowering</span> Features
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Snatched AI combines cutting-edge technology with personalized guidance to help you achieve your ideal body
            shape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-pink-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-700">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-center">
            What's Included in Your <span className="gradient-text">Personalized Plan</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div>{feature.icon}</div>
                <div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
