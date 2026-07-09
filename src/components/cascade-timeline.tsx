'use client';

import type { CascadeEvent } from '@/lib/agents/types';

interface CascadeTimelineProps {
  events: CascadeEvent[];
  className?: string;
}

export function CascadeTimeline({ events, className = '' }: CascadeTimelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {events.map((event, index) => (
        <div
          key={event.id}
          className="animate-cascade-reveal flex gap-3"
          style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
        >
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-lg"
              style={{
                background: `${event.agentColor}20`,
                border: `2px solid ${event.agentColor}`,
              }}
            >
              {event.agentIcon}
            </div>
            {index < events.length - 1 && (
              <div
                className="w-0.5 flex-1 min-h-[20px]"
                style={{ background: `${event.agentColor}30` }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            {/* Agent name + time */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: event.agentColor }}
              >
                {event.agentName}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  event.type === 'alert'
                    ? 'bg-red-500/15 text-red-400'
                    : event.type === 'action'
                      ? 'bg-amber-500/15 text-amber-400'
                      : event.type === 'resolution'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-blue-500/15 text-blue-400'
                }`}
              >
                {event.type.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-white mb-1">
              {event.title}
            </h4>

            {/* Message */}
            <div className="text-xs text-gray-400 leading-relaxed bg-white/5 rounded-lg px-3 py-2 border border-white/5">
              <pre className="whitespace-pre-wrap font-sans">{event.message}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
