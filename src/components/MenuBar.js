'use client';
import { useState, useEffect } from 'react'
import { Home, MapPin, Menu, X, BarChart3 } from "lucide-react"
import Link from 'next/link'

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "City Explorer",
    url: "/test-cities",
    icon: MapPin,
  },
  {
    title: "Flutter",
    url: "/flutter-presentation",
    icon: MapPin,
  },
  {
    title: "Performance Analysis",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Regulatory Data Analysis",
    url: "/regulatory-data-analysis",
    icon: BarChart3,
  }
  // Add more menu items as needed
]

export function MenuBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Auto-hide menu bar after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Show menu bar when hovering near the top
  const handleMouseMove = (e) => {
    if (e.clientY <= 50) { // Show when mouse is within 50px of top
      setIsVisible(true)
    } else if (e.clientY > 80) { // Hide when mouse moves away from top area
      setIsVisible(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-lg border-b border-white/20 shadow-lg transition-all duration-500 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span 
                className="text-xl font-bold text-white drop-shadow-lg"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Travel With Devang
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-colors duration-200"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-colors duration-200"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/20 backdrop-blur-lg border-t border-white/20">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-white/20 transition-colors duration-200"
                style={{ fontFamily: '"Playfair Display", serif' }}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
