'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Utensils, MapPin, Calendar } from 'lucide-react';

/**
 * StoryCard - Individual story card for people/food experiences
 * Inspired by Anthony Bourdain's Parts Unknown aesthetic
 */
export default function StoryCard({ story, onClick }) {
  // Category styling
  const categoryConfig = {
    people: {
      icon: User,
      label: 'PEOPLE',
      gradient: 'from-blue-500/30 to-cyan-500/30',
      borderColor: 'border-cyan-500/50',
      iconColor: 'text-cyan-400'
    },
    food: {
      icon: Utensils,
      label: 'FOOD',
      gradient: 'from-amber-500/30 to-orange-500/30',
      borderColor: 'border-orange-500/50',
      iconColor: 'text-orange-400'
    }
  };

  const config = categoryConfig[story.type] || categoryConfig.people;
  const Icon = config.icon;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Extract preview text (first 150 characters)
  const getPreviewText = (text) => {
    if (!text) return 'Click to read the story...';
    const cleaned = text.replace(/\[YOUR STORY HERE\]/g, '').trim();
    if (cleaned.length === 0) return 'Click to read the story...';
    return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
  };

  return (
    <motion.div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl cursor-pointer border-2 ${config.borderColor} bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cover Photo */}
      <div className="relative h-64 overflow-hidden">
        {story.coverPhoto ? (
          <img
            src={story.coverPhoto}
            alt={story.name || story.dish}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <Icon className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border ${config.borderColor}`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
            <span className="text-xs font-bold text-white tracking-wider">{config.label}</span>
          </div>
        </div>

        {/* Featured badge */}
        {story.featured && (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold text-white shadow-lg">
              FEATURED
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {story.type === 'people' ? story.name : story.dish}
        </h3>

        {/* Subtitle */}
        {story.type === 'people' && story.role && (
          <p className="text-sm text-cyan-400 font-medium mb-3">{story.role}</p>
        )}
        {story.type === 'food' && story.restaurant && (
          <p className="text-sm text-orange-400 font-medium mb-3">{story.restaurant}</p>
        )}

        {/* Preview text */}
        <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">
          {getPreviewText(story.story)}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-white/60">
          {story.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{story.location.places?.[0]?.name || 'Location'}</span>
            </div>
          )}
          {story.date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(story.date)}</span>
            </div>
          )}
        </div>

        {/* Quote preview (if available) */}
        {story.quote && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/70 italic text-sm line-clamp-2">&ldquo;{story.quote.replace(/"/g, '')}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Hover effect glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`} />
    </motion.div>
  );
}
