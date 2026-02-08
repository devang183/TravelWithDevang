'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const StickyNotes = dynamic(() => import('@/components/StickyNotes'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
});

// Contributor data
const contributorsMap = {
  'meghana-kankaria': {
    name: 'Ms. Meghana Kankaria',
    title: 'Architecture Student & Photographer'
  },
  'kushal-pillewan': {
    name: 'Kushal Pillewan',
    title: 'Benefits Officer & Project Support Professional'
  }
};

export default function ThankYouPage({ params }) {
  const { id } = use(params);
  const contributor = contributorsMap[id];

  if (!contributor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Contributor not found</h1>
          <Link href="/contributors" className="text-purple-400 hover:underline">
            Back to Contributors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-16">
      {/* Back button */}
      <div className="fixed top-20 left-4 z-50">
        <Link
          href={`/contributors/${id}`}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Profile</span>
        </Link>
      </div>

      <StickyNotes contributorId={id} contributorName={contributor.name} />
    </main>
  );
}
