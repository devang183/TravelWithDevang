'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

const CityWordCloud = ({ cities, onCitySelect, selectedCity }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 400
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 400
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare words data with more controlled sizing
  const words = cities.map((city, i) => {
    // Base size on city name length for better visual hierarchy
    const baseSize = 12 + (city.name.length * 1.5);
    return {
      text: city.name,
      value: baseSize + (Math.random() * 10), // Less random variation
      city: city,
      angle: (i * 137.5) % 360 // Golden angle for even distribution
    };
  }).sort((a, b) => b.value - a.value); // Sort by size for better layout

  const fontScale = scaleLinear()
    .domain([0, Math.max(...words.map(w => w.value))])
    .range([14, 42]); // Slightly smaller max size for better fit

  // Calculate positions with better spacing
  const getPosition = (word, index, total) => {
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35; // Smaller radius for more space
    const angle = (word.angle * Math.PI) / 180;
    
    // Add some randomness to the radius to create a more natural spread
    const r = radius * (0.7 + (Math.random() * 0.3));
    
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      angle: angle
    };
  };

  if (!isClient) {
    return <div ref={containerRef} className="w-full h-[400px]" />;
  }

  return (
    <div ref={containerRef} className="w-full h-[500px] relative bg-white/5 rounded-xl p-6">
      <svg width="100%" height="100%">
        <g transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
          {words.map((word, i) => {
            const isSelected = selectedCity?.name === word.city.name;
            const { x, y } = getPosition(word, i, words.length);
            const size = fontScale(word.value);
            const opacity = isSelected ? 1 : 0.8;
            const padding = 4; // Add padding for better clickability
            
            return (
              <g 
                key={word.text}
                transform={`translate(${x}, ${y})`}
                style={{
                  cursor: 'pointer',
                  opacity,
                  transition: 'all 0.3s ease',
                }}
                onClick={() => onCitySelect(word.city)}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = isSelected ? 1 : 0.8}
              >
                <rect
                  x={-size * (word.text.length * 0.3) - padding}
                  y={-size * 0.8 - padding/2}
                  width={size * (word.text.length * 0.3) * 2 + padding*2}
                  height={size * 1.5 + padding}
                  rx={4}
                  ry={4}
                  fill={isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
                  className="transition-colors duration-200"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: `${size}px`,
                    fill: isSelected ? '#3b82f6' : schemeCategory10[i % 10],
                    fontWeight: isSelected ? 'bold' : 'normal',
                    pointerEvents: 'none',
                  }}
              >
                  {word.text}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default CityWordCloud;
