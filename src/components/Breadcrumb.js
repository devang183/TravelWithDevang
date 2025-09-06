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
    <nav className="text-md mb-4 text-[#1f2526]" style={{
      fontFamily: '"Playfair Display", serif',
    }}>
      <Link href="/" className="hover:underline">Home</Link> /{' '}
      <Link href="/test-cities" className="hover:underline">Cities</Link> /{' '}
      <Link href={`/test-cities/${cityid}`} className="hover:underline">
        {city.name} {year && `(${year})`}
      </Link>
      {subpage && (
        <>
          {' '} / <span className="font-medium text-gray-900">{formatSubpage(subpage)}</span>
        </>
      )}
    </nav>
  );
}
