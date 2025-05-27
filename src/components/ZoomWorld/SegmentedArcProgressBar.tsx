import React from 'react';

interface Segment {
  color: string;
  label?: string;
}

interface SegmentedArcProgressBarProps {
  segments: Segment[];
  radius: number;
  thickness: number;
  containerSize: number;
  active?: boolean;
}

// Helper to describe an SVG arc
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

export const SegmentedArcProgressBar: React.FC<SegmentedArcProgressBarProps> = ({
  segments,
  radius,
  thickness,
  containerSize,
  active = true,
}) => {
  const cx = containerSize / 2;
  const cy = containerSize / 2;
  const segmentAngle = 360 / segments.length;
  const startOffset = 270; // Start at bottom (270deg)

  return (
    <svg
      width={containerSize}
      height={containerSize}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}
    >
      {active && segments.map((segment, i) => {
        const startAngle = startOffset + i * segmentAngle;
        const endAngle = startOffset + (i + 1) * segmentAngle;
        return (
          <path
            key={i}
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            stroke={segment.color}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}; 