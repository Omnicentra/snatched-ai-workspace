import Image from "next/image"
import { Card, CardContent, CardFooter } from "@omc/ui/card"
import { Star } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah J.",
      role: "Fitness Enthusiast",
      content:
        "Snatched AI has completely transformed my fitness journey! The personalized workout plans and meal suggestions are exactly what I needed. I've seen amazing results in just 8 weeks!",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Michelle T.",
      role: "Busy Professional",
      content:
        "As someone with a hectic schedule, I love how Snatched AI makes it easy to stay on track. The daily task manager keeps me accountable, and the styling tips are an amazing bonus!",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Jessica K.",
      role: "New Mom",
      content:
        "After having my baby, I struggled to find a fitness routine that worked for me. Snatched AI's personalized approach helped me regain my confidence and strength. The before & after feature is so motivating!",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Community</span> Says
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join thousands of women who have transformed their bodies and boosted their confidence with Snatched AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-pink-100 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-pink-500 text-pink-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
              </CardContent>
              <CardFooter className="flex items-center space-x-4 border-t border-pink-100 pt-4">
                <div className="rounded-full overflow-hidden w-12 h-12 border-2 border-pink-200">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-pink-600 font-medium">
            <span>See more success stories</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
