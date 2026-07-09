'use client';

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { AgentId } from '@/lib/agents/types';
import { AGENTS } from '@/lib/agents/types';

interface AgentChatProps {
  agentId: AgentId;
  apiEndpoint: string;
  placeholder?: string;
  isDark?: boolean;
  extraBody?: Record<string, unknown>;
  className?: string;
}

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index} className="font-bold">{part.slice(1, -1)}</strong>;
    }

    return part;
  });
}

function parseMarkdown(text: string): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];

  lines.forEach((line, index) => {
    const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (listMatch) {
      elements.push(
        <li key={`li-${index}`} className="ml-4 list-disc mb-1">
          {formatInline(listMatch[1])}
        </li>
      );
      return;
    }

    const h3Match = line.match(/^###\s+(.*)$/);
    if (h3Match) {
      elements.push(
        <h4 key={`h4-${index}`} className="font-bold text-sm mt-3 mb-1">
          {formatInline(h3Match[1])}
        </h4>
      );
      return;
    }

    const h2Match = line.match(/^##\s+(.*)$/);
    if (h2Match) {
      elements.push(
        <h3 key={`h3-${index}`} className="font-bold text-base mt-4 mb-2">
          {formatInline(h2Match[1])}
        </h3>
      );
      return;
    }

    const h1Match = line.match(/^#\s+(.*)$/);
    if (h1Match) {
      elements.push(
        <h2 key={`h2-${index}`} className="font-extrabold text-lg mt-4 mb-2">
          {formatInline(h1Match[1])}
        </h2>
      );
      return;
    }

    if (line.trim() === '') {
      elements.push(<div key={`br-${index}`} className="h-2" />);
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="mb-1 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
}

const MarkdownMemo = memo(function MarkdownMemo({ text }: { text: string }) {
  const parsed = useMemo(() => parseMarkdown(text), [text]);
  return <>{parsed}</>;
});

export function AgentChat({
  agentId,
  apiEndpoint,
  placeholder = 'Type your message...',
  isDark = false,
  extraBody = {},
  className = '',
}: AgentChatProps) {
  const agent = AGENTS[agentId];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      body: { agentId, ...extraBody },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`flex flex-col h-full rounded-xl border overflow-hidden ${
        isDark
          ? 'bg-brand-navy-light border-brand-navy-mid'
          : 'bg-white border-gray-200'
      } ${className}`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2.5 border-b ${
          isDark ? 'border-brand-navy-mid' : 'border-gray-100'
        }`}
      >
        <span
          className="h-8 min-w-8 px-2 rounded-lg flex items-center justify-center text-[10px] font-black tracking-wide"
          style={{ background: `${agent.color}20`, color: agent.color }}
          aria-label={`${agent.name} agent`}
        >
          {agent.icon}
        </span>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {agent.name}
          </h3>
          <p className="model-tag" style={{ color: agent.color }}>
            {agent.modelTag}
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full animate-pulse-glow"
          style={{ background: agent.color }}
          aria-hidden="true"
        />
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isLoading}
        className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[500px] ${
          isDark ? 'scrollbar-dark' : ''
        }`}
      >
        {messages.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span
              className="mx-auto mb-2 h-10 min-w-10 px-2 rounded-xl inline-flex items-center justify-center text-[11px] font-black tracking-wide"
              style={{ background: `${agent.color}16`, color: agent.color }}
              aria-label={`${agent.name} agent`}
            >
              {agent.icon}
            </span>
            <p className="text-sm">{agent.tagline}</p>
            <p className="text-xs mt-1 opacity-60">Ask me anything</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message flex gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                msg.role === 'user'
                  ? isDark
                    ? 'bg-brand-blue/20 text-brand-blue'
                    : 'bg-blue-100 text-blue-600'
                  : ''
              }`}
              style={
                msg.role === 'assistant'
                  ? {
                      background: `${agent.color}20`,
                      color: agent.color,
                    }
                  : undefined
              }
              aria-hidden="true"
            >
              {msg.role === 'user' ? 'YOU' : agent.icon}
            </div>

            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? isDark
                    ? 'bg-brand-blue/15 text-gray-100'
                    : 'bg-blue-50 text-gray-900'
                  : isDark
                    ? 'bg-white/5 text-gray-200'
                    : 'bg-gray-50 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <div key={index}><MarkdownMemo text={part.text} /></div>;
                  }

                  return null;
                })}
              </div>
              {msg.role === 'assistant' && (
                <div className="mt-1.5 model-tag" style={{ color: agent.color }}>
                  Powered by: {agent.modelTag}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5" aria-hidden="true">
            <div
              className="h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-[9px] font-black"
              style={{ background: `${agent.color}20`, color: agent.color }}
            >
              {agent.icon}
            </div>
            <div
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className="typing-dot" style={{ background: agent.color }} />
              <div className="typing-dot" style={{ background: agent.color }} />
              <div className="typing-dot" style={{ background: agent.color }} />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm" role="alert">
            <span aria-hidden="true">!</span>
            <span>Something went wrong. Please try again.</span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        aria-label="Agent message input form"
        className={`flex items-center gap-2 px-3 py-2.5 border-t ${
          isDark ? 'border-brand-navy-mid' : 'border-gray-100'
        }`}
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label="Message text"
          className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
            isDark
              ? 'bg-brand-navy border border-brand-navy-mid text-white placeholder:text-gray-500 focus:border-brand-green/50'
              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-blue/50'
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className={`p-2 rounded-lg transition-all ${
            isLoading || !input.trim()
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:scale-105 active:scale-95'
          }`}
          style={{ color: agent.color }}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}
