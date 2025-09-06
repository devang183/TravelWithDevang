
'use client';
import Image from "next/image";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import dynamic from 'next/dynamic';
import { Legend } from "chart.js";
const VideoTextPage = dynamic(() => import('@/components/VideoText/page'), { ssr: false });
const WorldMap = dynamic(() => import('@/components/worldmap'), { ssr: false });

export default function HomePage() {
  const isSidebarCollapsed = true;

  return (
    <main>
      <div 
        className="min-h-screen max-w-20xl mx-auto p-0 py-0 overflow-y-auto" 
        >
      <VideoTextPage collapsed={isSidebarCollapsed} />
      <WorldMap />
      </div>
    </main>
  );
}
