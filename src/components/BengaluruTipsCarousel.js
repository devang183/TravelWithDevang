'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Flatten all tips into individual cards with their category info
const allTips = [
  // Logistics & Transportation
  { text: '**Navigating Traffic is Key** - Bengaluru\'s traffic is notorious. Plan your travel times accordingly, especially during peak hours (8-10 AM and 5-8 PM).', category: 'Logistics & Transportation', icon: '🚗', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Utilize Ride-Sharing Apps** - Use Uber and Ola for cabs, and Rapido for bike taxis (cheaper for solo travel over short distances). Always verify your driver and share your live location for safety.', category: 'Logistics & Transportation', icon: '🚗', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Avoid Auto-Rickshaw Scams** - Auto-rickshaw drivers often refuse to use meters or charge inflated fares. Insist on using the meter ("meter please") or use Uber/Ola/Namma Yatri apps to book an auto at a fair price.', category: 'Logistics & Transportation', icon: '🚗', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**The Namma Metro** - This is the most efficient way to cross the city quickly and avoid road traffic. The network is growing, and a reusable Namma Metro Smart Card can save time and offer a 5% discount on fares.', category: 'Logistics & Transportation', icon: '🚗', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },
  { text: '**Driving is Not Recommended** - Lane discipline is minimal, and the chaotic driving style can be stressful for visitors. It\'s best to hire a car with a driver if a taxi isn\'t enough, or stick to public transport.', category: 'Logistics & Transportation', icon: '🚗', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/50' },

  // Eating & Drinking
  { text: '**Be Cautious with Street Food** - While tempting, it\'s best to stick to well-reviewed restaurants when you first arrive to avoid stomach issues. Only drink bottled water and ensure the seal is intact.', category: 'Eating & Drinking', icon: '🍛', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**MTR or Vidyarthi Bhavan** - Legendary spots for masala dosa and filter coffee. Don\'t miss these local South Indian delicacies!', category: 'Eating & Drinking', icon: '🍛', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**"Darshini" Restaurants** - These are local, quick-service, vegetarian eateries offering fresh and budget-friendly food.', category: 'Eating & Drinking', icon: '🍛', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**Shivaji Military Hotel** - Famous for its mutton biryani. Note: "Hotels" in India can often mean restaurants.', category: 'Eating & Drinking', icon: '🍛', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },
  { text: '**Tipping Culture** - Tipping is not mandatory but appreciated. 10% is standard in sit-down restaurants if a service charge isn\'t already included in the bill.', category: 'Eating & Drinking', icon: '🍛', color: 'from-amber-500/30 to-orange-500/30', borderColor: 'border-amber-400/50' },

  // Budget & Sightseeing
  { text: '**Explore Green Spaces** - The city lives up to its "Garden City" name with beautiful public parks like Cubbon Park and Lalbagh Botanical Garden, perfect for early morning walks.', category: 'Budget & Sightseeing', icon: '🌳', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: '**Free Cultural Experiences** - Look into many free or low-cost activities like visiting the National Gallery of Modern Art or checking out a performance at Ranga Shankara.', category: 'Budget & Sightseeing', icon: '🌳', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },
  { text: '**Bargain Politely** - Bargaining is common in local markets (e.g., Commercial Street, Chickpet Market), but do so with a smile and a polite attitude. Avoid aggressive haggling.', category: 'Budget & Sightseeing', icon: '🌳', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'border-purple-400/50' },

  // Cultural & Practical Etiquette
  { text: '**Dress Modestly** - When visiting religious sites (temples, gurdwaras, etc.), dress conservatively, covering shoulders, chest, and legs.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Learn Basic Kannada** - While English is widely spoken, learning a few words in Kannada goes a long way. Use "Anna" to address a man and "Akka" for a woman to show respect.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Digital Payments & Cash** - Digital payments (UPI, card) are very common in urban areas. However, carry small change (coins and small rupee notes) for buses, autos, and local shops.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Stay Aware in Crowds** - Be mindful of your belongings in crowded areas to avoid pickpockets. Avoid walking alone in secluded places late at night.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Carry Documents** - Always carry a photocopy of your important documents (passport, visa, ID) in a separate place from the originals.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },
  { text: '**Don\'t Touch Strangers\' Heads/Feet** - It is considered disrespectful to touch someone\'s head, and avoid pointing your feet at someone or using your left hand to pass food.', category: 'Cultural & Practical Etiquette', icon: '🕉️', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/50' },

  // Culture & The People
  { text: '**A "Cosmopolitan" Vibe** - Bengaluru prides itself on being one of India\'s most cosmopolitan and forward-thinking cities. It\'s a melting pot of cultures due to the large influx of migrants for the IT industry.', category: 'Culture & The People', icon: '🏙️', color: 'from-indigo-500/30 to-purple-500/30', borderColor: 'border-indigo-400/50' },
  { text: '**A Blend of Tradition and Modernity** - You\'ll find traditional darshinis right next to high-end microbreweries, and ancient temples next to towering glass office buildings.', category: 'Culture & The People', icon: '🏙️', color: 'from-indigo-500/30 to-purple-500/30', borderColor: 'border-indigo-400/50' },
  { text: '**The Language** - Kannada is the official state language. However, English is widely spoken, especially in business and among the younger generation. Hindi, Tamil, Telugu, and Malayalam are also commonly understood.', category: 'Culture & The People', icon: '🏙️', color: 'from-indigo-500/30 to-purple-500/30', borderColor: 'border-indigo-400/50' },
  { text: '**"Pub Capital" of India** - The city has a vibrant nightlife and café culture, with a large number of breweries, pubs, and trendy restaurants catering to the young professional population.', category: 'Culture & The People', icon: '🏙️', color: 'from-indigo-500/30 to-purple-500/30', borderColor: 'border-indigo-400/50' },

  // Etiquette & Social Norms
  { text: '**Respectful Greetings** - A simple "Namaste" (said with palms joined together) or "hello" works well. When addressing strangers, "Anna" (elder brother) for men and "Akka" (elder sister) for women are respectful terms.', category: 'Etiquette & Social Norms', icon: '🙏', color: 'from-rose-500/30 to-pink-500/30', borderColor: 'border-rose-400/50' },
  { text: '**Dress Code** - While Bengaluru is relatively liberal, especially in central areas and during nightlife, it\'s respectful to dress modestly when visiting temples or rural areas. Lightweight, breathable fabrics are best.', category: 'Etiquette & Social Norms', icon: '🙏', color: 'from-rose-500/30 to-pink-500/30', borderColor: 'border-rose-400/50' },
  { text: '**Left Hand Etiquette** - The left hand is traditionally considered unclean in Indian culture. Avoid using your left hand to eat food, pass objects, or shake hands.', category: 'Etiquette & Social Norms', icon: '🙏', color: 'from-rose-500/30 to-pink-500/30', borderColor: 'border-rose-400/50' },
  { text: '**Personal Space** - The concept of personal space is different than in Western countries. Crowds are common in public transport and markets, so be prepared for closer proximity to others.', category: 'Etiquette & Social Norms', icon: '🙏', color: 'from-rose-500/30 to-pink-500/30', borderColor: 'border-rose-400/50' },

  // Helpful Advice
  { text: '**The Weather is Great, But Be Prepared** - Bengaluru is famous for its pleasant year-round weather, earning it the nickname "air-conditioned city." However, carry an umbrella during monsoon season (June to October) and a light jacket for cooler evenings.', category: 'Helpful Advice', icon: '☀️', color: 'from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50' },
  { text: '**Stay Hydrated & Sun Safe** - The sun can be intense. Carry a water bottle (only drink sealed bottled water) and use sunscreen, sunglasses, and a hat.', category: 'Helpful Advice', icon: '☀️', color: 'from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50' },
  { text: '**Embrace the Pace** - The city can feel chaotic and busy. Adopt a patient mindset when dealing with traffic delays or crowds.', category: 'Helpful Advice', icon: '☀️', color: 'from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50' },
  { text: '**Use UPI (Unified Payments Interface)** - India is a leader in digital payments. Apps like Google Pay, PhonePe, or BHIM are used almost everywhere. Setting one up can make transactions much easier than handling cash and change.', category: 'Helpful Advice', icon: '☀️', color: 'from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50' },
  { text: '**Local SIM Card** - Getting a local SIM card (Airtel or Jio are good options) is highly recommended for using navigation apps and ride-sharing services. You will need your passport, visa, and a passport-sized photo.', category: 'Helpful Advice', icon: '☀️', color: 'from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50' },
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

export default function BengaluruTipsCarousel() {
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
