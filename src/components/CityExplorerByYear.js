'use client';

import ExpandableCards from './ExpandableCards';
import { cityExplorerData } from '@/data/cityExplorerData';
import styles from './CityExplorerByYear.module.css';

export default function CityExplorerByYear({ cityid }) {
  const cityData = cityExplorerData[cityid?.toLowerCase()];

  if (!cityData) {
    return (
      <div className={styles.container}>
        <p className={styles.noData}>No explorer data available for this city yet.</p>
      </div>
    );
  }

  // Get years in descending order (most recent first)
  const years = Object.keys(cityData).sort((a, b) => b - a);

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Explore {cityid}</h1>
      {years.map((year) => (
        <section key={year} className={styles.yearSection}>
          <h2 className={styles.yearTitle}>{year}</h2>
          <ExpandableCards items={cityData[year]} />
        </section>
      ))}
    </div>
  );
}
