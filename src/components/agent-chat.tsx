'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import type { AgentId } from '@/lib/agents/types';
import { AGENTS } from '@/lib/agents/types';
import { DefaultChatTransport } from 'ai';

interface AgentChatProps {
  agentId: AgentId;
  apiEndpoint: string;
  placeholder?: string;
  isDark?: boolean;
  extraBody?: Record<string, unknown>;
  className?: string;
}

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
  const { messages, sendMessage, status, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: apiEndpoint,
        body: { agentId, ...extraBody },
      }),
    });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Auto-scroll on new messages
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
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 border-b ${
          isDark ? 'border-brand-navy-mid' : 'border-gray-100'
        }`}
      >
        <span className="text-xl">{agent.icon}</span>
        <div className="flex-1">
          <h3
            className={`text-sm font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {agent.name}
          </h3>
          <p className="model-tag" style={{ color: agent.color }}>
            {agent.modelTag}
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full animate-pulse-glow"
          style={{ background: agent.color }}
        />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[500px] ${
          isDark ? 'scrollbar-dark' : ''
        }`}
      >
        {messages.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="text-3xl block mb-2">{agent.icon}</span>
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
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
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
            >
              {msg.role === 'user' ? '👤' : agent.icon}
            </div>

            {/* Message bubble */}
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
                {msg.parts.map((part, idx) => {
                  if (part.type === 'text') {
                    return <span key={idx}>{part.text}</span>;
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

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
            <span>⚠️</span>
            <span>Something went wrong. Please try again.</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-3 py-2.5 border-t ${
          isDark ? 'border-brand-navy-mid' : 'border-gray-100'
        }`}
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
            isDark
              ? 'bg-brand-navy border border-brand-navy-mid text-white placeholder:text-gray-500 focus:border-brand-green/50'
              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-blue/50'
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
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
