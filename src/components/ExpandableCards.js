'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ExpandableCards.module.css';

export default function ExpandableCards({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const cardsListRef = useRef(null);
  const cardRefs = useRef([]);

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
    // Small delay to allow the card to start expanding before scrolling
    setTimeout(() => {
      scrollToCard(index);
    }, 50);
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <ul ref={cardsListRef} className={styles.cardsList}>
      {items.map((item, index) => (
        <li
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          className={`${styles.card} ${activeIndex === index ? styles.active : ''}`}
          onClick={() => handleCardClick(index)}
        >
          {/* Progressive Image Background */}
          <div className={styles.imageWrapper}>
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
            />

            {/* Shimmer loading effect */}
            {!loadedImages[index] && (
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
        </li>
      ))}
    </ul>
  );
}
