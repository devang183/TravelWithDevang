'use client';

import YearBasedCityExplorer from '@/components/YearBasedCityExplorer';

export default function ExplorePage() {
  return (
    <main
      className="min-h-screen w-full mx-auto px-4 pt-20 pb-6 sm:p-8 sm:pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <YearBasedCityExplorer />
    </main>
  );
}
