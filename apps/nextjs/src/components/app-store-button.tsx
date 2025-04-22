import { cn } from "@omc/ui"
import Link from "next/link"

interface AppStoreButtonProps {
  href: string
  className?: string
  variant: "apple" | "google"
  gradient?: boolean
  lightGradient?: boolean
}

export function AppStoreButton({ href, className, variant, gradient, lightGradient }: AppStoreButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full px-6 py-3 transition-all hover:shadow-lg",
        gradient ? "gradient-bg text-white" : "",
        lightGradient ? "gradient-bg-light text-black" : "",
        !gradient && !lightGradient ? "bg-white text-black" : "",
        className,
      )}
    >
      {variant === "apple" ? (
        <>
          <span className="mr-3">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs leading-none">Download on the</span>
            <span className="text-xl font-bold leading-tight">App Store</span>
          </div>
        </>
      ) : (
        <>
          <span className="mr-3">
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.947 32">
              <g clipPath="url(#a)">
                <path
                  d="M13.519 15.256.12 29.294a3.634 3.634 0 0 0 5.322 2.156l15.075-8.586-6.998-7.608Z"
                  fill="#EA4335"
                ></path>
                <path
                  d="m27.067 12.87-6.52-3.734-7.338 6.44 7.368 7.268 6.47-3.694a3.544 3.544 0 0 0 0-6.28h.02Z"
                  fill="#FBBC04"
                ></path>
                <path
                  d="M.12 2.656c-.081.3-.121.609-.12.919v24.8c0 .31.041.619.12.919l13.858-13.678L.12 2.655Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="m13.618 15.975 6.93-6.84L5.491.51A3.714 3.714 0 0 0 3.624 0 3.634 3.634 0 0 0 .12 2.646l13.498 13.329Z"
                  fill="#34A853"
                ></path>
              </g>
              <defs>
                <clipPath id="a">
                  <path fill="#fff" d="M0 0h28.947v32H0z"></path>
                </clipPath>
              </defs>
            </svg>
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs leading-none">Get it on</span>
            <span className="text-xl font-bold leading-tight">Google Play</span>
          </div>
        </>
      )}
    </Link>
  )
}
