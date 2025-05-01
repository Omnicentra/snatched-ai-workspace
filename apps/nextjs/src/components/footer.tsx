import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"

// Custom TikTok icon since it's not in Lucide by default
function TikTok() {
  return (
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
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
      </svg>
  )
}

export default function Footer() {
  return (
      <footer id="footer" className="bg-white py-8 border-t border-pink-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/images/logo-pink.png" alt="Snatched AI Logo" width={40} height={40} className="w-10 h-10" />
                <span className="text-xl font-bold gradient-text">Snatched AI</span>
              </Link>

              <p className="text-gray-600 md:ml-4 mt-2 md:mt-0">Your confidence-boosting bestie in your pocket.</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-pink-500"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
                <span className="text-gray-600">hello@snatchedai.com</span>
              </div>

              <div className="flex space-x-4">
                <Link href="#" className="text-pink-500 hover:text-pink-600 transition-colors">
                  <Instagram size={22} />
                </Link>
                <Link href="#" className="text-pink-500 hover:text-pink-600 transition-colors">
                  <TikTok />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-pink-100 pt-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Snatched AI. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="#contact" className="text-sm text-gray-500 hover:text-pink-500">
                Support
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-pink-500">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-pink-500">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
  )
}
