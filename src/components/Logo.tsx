import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  iconColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  textColor = 'text-[#005396]',
  iconColor = '#005396',
}) => {
  // Dimensions according to size
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text1: 'text-xs', text2: 'text-sm' },
    md: { icon: 'w-9 h-9', text1: 'text-sm tracking-tight', text2: 'text-lg tracking-tight' },
    lg: { icon: 'w-12 h-12', text1: 'text-base', text2: 'text-xl' },
    xl: { icon: 'w-16 h-16', text1: 'text-xl', text2: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  // Helper to generate hexagon points
  const getHexagonPoints = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 90; // pointy top
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = cx + r * Math.cos(angleRad);
      const y = cy + r * Math.sin(angleRad);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  };

  // Center (60, 60)
  const cx = 60;
  const cy = 60;
  const R = 38; // Distance to outer hexagons
  const hexR = 10.5; // Radius of outer hexagons

  // Angles for 6 outer arms
  const angles = [-90, -30, 30, 90, 150, 210];
  const outerCenters = angles.map((a) => {
    const rad = (Math.PI / 180) * a;
    return {
      x: cx + R * Math.cos(rad),
      y: cy + R * Math.sin(rad),
      angle: a,
    };
  });

  // Inner star vertices pointing outward between main arms (at -60, 0, 60, 120, 180, 240)
  const midAngles = [-60, 0, 60, 120, 180, 240];
  const starOutR = 25;
  const starInR = 12;

  // Star polygon points
  const starPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    // Outer point of inner star
    const aOut = (Math.PI / 180) * midAngles[i];
    starPoints.push({
      x: cx + starOutR * Math.cos(aOut),
      y: cy + starOutR * Math.sin(aOut),
    });
    // Inner point of inner star
    const aIn = (Math.PI / 180) * angles[i];
    starPoints.push({
      x: cx + starInR * Math.cos(aIn),
      y: cy + starInR * Math.sin(aIn),
    });
  }

  const starPolyString = starPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <div className={`flex items-center gap-2.5 shrink-0 whitespace-nowrap ${className}`}>
      {/* SVG Icon matching the exact logo in image */}
      <svg
        viewBox="0 0 120 120"
        className={`${currentSize.icon} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Central Hexagon */}
        <polygon
          points={getHexagonPoints(cx, cy, 11)}
          stroke={iconColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner 6-pointed star lattice */}
        <polygon
          points={starPolyString}
          stroke={iconColor}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Lines connecting center to 6 outer hexagons */}
        {outerCenters.map((oc, i) => {
          const innerRad = (Math.PI / 180) * oc.angle;
          const startX = cx + 11 * Math.cos(innerRad);
          const startY = cy + 11 * Math.sin(innerRad);
          const endX = oc.x - hexR * Math.cos(innerRad);
          const endY = oc.y - hexR * Math.sin(innerRad);

          return (
            <line
              key={i}
              x1={startX.toFixed(2)}
              y1={startY.toFixed(2)}
              x2={endX.toFixed(2)}
              y2={endY.toFixed(2)}
              stroke={iconColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* 6 Outer Hexagons */}
        {outerCenters.map((oc, i) => (
          <polygon
            key={`hex-${i}`}
            points={getHexagonPoints(oc.x, oc.y, hexR)}
            stroke={iconColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>

      {/* Brand Name Text - exact 2-line layout from image */}
      {!iconOnly && (
        <div className={`flex flex-col leading-tight select-none shrink-0 whitespace-nowrap ${textColor}`}>
          <span className={`font-normal ${currentSize.text1} text-[#005396] whitespace-nowrap`}>
            Điện lạnh
          </span>
          <span className={`font-bold ${currentSize.text2} text-[#005396] whitespace-nowrap`}>
            Công Thương
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
