'use client';

import { useEffect } from 'react';
import styles from './ParallaxBackground.module.css';

export default function ParallaxBackground({ children }) {
  useEffect(() => {
    const layers = document.querySelectorAll('.parallax-layer');

    function parallax() {
      const y = window.scrollY;
      layers.forEach((layer, i) => {
        const speed = (i + 1) * 0.1;
        layer.style.transform = `translateY(${speed * y}px)`;
      });
    }

    window.addEventListener('scroll', parallax, false);

    return () => {
      window.removeEventListener('scroll', parallax, false);
    };
  }, []);

  return (
    <main className={styles.main}>
      <ul className={styles.parallax}>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.1"></li>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.2"></li>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.3"></li>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.4"></li>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.5"></li>
        <li className={`${styles.layer} parallax-layer`} data-speed="0.6"></li>
      </ul>
      <article className={styles.content}>
        {children}
      </article>
    </main>
  );
}
