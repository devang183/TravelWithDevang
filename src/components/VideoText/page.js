'use client';
import React from 'react';

export default function VideoTextPage({collapsed=false}) {
  return (
    <div className={`w-full flex items-center justify-center overflow-hidden ${
      collapsed ? 'sidebar-collapsed' : ''
    }`}>
      <div className="relative text-center">
        {/* Background Video (hidden but used for masking) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-contain opacity-0 pointer-events-none"
          id="textVideo"
        >
          {/* <source src="/coverr-walking-near-the-shallow-water-5816-1080p.mp4" type="video/mp4" />
           */}
           <source src="/smoke.mp4" type="video/mp4" />
        </video>

        {/* Text Mask with video inside */}
        <div
          className={`${
            collapsed ? 'text-[14vw]' : 'text-[10vw]'
          } font-extrabold lowercase leading-none bg-white video-text w-full max-w-none`}
          style={{
            fontFamily: '"Playfair Display", serif',
            backgroundImage: 'url(/smoke.mp4)',
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            wordSpacing: collapsed ? '2rem' : 'normal',
          }}
        >
          DEVANG KANKARIA
        </div>
      </div>
    </div>
  );
}

