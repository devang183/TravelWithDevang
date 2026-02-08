'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Flatten all tips into individual cards with their category info
const allTips = [
  // Logistics & Transportation
  { text: '**Leap Card** is your best friend for public transport - preload it for discounted fares on buses, trams (Luas), and DART trains.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**TFI 90-Minute Fare** allows unlimited transfers within 90 minutes on buses, Luas, and DART.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Use the TFI Live app** to plan any journey with real-time bus and train information - essential for getting around efficiently.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Driving is not recommended** in the city - Dublin is very walkable and has good public transport. Traffic is heavy, parking is expensive, and roads can be confusing.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Explore beyond the city centre** - take short DART train trips to coastal spots like Howth or Dún Laoghaire for cliff walks, seafood, and local life.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**FreeNow** is the go-to app for taxis - reliable and widely used.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**DublinBikes** offers an affordable bike-share scheme for short trips around the city center.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Cash vs. Card** - most places accept cards and contactless payments, but it\'s handy to carry some euros for small local shops or cafes that might not.', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: 'Street names in Dublin are often shown on buildings rather than street signs - look up!', category: 'Logistics & Transportation', icon: '🚇', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },

  // Eating & Drinking
  { text: '**Rounds system** is common in pubs - if you\'re in a group, each person takes a turn buying a drink for everyone else.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**Pay for drinks as you order** them at the bar, rather than asking to open a tab - it\'s the standard pub practice.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**A properly poured pint of Guinness** takes time to settle - be patient and don\'t grab it before the bartender is finished.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**Avoid Temple Bar** for food and drinks unless you want to pay tourist prices. Venture to nearby neighborhoods for better value.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**Early Bird specials** (usually 5-7 PM) offer great discounts at restaurants.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: 'A **pint** means Guinness unless otherwise specified. It is almost a religion here.', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: 'Tap water is excellent quality and free at restaurants - just ask for "tap water."', category: 'Eating & Drinking', icon: '🍺', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },

  // Budget & Sightseeing
  { text: '**Free museums** include the National Museum of Ireland (Archaeology, Decorative Arts, Natural History) and the National Gallery.', category: 'Budget & Sightseeing', icon: '🎨', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: '**Book in advance for key sites** - Book of Kells, Guinness Storehouse, and especially Kilmainham Gaol sell out quickly; book several weeks ahead.', category: 'Budget & Sightseeing', icon: '🎨', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: '**Student/senior discounts** are common but not always advertised - always ask!', category: 'Budget & Sightseeing', icon: '🎨', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: 'The **Dublin Pass** can save money if you plan to visit multiple paid attractions.', category: 'Budget & Sightseeing', icon: '🎨', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: 'Many historic sites like **Trinity College campus** and **St. Stephen\'s Green** are free to explore.', category: 'Budget & Sightseeing', icon: '🎨', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },

  // Cultural & Practical Etiquette
  { text: '**Don\'t call an Irish person "British"** - Ireland is an independent nation, and the distinction is important due to historical context.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Never order an "Irish Car Bomb"** in a pub - it\'s highly offensive and references a sensitive period in Ireland\'s history.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Avoid clichés** like "top of the morning" or asking about leprechauns - these are not authentic Irish expressions and can be seen as insensitive.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Don\'t claim you are "Irish"** just because you have Irish ancestry - it\'s fine to mention your heritage, but being Irish is about growing up in the country.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**"Slagging"** (friendly teasing) is a sign of affection - don\'t take it personally. Having a self-deprecating wit wins you friends.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Say "Thanks" to the bus driver** - it\'s a ubiquitous local custom when you get off the bus, and failing to do so is considered rude.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**"How\'s the craic?"** means "What\'s going on?" or "How\'s it going?" - a staple greeting.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Tipping** is appreciated but not mandatory - 10% is standard for good service.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: 'Irish people are famously friendly and chatty - don\'t be surprised if strangers strike up a conversation.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Learn a few Irish words** - everyone speaks English, but locals appreciate it if you learn a few Irish words like "Sláinte" (Cheers!).', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: 'Sunday trading hours are shorter, and many shops close earlier or remain closed.', category: 'Cultural & Practical Etiquette', icon: '🎭', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },

  // Safety & Weather
  { text: '**Dress for the weather, not the season** - comfortable, waterproof walking shoes and a quality waterproof jacket with a hood are essential. Umbrellas are often useless in the wind.', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
  { text: '**"Four seasons in one day"** is a real thing - be prepared for rain, sun, wind, and cold all in 24 hours. Pack layers and a waterproof jacket even in summer.', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
  { text: '**Stay aware in crowds** - be aware of your belongings in crowded tourist areas like Temple Bar, Grafton Street, and transport hubs like O\'Connell Street or Connolly Station at night.', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
  { text: '**Use ATMs wisely** - it\'s safer to use ATMs inside banks or shopping centres rather than those on the street to avoid potential card skimming.', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
  { text: 'Dublin is generally safe, but **avoid walking alone late at night** in certain areas (e.g., parts of the north inner city).', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
  { text: '**Seagulls are aggressive** - guard your food near the River Liffey and coastal areas.', category: 'Safety & Weather', icon: '🌦️', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/50' },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function DublinTipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    const nextIndex = (currentIndex + newDirection + allTips.length) % allTips.length;
    setCurrentIndex(nextIndex);
    setPage([page + newDirection, newDirection]);
  };

  const goToCard = (index) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setCurrentIndex(index);
    setPage([index, newDirection]);
  };

  const currentTip = allTips[currentIndex];

  return (
    <div
      className="w-full max-w-6xl mx-auto my-6 sm:my-8 px-4 sm:px-6 lg:px-8"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Swipe indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 mb-3 text-gray-500"
      >
        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex items-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span>Swipe for more tips</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Card Container */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[340px] flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 35 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            dragDirectionLock
            onDragStart={(e) => {
              e.preventDefault();
            }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full cursor-grab active:cursor-grabbing touch-none"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Individual Tip Card - Horizontal Layout */}
            <motion.div
              className={`bg-gradient-to-br ${currentTip.color} backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${currentTip.borderColor} p-4 sm:p-6 h-full flex items-center gap-4 sm:gap-6 select-none`}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Icon on Left */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex-shrink-0"
              >
                <div className="text-6xl sm:text-7xl md:text-8xl filter drop-shadow-2xl">
                  {currentTip.icon}
                </div>
              </motion.div>

              {/* Content in Center */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex-grow flex flex-col justify-center gap-3"
              >
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/60 text-xs sm:text-sm font-bold text-white drop-shadow-md">
                    {currentTip.category}
                  </span>
                </div>

                {/* Tip Text */}
                <p
                  className="text-base sm:text-lg md:text-xl leading-relaxed text-white drop-shadow-lg font-medium"
                  dangerouslySetInnerHTML={{
                    __html: currentTip.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 flex-wrap mt-4 sm:mt-6 max-h-16 overflow-y-auto">
        {allTips.map((tip, index) => (
          <motion.button
            key={index}
            onClick={() => goToCard(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-6 sm:w-8 h-2 bg-white shadow-lg'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
