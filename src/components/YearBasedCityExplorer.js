'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExpandableCards from './ExpandableCards';
import { citiesByYear } from '@/data/citiesByYear';
import styles from './YearBasedCityExplorer.module.css';

export default function YearBasedCityExplorer() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState('2024');

  const years = Object.keys(citiesByYear).sort((a, b) => b - a);

  // Add "Show City" button to each city item
  const citiesWithButton = (citiesByYear[selectedYear] || []).map(city => ({
    ...city,
    showCityButton: true,
    onShowCity: () => {
      router.push(`/test-cities/${city.id}`);
    }
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>City Explorer</h1>

      {/* Year Tabs */}
      <div className={styles.yearTabs}>
        {years.map((year) => (
          <button
            key={year}
            className={`${styles.yearTab} ${selectedYear === year ? styles.active : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Cities for Selected Year */}
      <div className={styles.citiesSection}>
        {citiesWithButton.length > 0 ? (
          <ExpandableCards items={citiesWithButton} />
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No cities added for {selectedYear} yet. Stay tuned for upcoming adventures!</p>
          </div>
        )}
      </div>
    </div>
  );
}
