import { Button } from "@omc/ui/button"
import { Input } from "@omc/ui/input"
import { AppStoreButton } from "~/components/app-store-button"

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 gradient-bg text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Snatched?</h2>
          <p className="text-lg mb-8 text-white/90">
            Join thousands of women who are transforming their bodies and boosting their confidence with Snatched AI.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Get Early Access</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Button className="bg-white text-pink-500 hover:bg-white/90 transition-colors">Join Waitlist</Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <AppStoreButton href="#" variant="apple" className="mx-auto sm:mx-0" />
            <AppStoreButton href="#" variant="google" className="mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
