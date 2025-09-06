// components/WebcamEmbed.js
"use client";

import { useEffect } from "react";
import { webcamIDs } from "./WebcamIDs";

export default function WebcamEmbed({ city }) {
  const webcamId = webcamIDs[city.toLowerCase()];

  useEffect(() => {
    // Load the Windy player script dynamically
    const script = document.createElement("script");
    script.src = "https://webcams.windy.com/webcams/public/embed/v2/script/player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [webcamId]);

  if (!webcamId) return <p>No webcam available for {city}</p>;

  return (
    <div className="w-full h-[300px] mt-4 bg-white text-white rounded p-4">
      <a
        name="windy-webcam-timelapse-player"
        data-id={webcamId}
        data-play="day"
        data-loop="0"
        data-auto-play="0"
        data-force-full-screen-on-overlay-play="0"
        data-interactive="1"
        href={`https://windy.com/webcams/${webcamId}`}
        target="_blank"
      >
        {city} - Live Webcam
      </a>
    </div>
  );
}