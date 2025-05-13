import Image from "next/image"
import { AppStoreButton } from "~/components/app-store-button"

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your <span className="gradient-text">Confidence-Boosting</span> Bestie in Your Pocket
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Visualise, achieve, and track your ideal body shape through personalised AI plans combining workouts,
              nutrition, body analysis, and styling tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <AppStoreButton href="https://apps.apple.com/us/app/snatched-ai-slay-your-shape/id6744844397" variant="apple" lightGradient={true} />
              <AppStoreButton href="#" variant="google" lightGradient={true} comingSoon={true} />
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-[300px] h-[600px] md:w-[350px] md:h-[700px]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-pink-500 rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-pink-200 shadow-xl">
                <Image
                  src="/placeholder.svg?height=700&width=350"
                  alt="Snatched AI App Preview"
                  width={350}
                  height={700}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
