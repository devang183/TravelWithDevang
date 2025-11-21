import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, TrendingUp, Clock, Target, Users, Zap, BarChart3, Filter, Search, AlertCircle } from 'lucide-react';

const FlutterPresentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const totalSlides = 4;
  
  const nextSlide = () => {
    if (!isAnimating) {
      setDirection('forward');
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  };
  
  const prevSlide = () => {
    if (!isAnimating) {
      setDirection('backward');
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const goToSlide = (idx) => {
    if (!isAnimating) {
      setDirection(idx > currentSlide ? 'forward' : 'backward');
      setIsAnimating(true);
      setCurrentSlide(idx);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-md p-6 text-white text-center border-b border-white/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-8 h-8 animate-pulse" />
              <h1 className="text-2xl font-bold">Brand Trading Insights Executive</h1>
            </div>
            <p className="text-emerald-100 text-sm">
              {currentSlide < 2 ? 'In-Play Football Experience Analysis' : 'Pre-Match Football Experience Analysis'}
            </p>
          </div>

          {/* Slide Content */}
          <div className="p-8 min-h-[600px] relative overflow-hidden bg-white/95 backdrop-blur-sm">
            <div
              key={currentSlide}
              className={`${
                direction === 'forward' 
                  ? 'animate-slideInRight' 
                  : 'animate-slideInLeft'
              }`}
            >
              {currentSlide === 0 && <Slide1 />}
              {currentSlide === 1 && <Slide2 />}
              {currentSlide === 2 && <Slide3 />}
              {currentSlide === 3 && <Slide4 />}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white/60 backdrop-blur-md px-8 py-4 flex items-center justify-between border-t border-white/30">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white disabled:bg-gray-300/50 disabled:cursor-not-allowed hover:bg-emerald-700 hover:scale-105 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg border border-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                    currentSlide === idx ? 'bg-emerald-600 w-8' : 'bg-gray-300 w-3 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white disabled:bg-gray-300/50 disabled:cursor-not-allowed hover:bg-emerald-700 hover:scale-105 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg border border-white/20"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4 text-white text-sm animate-fadeIn bg-white/10 backdrop-blur-md rounded-full px-6 py-2 inline-block border border-white/20">
          Slide {currentSlide + 1} of {totalSlides} | {currentSlide < 2 ? 'In-Play' : 'Pre-Match'} Analysis
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .stagger-1 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }
        
        .stagger-2 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .stagger-3 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

// Slide 1: In-Play - Hypothesis & Pain Point
const Slide1 = () => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-100 border-l-4 border-emerald-600 p-3 mb-6 rounded-r">
        <p className="text-sm font-semibold text-emerald-800">IN-PLAY FOOTBALL ANALYSIS</p>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-6 animate-fadeInUp">Hypothesis & Customer Pain Point</h2>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp stagger-1">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-red-600 mt-1 flex-shrink-0 animate-pulse" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Pain Point Identified</h3>
            <p className="text-gray-700 leading-relaxed">
              During live football matches, customers struggle to find and place bets on <strong>momentum-based markets</strong> (e.g., "Next Goal," "Next Corner," "10-Minute Markets") quickly enough before odds shift or the moment passes. Current navigation requires <strong>3-4 clicks</strong> through nested menus, causing friction during fast-moving game situations.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp stagger-2">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Competitive Benchmark</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Bet365</strong> features a dynamic "Quick Bet" carousel that surfaces high-intent markets based on game state (e.g., showing "Next Goal" markets when a team is pressing). Paddy Power's current experience buries these markets, requiring customers to scroll or navigate away from the main match view.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp stagger-3">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-7 h-7 text-emerald-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Hypothesis</h3>
            <p className="text-gray-800 leading-relaxed italic text-lg">
              "By implementing a <strong>contextual Quick Bet widget</strong> that surfaces relevant in-play markets based on live game events, we will target measurable improvements in in-play bet conversion rates and reduce time-to-bet, improving customer satisfaction during high-intensity match moments."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slide 2: In-Play - A/B Test & Metrics
const Slide2 = () => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-100 border-l-4 border-emerald-600 p-3 mb-6 rounded-r">
        <p className="text-sm font-semibold text-emerald-800">IN-PLAY FOOTBALL ANALYSIS</p>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-6 animate-fadeInUp">Proposed A/B Test & Success Metrics</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6 animate-fadeInUp stagger-1">
        <div className="bg-gray-100 p-5 rounded-lg border-2 border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h4 className="font-semibold text-gray-800 mb-2">Control (A)</h4>
          <p className="text-gray-700 text-sm">Current experience - standard market navigation</p>
        </div>
        <div className="bg-emerald-100 p-5 rounded-lg border-2 border-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <h4 className="font-semibold text-gray-800 mb-2">Variant (B) - Quick Bet Widget</h4>
          <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
            <li>Persistent widget above match tracker</li>
            <li>3-4 contextual markets based on game events</li>
            <li>Dynamic updates every 2-3 minutes</li>
            <li>One-tap betting without navigation</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-lg hover:shadow-lg transition-all duration-300 animate-fadeInUp stagger-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Test Design
        </h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Split</p>
            <p className="text-gray-600">50/50 for Paddy Power customers</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Duration</p>
            <p className="text-gray-600">4 weeks (20+ match days)</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Focus</p>
            <p className="text-gray-600">Premier League matches</p>
          </div>
        </div>
      </div>

      <div className="animate-fadeInUp stagger-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600 animate-pulse" />
          Target Success Metrics
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h4 className="font-semibold">Conversion Rate</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: +5-10%</p>
            <p className="text-sm text-emerald-100">In-play bet conversion lift</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h4 className="font-semibold">Time-to-Bet</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: -20-30%</p>
            <p className="text-sm text-blue-100">Reduction in placement time</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <h4 className="font-semibold">Bets Per Session</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: +10-15%</p>
            <p className="text-sm text-purple-100">Increase in betting activity</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Secondary Metrics</h4>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer">Customer satisfaction score</span>
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer">Market diversity (%)</span>
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer">Match view bounce rate</span>
        </div>
      </div>
    </div>
  );
};

// Slide 3: Pre-Match - Hypothesis & Pain Point
const Slide3 = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-100 border-l-4 border-blue-600 p-3 mb-6 rounded-r">
        <p className="text-sm font-semibold text-blue-800">PRE-MATCH FOOTBALL ANALYSIS</p>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-6 animate-fadeInUp">Hypothesis & Customer Pain Point</h2>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp stagger-1">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0 animate-pulse" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Pain Point Identified</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When browsing pre-match football markets on Paddy Power, customers face <strong>overwhelming choice paralysis</strong> with 200+ betting markets per match. There is no intelligent filtering or personalization to surface markets aligned with individual betting preferences or past behavior.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Current experience requires extensive scrolling through alphabetically organized markets. Customers frequently abandon the site or settle for simpler bets (match result only) rather than engaging with diverse, higher-margin markets that match their interests.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp stagger-2">
        <div className="flex items-start gap-3">
          <Search className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Competitive Benchmark</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              <strong>William Hill</strong> and <strong>Betfair</strong> offer "Popular Markets" sections that dynamically adjust based on customer betting patterns and match context (e.g., showing "Both Teams to Score" for high-scoring fixtures).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Paddy Power currently display all markets in a static format without intelligent curation, missing opportunities to guide customers toward markets they're most likely to engage with.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-500 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp stagger-3">
        <div className="flex items-start gap-3">
          <Filter className="w-7 h-7 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Hypothesis</h3>
            <p className="text-gray-800 leading-relaxed italic text-lg">
              "By implementing a <strong>personalized 'Markets For You'</strong> section that surfaces 6-8 relevant betting markets based on customer betting history, fixture context, and popular trends, we will target measurable increases in market diversity, bet placement rates, and average stake per customer in pre-match football betting."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slide 4: Pre-Match - A/B Test & Metrics
const Slide4 = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-100 border-l-4 border-blue-600 p-3 mb-6 rounded-r">
        <p className="text-sm font-semibold text-blue-800">PRE-MATCH FOOTBALL ANALYSIS</p>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-6 animate-fadeInUp">Proposed A/B Test & Success Metrics</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6 animate-fadeInUp stagger-1">
        <div className="bg-gray-100 p-5 rounded-lg border-2 border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h4 className="font-semibold text-gray-800 mb-2">Control (A)</h4>
          <p className="text-gray-700 text-sm">Current experience - all markets displayed alphabetically with no personalization</p>
        </div>
        <div className="bg-blue-100 p-5 rounded-lg border-2 border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <h4 className="font-semibold text-gray-800 mb-2">Variant (B) - Markets For You</h4>
          <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
            <li>"Markets For You" section at top of page</li>
            <li>6-8 personalized markets using ML recommendation</li>
            <li>Based on: betting history, fixture stats, trending bets</li>
            <li>Refresh recommendations per match fixture</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-lg hover:shadow-lg transition-all duration-300 animate-fadeInUp stagger-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Test Design
        </h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Split</p>
            <p className="text-gray-600">50/50 for Paddy Power customers</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Duration</p>
            <p className="text-gray-600">6 weeks (full matchweek cycle)</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <p className="font-medium text-gray-800">Focus</p>
            <p className="text-gray-600">Premier League & Championship</p>
          </div>
        </div>
      </div>

      <div className="animate-fadeInUp stagger-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 animate-pulse" />
          Target Success Metrics
        </h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5" />
              <h4 className="font-semibold">Market Diversity</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: +15-25%</p>
            <p className="text-sm text-blue-100">Increase in non-result bets</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h4 className="font-semibold">Pre-Match Conversion</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: +10-15%</p>
            <p className="text-sm text-cyan-100">Customers placing pre-match bets</p>
          </div>
          
          <div className="bg-gradient-to-br from-violet-500 to-purple-500 text-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <h4 className="font-semibold">Avg Stake Value</h4>
            </div>
            <p className="text-2xl font-bold mb-1">Target: +8-12%</p>
            <p className="text-sm text-violet-100">Per customer engagement</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Time on Market Page</h4>
            </div>
            <p className="text-xl font-bold">Target: +20-30%</p>
            <p className="text-xs text-orange-100">Increased engagement time</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Recommendation CTR</h4>
            </div>
            <p className="text-xl font-bold">Target: 25-35%</p>
            <p className="text-xs text-pink-100">Click-through on suggestions</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Secondary Metrics</h4>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer">Customer satisfaction (NPS)</span>
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer">Scroll depth reduction</span>
          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-700 border hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer">Return visit frequency</span>
        </div>
      </div>
    </div>
  );
};

export default FlutterPresentation;