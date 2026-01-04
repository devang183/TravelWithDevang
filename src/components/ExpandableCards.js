'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ExpandableCards.module.css';

export default function ExpandableCards({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsListRef = useRef(null);
  const cardRefs = useRef([]);

  // Scroll card to align with top of container when clicked
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
      // Mobile: Vertical scrolling - align card top with container top
      // This shows the full expanded card with next card visible below
      const cardTopRelativeToContainer = cardRect.top - containerRect.top;
      const scrollPosition = containerElement.scrollTop + cardTopRelativeToContainer;

      containerElement.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    } else {
      // Desktop: Horizontal scrolling - center card horizontally in container
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

  return (
    <ul ref={cardsListRef} className={styles.cardsList}>
      {items.map((item, index) => (
        <li
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          className={`${styles.card} ${activeIndex === index ? styles.active : ''}`}
          style={{ backgroundImage: `url('${item.image}')` }}
          onClick={() => handleCardClick(index)}
        >
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
