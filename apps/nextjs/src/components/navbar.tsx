"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@omc/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo-pink.png" alt="Snatched AI Logo" width={40} height={40} className="w-10 h-10" />
            <span className="text-2xl font-bold gradient-text">Snatched AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-500 font-medium">
              Home
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-pink-500 font-medium">
              Features
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-pink-500 font-medium">
              Contact
            </Link>
            <Button className="gradient-bg hover:opacity-90 transition-opacity">Get the App</Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-pink-500 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="block text-gray-700 hover:text-pink-500 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="block text-gray-700 hover:text-pink-500 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Button className="w-full gradient-bg hover:opacity-90 transition-opacity">Get the App</Button>
          </div>
        )}
      </div>
    </nav>
  )
}
