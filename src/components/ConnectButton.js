'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mail, Linkedin, Users, Lightbulb, ChevronRight, Phone } from 'lucide-react';

const contactOptions = [
  {
    icon: Users,
    label: 'Become a Contributor',
    description: 'Share your travel stories & photos',
    href: '/contributors',
    color: 'from-purple-500 to-pink-500',
    internal: true
  },
  {
    icon: Lightbulb,
    label: 'Collaborate',
    description: 'Ideas, partnerships & projects',
    href: 'mailto:kankariadevang@gmail.com?subject=Collaboration%20Inquiry%20-%20Travel%20With%20Devang',
    color: 'from-amber-500 to-orange-500',
    internal: false
  },
  {
    icon: Mail,
    label: 'Say Hello',
    description: 'Questions, feedback or just to connect',
    href: 'mailto:kankariadevang@gmail.com?subject=Hello%20from%20Travel%20With%20Devang',
    color: 'from-blue-500 to-cyan-500',
    internal: false
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    description: 'Let\'s connect professionally',
    href: 'https://www.linkedin.com/in/devang-kankaria-89ba7b15b/',
    color: 'from-blue-600 to-blue-700',
    internal: false
  },
  {
    icon: Phone,
    label: 'Call / WhatsApp',
    description: '+91 82087 76174',
    href: 'https://wa.me/918208776174?text=Hi%20Devang!%20I%20found%20you%20through%20your%20website%20%27Travel%20With%20Devang%27.%20Can%20I%20talk%20to%20you%20for%20a%20sec%3F',
    color: 'from-green-500 to-emerald-600',
    internal: false
  }
];

export default function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium text-sm sm:text-base">Let&apos;s Connect</span>
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Hey there!</h3>
                    <p className="text-sm text-white/80 mt-0.5">
                      I&apos;m Devang, the creator of this project
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-600 mb-4 px-2">
                  Whether you want to share your travel stories, have an idea, or just want to say hi — I&apos;d love to hear from you.
                </p>

                {contactOptions.map((option, index) => (
                  <motion.a
                    key={option.label}
                    href={option.href}
                    target={option.internal ? '_self' : '_blank'}
                    rel={option.internal ? '' : 'noopener noreferrer'}
                    onClick={() => option.internal && setIsOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${option.color} text-white`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500 truncate">{option.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                  </motion.a>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Built with passion for travel enthusiasts worldwide
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
