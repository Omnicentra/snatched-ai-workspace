"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@omc/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo-pink.png"
              alt="Snatched AI Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="gradient-text text-2xl font-bold">
              Snatched AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-pink-500"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="font-medium text-gray-700 hover:text-pink-500"
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="font-medium text-gray-700 hover:text-pink-500"
            >
              Contact
            </Link>
            <Link
              href="https://apps.apple.com/us/app/snatched-ai-slay-your-shape/id6744844397"
              passHref
            >
              <Button className="gradient-bg transition-opacity hover:opacity-90">
                Get the App
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="text-gray-700 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="space-y-4 py-4 md:hidden">
            <Link
              href="/"
              className="block font-medium text-gray-700 hover:text-pink-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="block font-medium text-gray-700 hover:text-pink-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="block font-medium text-gray-700 hover:text-pink-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="https://apps.apple.com/us/app/snatched-ai-slay-your-shape/id6744844397"
              passHref
              target="_blank"
            >
              <Button className="gradient-bg w-full transition-opacity hover:opacity-90">
                Get the App
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
