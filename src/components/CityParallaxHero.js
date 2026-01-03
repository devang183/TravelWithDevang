'use client';

import { useEffect, useState } from 'react';
import styles from './CityParallaxHero.module.css';
import Breadcrumb from '@/components/Breadcrumb';

export default function CityParallaxHero({ cityName, cityid, city }) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      // Use requestAnimationFrame for smoother scrolling on mobile
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
        });
      } else {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Calculate opacity based on scroll (fades out completely after 300px)
  const opacity = Math.max(0, 1 - scrollY / 300);

  // Keep similar parallax speed on mobile for consistent experience
  const parallaxMultiplier = isMobile ? 0.08 : 0.1;

  // Calculate transform for parallax effect on layers
  // Use translate3d for better mobile GPU acceleration
  const layer1Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 1}px, 0)`;
  const layer2Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 2}px, 0)`;
  const layer3Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 3}px, 0)`;
  const layer4Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 4}px, 0)`;
  const layer5Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 5}px, 0)`;
  const layer6Transform = `translate3d(0, ${scrollY * parallaxMultiplier * 6}px, 0)`;

  return (
    <div className={styles.parallaxContainer}>
      <ul className={styles.parallax}>
        <li className={styles.layer} style={{ transform: layer1Transform }}></li>
        <li className={styles.layer} style={{ transform: layer2Transform }}></li>
        <li className={styles.layer} style={{ transform: layer3Transform }}></li>
        <li className={styles.layer} style={{ transform: layer4Transform }}></li>
        <li className={styles.layer} style={{ transform: layer5Transform }}></li>
        <li className={styles.layer} style={{ transform: layer6Transform }}></li>
      </ul>

      {/* Breadcrumb - Top Left */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb cityid={cityid} city={city} />
      </div>

      {/* City Name Overlay */}
      <div
        className={styles.cityNameOverlay}
        style={{ opacity }}
      >
        <h1 className={styles.cityName}>{cityName}</h1>
      </div>
    </div>
  );
}
