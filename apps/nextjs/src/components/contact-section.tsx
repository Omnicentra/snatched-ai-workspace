'use client';

import { useState } from "react"
import { AppStoreButton } from "~/components/app-store-button"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    
    try {
      const recipients = ["support@omnicentra.com", "chisom@omnicentra.com"]
      const subject = `Support Request from ${formData.name}`
      const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      
      // Create mailto URL with all recipients
      const mailtoUrl = `mailto:${recipients.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      // Open email client
      window.location.href = mailtoUrl
      
      setSubmitSuccess(true)
      setFormData({ name: "", email: "", message: "" })
    } catch {
      setSubmitError("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="gradient-bg text-white py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Have questions or need assistance? We're here to help! Fill out the form below
            and our support team will get back to you as soon as possible.
          </p>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white/10 backdrop-blur-md p-8 shadow-lg">
          {submitSuccess ? (
            <div className="rounded-md bg-white/10 p-4 text-center">
              <p className="text-lg font-medium text-white">
                Thank you for reaching out! We'll get back to you soon.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-4 rounded-md bg-white px-4 py-2 text-pink-500 hover:bg-white/90"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md bg-white/20 border-white/30 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md bg-white/20 border-white/30 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md bg-white/20 border-white/30 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="How can we help you?"
                />
              </div>
              {submitError && (
                <div className="rounded-md bg-red-500/20 p-4">
                  <p className="text-sm text-white">
                    {submitError}
                  </p>
                </div>
              )}
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-pink-500 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mx-auto max-w-md text-center mt-12">
          <h3 className="text-xl font-bold mb-4">
            Download Our App
          </h3>
          <p className="text-white/90 mb-6">
            Get support instantly and track your progress with our mobile app
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <AppStoreButton href="#" variant="apple" className="mx-auto sm:mx-0" />
            <AppStoreButton href="#" variant="google" className="mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
    </section>
  )
} 