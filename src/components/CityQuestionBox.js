'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { cityTipsData, quickSuggestions } from '@/data/cityTips';
import { answerQuestion } from '@/utils/cityQA';

export default function CityQuestionBox({ cityId, cityName }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const cityIdLower = cityId.toLowerCase();
  const tips = cityTipsData[cityIdLower] || [];
  const suggestions = quickSuggestions[cityIdLower] || [];

  const handleAsk = () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setShowResults(false);

    // Simulate a brief processing delay for better UX
    setTimeout(() => {
      const result = answerQuestion(query, tips, cityName);
      setResponse(result);
      setShowResults(true);
      setIsLoading(false);
    }, 300);
  };

  const handleSuggestionClick = (suggestionQuery) => {
    setQuery(suggestionQuery);
    setShowResults(false);
    setResponse(null);
  };

  const handleClearResults = () => {
    setShowResults(false);
    setResponse(null);
    setQuery('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      {/* Main Question Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/60"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ask About {cityName}
          </h3>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Get instant answers about transportation, food, culture, safety, and more - powered by local insights!
        </p>

        {/* Input Area */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`e.g., "What's the best way to get around ${cityName}?"`}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-gray-800 placeholder-gray-400 bg-white/90 transition-all"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAsk}
            disabled={isLoading || !query.trim()}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2 ${
              isLoading || !query.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Ask</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Quick Suggestions */}
        {!showResults && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className="text-sm px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-full text-purple-700 font-medium transition-all border border-purple-200"
                >
                  {suggestion.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Results Area */}
      <AnimatePresence>
        {showResults && response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            {/* Success Response */}
            {response.success && response.allTips && (
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-purple-200">
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-bold text-gray-800">
                      Found {response.totalResults} {response.totalResults === 1 ? 'tip' : 'tips'} for you!
                    </h4>
                  </div>
                  <button
                    onClick={handleClearResults}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close results"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Tips grouped by category */}
                <div className="space-y-4">
                  {Object.entries(response.tipsByCategory).map(([category, categoryTips], catIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                      className="space-y-2"
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryTips[0].icon}</span>
                        <h5 className="font-semibold text-purple-700">{category}</h5>
                      </div>

                      {/* Tips in this category */}
                      {categoryTips.map((tip, tipIndex) => (
                        <motion.div
                          key={tipIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: catIndex * 0.1 + tipIndex * 0.05 }}
                          className="pl-8 pr-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                        >
                          <p
                            className="text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: tip.text.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="font-bold text-purple-900">$1</strong>'
                              ),
                            }}
                          />
                          {/* Relevance indicator */}
                          {tip.score && tip.score > 10 && (
                            <div className="mt-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-500 font-medium">Highly relevant</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </div>

                {/* Ask another question prompt */}
                <div className="mt-6 pt-4 border-t border-purple-200">
                  <p className="text-sm text-gray-600 text-center">
                    Have another question? Just type it above! 👆
                  </p>
                </div>
              </div>
            )}

            {/* Fallback Response (no results) */}
            {!response.success && response.message && (
              <div className="bg-amber-50/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                    <h4 className="text-lg font-bold text-gray-800">No exact matches found</h4>
                  </div>
                  <button
                    onClick={handleClearResults}
                    className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                    aria-label="Close results"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <p className="text-gray-700 mb-4">{response.message}</p>

                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Suggestions:</p>
                    <ul className="space-y-1">
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 pl-4">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {response.showQuickSuggestions && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Try these popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className="text-sm px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-full text-amber-800 font-medium transition-all"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
