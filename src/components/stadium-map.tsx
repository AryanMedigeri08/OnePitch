'use client';

import { useState, useEffect } from 'react';
import { getDensityColor } from '@/lib/utils';
import type { GateDensity } from '@/lib/mock-data-generator';

interface StadiumMapProps {
  gates: GateDensity[];
  onGateClick?: (gateId: string) => void;
  highlightedGate?: string | null;
  pins?: Array<{ x: number; y: number; label: string; color?: string }>;
  isDark?: boolean;
  className?: string;
}

export function StadiumMap({
  gates,
  onGateClick,
  highlightedGate,
  pins = [],
  isDark = false,
  className = '',
}: StadiumMapProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full aspect-square"
        style={{ maxHeight: '400px' }}
      >
        {/* Background */}
        <defs>
          <radialGradient id="field-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isDark ? '#0D3B1F' : '#2E7D32'} />
            <stop offset="100%" stopColor={isDark ? '#0A2914' : '#1B5E20'} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stadium outline — oval */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="42"
          fill={isDark ? '#132040' : '#E8EAF6'}
          stroke={isDark ? '#1E3A5F' : '#C5CAE9'}
          strokeWidth="0.5"
        />

        {/* Concourse ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="38"
          ry="36"
          fill="none"
          stroke={isDark ? '#1A2D50' : '#BBDEFB'}
          strokeWidth="0.3"
          strokeDasharray="2 1"
        />

        {/* Field */}
        <rect
          x="28"
          y="30"
          width="44"
          height="40"
          rx="3"
          fill="url(#field-gradient)"
          stroke={isDark ? '#1B5E20' : '#388E3C'}
          strokeWidth="0.4"
        />

        {/* Field markings */}
        <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="0.2" opacity="0.5" />
        <circle cx="50" cy="50" r="6" fill="none" stroke="white" strokeWidth="0.2" opacity="0.5" />
        <circle cx="50" cy="50" r="0.5" fill="white" opacity="0.5" />

        {/* Goal areas */}
        <rect x="38" y="30" width="24" height="5" rx="1" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4" />
        <rect x="38" y="65" width="24" height="5" rx="1" fill="none" stroke="white" strokeWidth="0.15" opacity="0.4" />

        {/* Gates */}
        {gates.map((gate) => {
          const color = getDensityColor(gate.density_pct);
          const isHighlighted = highlightedGate === gate.id;
          const isClosed = gate.status === 'closed';
          const label = `${gate.name.split('—')[0].trim()}: ${isClosed ? 'Closed' : `${gate.density_pct}% capacity`}. Accessibility: ${gate.accessible ? 'Accessible' : 'Standard'}. Click to toggle status.`;

          return (
            <g
              key={gate.id}
              role="button"
              tabIndex={0}
              aria-label={label}
              className="cursor-pointer transition-transform focus:outline-none focus:scale-110"
              onClick={() => onGateClick?.(gate.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onGateClick?.(gate.id);
                }
              }}
            >
              {/* Gate marker — outer ring */}
              {isHighlighted && (
                <circle
                  cx={gate.position.x}
                  cy={gate.position.y}
                  r="4"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  opacity="0.5"
                  className="animate-density-pulse"
                />
              )}

              {/* Gate dot */}
              <circle
                cx={gate.position.x}
                cy={gate.position.y}
                r={isHighlighted ? '2.5' : '2'}
                fill={isClosed ? '#666' : color}
                stroke={isDark ? '#0A1628' : '#FFFFFF'}
                strokeWidth="0.4"
                filter={isHighlighted ? 'url(#glow)' : undefined}
                opacity={isClosed ? 0.5 : 1}
              />

              {/* Closed X marker */}
              {isClosed && (
                <>
                  <line
                    x1={gate.position.x - 1.2}
                    y1={gate.position.y - 1.2}
                    x2={gate.position.x + 1.2}
                    y2={gate.position.y + 1.2}
                    stroke="#FF3D00"
                    strokeWidth="0.4"
                  />
                  <line
                    x1={gate.position.x + 1.2}
                    y1={gate.position.y - 1.2}
                    x2={gate.position.x - 1.2}
                    y2={gate.position.y + 1.2}
                    stroke="#FF3D00"
                    strokeWidth="0.4"
                  />
                </>
              )}

              {/* Label */}
              <text
                x={gate.position.x}
                y={gate.position.y - 3.5}
                textAnchor="middle"
                fill={isDark ? '#94A3B8' : '#475569'}
                fontSize="2"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {gate.name.split('—')[0].trim()}
              </text>

              {/* Density percentage */}
              <text
                x={gate.position.x}
                y={gate.position.y + 5}
                textAnchor="middle"
                fill={color}
                fontSize="1.8"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {isClosed ? 'CLOSED' : `${gate.density_pct}%`}
              </text>
            </g>
          );
        })}

        {/* Custom pins */}
        {pins.map((pin, i) => (
          <g key={i}>
            {/* Pin drop */}
            <circle
              cx={pin.x}
              cy={pin.y}
              r="1.5"
              fill={pin.color || '#FF4081'}
              filter="url(#glow)"
            />
            <text
              x={pin.x}
              y={pin.y - 3}
              textAnchor="middle"
              fill={pin.color || '#FF4081'}
              fontSize="1.6"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {pin.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className={`flex items-center justify-center gap-4 mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-density-green" /> &lt;50%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-density-yellow" /> 50-70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-density-orange" /> 70-85%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-density-red" /> &gt;85%
        </span>
      </div>
    </div>
  );
}
