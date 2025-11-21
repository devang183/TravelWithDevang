'use client';
import dynamic from 'next/dynamic';

// Dynamically import the FlutterPresentation component with SSR disabled
const FlutterPresentation = dynamic(
  () => import('@/components/FlutterPresentation'),
  { ssr: false }
);

export default function FlutterPresentationPage() {
  return (
    <div className="min-h-screen bg-white">
      <FlutterPresentation />
    </div>
  );
}
