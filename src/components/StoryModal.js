'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, User, Utensils, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * StoryModal - Full-screen story viewer
 * Instagram Stories-inspired interface for immersive storytelling
 */
export default function StoryModal({ story, isOpen, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Reset photo index when story changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [story?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') previousPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPhotoIndex, story]);

  if (!story) return null;

  const photos = story.photos || [story.coverPhoto];
  const currentPhoto = photos[currentPhotoIndex];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const previousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: story.type === 'people' ? story.name : story.dish,
      text: story.quote || 'Check out this story from Travel with Devang',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const Icon = story.type === 'people' ? User : Utensils;
  const primaryColor = story.type === 'people' ? 'cyan' : 'orange';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all group"
            aria-label="Close story"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-16 z-50 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all group"
            aria-label="Share story"
          >
            <Share2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Main content */}
          <div className="h-full w-full flex flex-col lg:flex-row">
            {/* Left side: Photo carousel */}
            <div className="relative lg:w-2/3 h-1/2 lg:h-full bg-black flex items-center justify-center">
              {/* Photo */}
              <motion.img
                key={currentPhotoIndex}
                src={currentPhoto}
                alt={story.name || story.dish}
                className="max-h-full max-w-full object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Navigation arrows (if multiple photos) */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={previousPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>

                  {/* Photo indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentPhotoIndex
                            ? `w-8 bg-${primaryColor}-400`
                            : 'w-1.5 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right side: Story content */}
            <div className="lg:w-1/3 h-1/2 lg:h-full bg-gradient-to-br from-gray-900 to-black overflow-y-auto">
              <div className="p-6 lg:p-8">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-6">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${primaryColor}-500/20 border border-${primaryColor}-500/50`}>
                    <Icon className={`w-4 h-4 text-${primaryColor}-400`} />
                    <span className="text-xs font-bold text-white tracking-wider">
                      {story.type === 'people' ? 'PEOPLE' : 'FOOD'}
                    </span>
                  </div>
                  {story.featured && (
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold text-white">
                      FEATURED
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {story.type === 'people' ? story.name : story.dish}
                </h2>

                {/* Subtitle */}
                {story.type === 'people' && story.role && (
                  <p className={`text-lg text-${primaryColor}-400 font-medium mb-4`}>{story.role}</p>
                )}
                {story.type === 'food' && story.restaurant && (
                  <p className={`text-lg text-${primaryColor}-400 font-medium mb-4`}>{story.restaurant}</p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-6">
                  {story.days && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{story.days}</span>
                    </div>
                  )}
                  {story.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(story.date)}</span>
                    </div>
                  )}
                  {story.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{story.location.places?.[0]?.name || 'Location'}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

                {/* Story content */}
                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-white/90 leading-relaxed whitespace-pre-line">
                    {story.story}
                  </p>
                </div>

                {/* Quote (if available) */}
                {story.quote && (
                  <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-white/80 mb-6">
                    {story.quote}
                  </blockquote>
                )}

                {/* Food-specific details */}
                {story.type === 'food' && (
                  <div className="space-y-4 mb-6">
                    {story.taste && (
                      <div>
                        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">The Taste</h4>
                        <p className="text-white/90">{story.taste}</p>
                      </div>
                    )}
                    {story.cost && (
                      <div>
                        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Cost</h4>
                        <p className="text-white/90">{story.cost}</p>
                      </div>
                    )}
                    {story.sharedWith && (
                      <div>
                        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Shared With</h4>
                        <p className="text-white/90">{story.sharedWith}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* People-specific details */}
                {story.type === 'people' && story.sharedMeals && story.sharedMeals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3">Meals Shared</h4>
                    <div className="space-y-2">
                      {story.sharedMeals.map((meal, index) => (
                        <div key={index} className="text-white/90">
                          <span className="font-medium">{meal.dish}</span>
                          {meal.restaurant && <span className="text-white/60"> at {meal.restaurant}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 border border-white/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
