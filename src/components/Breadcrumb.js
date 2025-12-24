// 'use client';
// import Link from 'next/link';

// export default function Breadcrumb({ cityid, city }) {
//   const year = cityid.split('-')[1];
//   return (
//     <nav className="text-sm mb-4 text-gray-600">
//       <Link href="/" className="hover:underline text-blue-600">Home</Link> /{' '}
//       <Link href="/test-cities" className="hover:underline text-blue-600">Cities</Link> /{' '}
//       <span className="font-medium text-gray-900">{city.name} {year && `(${year})`}</span>
//     </nav>
//   );
// }

// components/Breadcrumb.js
'use client';
import Link from 'next/link';

export default function Breadcrumb({ cityid, city, subpage }) {
  const year = cityid.split('-')[1];

  const formatSubpage = (slug) =>
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return (
    <nav
      className="text-sm sm:text-md mb-4 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/40 backdrop-blur-lg shadow-2xl border border-white/60 inline-block"
      style={{
        fontFamily: '"Playfair Display", serif',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Link
        href="/"
        className="font-semibold text-gray-900 hover:text-purple-700 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
      >
        Home
      </Link>
      <span className="mx-2 text-purple-600 font-bold">/</span>
      <Link
        href="/test-cities"
        className="font-semibold text-gray-900 hover:text-purple-700 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
      >
        Cities
      </Link>
      <span className="mx-2 text-purple-600 font-bold">/</span>
      <Link
        href={`/test-cities/${cityid}`}
        className="font-semibold text-gray-900 hover:text-purple-700 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
      >
        {city.name} {year && `(${year})`}
      </Link>
      {subpage && (
        <>
          <span className="mx-2 text-purple-600 font-bold">/</span>
          <span className="font-bold text-purple-800">{formatSubpage(subpage)}</span>
        </>
      )}
    </nav>
  );
}
