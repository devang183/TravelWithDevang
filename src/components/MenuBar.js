'use client';
import { useState, useEffect } from 'react'
import { Home, MapPin, Menu, X } from "lucide-react"
import Link from 'next/link'
import { AuthButton } from './AuthButton'

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
  }
  // Add more menu items as needed
]

export function MenuBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Check if at top of page
          if (currentScrollY < 10) {
            setIsAtTop(true);
            setIsVisible(true);
          } else {
            setIsAtTop(false);

            // Show on scroll up, hide on scroll down
            if (currentScrollY < lastScrollY) {
              setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
              setIsVisible(false);
              setIsOpen(false); // Close mobile menu on scroll down
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${
          isAtTop ? 'bg-white/10 backdrop-blur-sm shadow-sm' : 'bg-white/30 backdrop-blur-md shadow-lg'
        } border-b border-white/10`}
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
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-baseline space-x-4">
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
            <AuthButton />
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
