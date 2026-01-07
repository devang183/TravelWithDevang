'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Utensils, Star, Calendar } from 'lucide-react';
import StoryCard from './StoryCard';
import StoryModal from './StoryModal';
import { getStoriesByCity, getFeaturedStories } from '@/data/cityStories';

/**
 * PeopleAndStories - Main component for displaying city stories
 * Anthony Bourdain-inspired experience: People met + Food tasted
 */
export default function PeopleAndStories({ cityId, cityName }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'people', 'food'
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get stories data
  const cityData = getStoriesByCity(cityId);
  const allStories = cityData.stories || [];
  const featuredStories = getFeaturedStories(cityId);

  // Filter stories
  const filteredStories = useMemo(() => {
    let filtered = allStories;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(story => story.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story => {
        const name = (story.name || story.dish || '').toLowerCase();
        const storyText = (story.story || '').toLowerCase();
        const tags = (story.tags || []).join(' ').toLowerCase();
        return name.includes(query) || storyText.includes(query) || tags.includes(query);
      });
    }

    return filtered;
  }, [allStories, selectedType, searchQuery]);

  // Open story modal
  const openStory = (story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedStory(null), 300);
  };

  // Empty state
  if (allStories.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Stories Coming Soon
          </h3>
          <p className="text-white/70">
            The people and food experiences from {cityName} will be added here.
            Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Featured Stories Section */}
      {featuredStories.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Featured Stories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => openStory(story)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search stories, people, food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-white/70 border border-white/20 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('people')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                selectedType === 'people'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-black/40 text-white/70 border border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
            >
              <User className="w-4 h-4" />
              <span>People</span>
            </button>
            <button
              onClick={() => setSelectedType('food')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                selectedType === 'food'
                  ? 'bg-orange-500 text-white'
                  : 'bg-black/40 text-white/70 border border-orange-500/30 hover:bg-orange-500/20'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Food</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-white/60">
          {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <StoryCard
                story={story}
                onClick={() => openStory(story)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No stories found
          </h3>
          <p className="text-white/70">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Story Modal */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
