'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './ExpandableCards.module.css';

export default function ExpandableCards({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const cardsListRef = useRef(null);
  const cardRefs = useRef([]);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll card to center with previews of adjacent cards visible
  const scrollToCard = (index) => {
    const cardElement = cardRefs.current[index];
    const containerElement = cardsListRef.current;

    if (!cardElement || !containerElement) return;

    // Get container and card dimensions
    const containerRect = containerElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    // Check if we're in mobile (vertical) or desktop (horizontal) layout
    const isMobile = window.innerWidth < 1280;

    if (isMobile) {
      // Mobile: Vertical scrolling - center card with previews above and below
      const cardCenter = cardRect.top + cardRect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;
      const scrollOffset = cardCenter - containerCenter;
      const scrollPosition = containerElement.scrollTop + scrollOffset;

      containerElement.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    } else {
      // Desktop: Horizontal scrolling - center card with previews left and right
      const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left;
      const containerCenter = containerRect.width / 2;
      const scrollOffset = cardCenter - containerCenter;
      const scrollPosition = containerElement.scrollLeft + scrollOffset;

      containerElement.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle card click
  const handleCardClick = (index) => {
    setActiveIndex(index);
    // Elegant delay to let expansion animation breathe before scrolling
    // This creates a smooth, two-phase movement that's easy on the eyes
    setTimeout(() => {
      scrollToCard(index);
    }, 650); // Coordinated with CSS transition (0.6s) + buffer for smoothness
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <ul ref={cardsListRef} className={styles.cardsList}>
      {items.map((item, index) => (
        <motion.li
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          className={`${styles.card} ${activeIndex === index ? styles.active : ''}`}
          onClick={() => handleCardClick(index)}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}

          // Micro-interaction animations
          whileHover={activeIndex !== index ? {
            scale: 1.02,
            y: -4,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 17
            }
          } : {}}

          whileTap={activeIndex !== index ? {
            scale: 0.98,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 17
            }
          } : {}}

          // Initial animation on mount
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.05, // Stagger effect
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {/* Progressive Image Background */}
          <div className={styles.imageWrapper} suppressHydrationWarning>
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index === 0 || index === 1} // Prioritize first two images
              quality={90}
              sizes="(max-width: 1280px) 100vw, 50vw"
              className={`
                object-cover
                transition-all duration-700 ease-out
                ${loadedImages[index]
                  ? 'blur-0 scale-100 opacity-100'
                  : 'blur-md scale-105 opacity-0'
                }
              `}
              onLoad={() => handleImageLoad(index)}
              style={{
                willChange: loadedImages[index] ? 'auto' : 'transform, filter, opacity'
              }}
              suppressHydrationWarning
            />

            {/* Shimmer loading effect - only render after mount to avoid hydration issues */}
            {isMounted && !loadedImages[index] && (
              <div
                className={styles.shimmer}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmerSlide 1.5s infinite linear',
                  zIndex: 1
                }}
              />
            )}
          </div>

          <h3>{item.title}</h3>
          <div className={styles.sectionContent}>
            <div className={styles.inner}>
              <div className={styles.bio}>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {item.showCityButton && item.onShowCity && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onShowCity();
                    }}
                    className={styles.showCityButton}
                  >
                    Lessgoooo
                  </button>
                )}
                {item.link && !item.showCityButton && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.profileLink}
                  >
                    View More
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          {hoveredIndex === index && activeIndex !== index && (
            <motion.div
              className={styles.hoverGlow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.li>
      ))}
    </ul>
  );
}
