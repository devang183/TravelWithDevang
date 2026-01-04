'use client';

import { useState } from 'react';
import styles from './ExpandableCards.module.css';

export default function ExpandableCards({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ul className={styles.cardsList}>
      {items.map((item, index) => (
        <li
          key={index}
          className={`${styles.card} ${activeIndex === index ? styles.active : ''}`}
          style={{ backgroundImage: `url('${item.image}')` }}
          onClick={() => setActiveIndex(index)}
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
