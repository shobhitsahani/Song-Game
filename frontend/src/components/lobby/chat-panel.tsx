'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, LogIn, LogOut, Gamepad2, SmilePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types';

interface TypingUser {
  userId: string;
  username: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onTyping?: () => void;
  onReaction?: (messageId: string, emoji: string) => void;
  typingUsers?: TypingUser[];
  currentUserId?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '🎵', '🔥', '🎉', '👏', '💯', '😎', '🤘'];

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isSystemMessage(msg: ChatMessage): boolean {
  return msg.userId === 'system' || msg.userId === undefined;
}

function getSystemIcon(msg: ChatMessage) {
  const text = msg.message.toLowerCase();
  if (text.includes('joined')) return <LogIn className="w-3 h-3" />;
  if (text.includes('left') || text.includes('kicked')) return <LogOut className="w-3 h-3" />;
  if (text.includes('host')) return <Gamepad2 className="w-3 h-3" />;
  return <MessageSquare className="w-3 h-3" />;
}

export function ChatPanel({
  messages, onSend, onTyping, onReaction, typingUsers = [], currentUserId,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const handleClickOutside = () => setShowEmojiPicker(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSend = useCallback(() => {
    if (input.trim()) {
      onSend(input.trim().slice(0, 200));
      setInput('');
      inputRef.current?.focus();
    }
  }, [input, onSend]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.length <= 200) {
        setInput(value);
        if (onTyping) {
          onTyping();
        }
      }
    },
    [onTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleReactionClick = useCallback((messageId: string, emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onReaction?.(messageId, emoji);
    setShowEmojiPicker(null);
  }, [onReaction]);

  const typingText = typingUsers.length > 0
    ? `${typingUsers.map((t) => t.username).join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
    : '';

  return (
    <div className="glass rounded-xl flex flex-col h-full">
      <div className="p-3 border-b border-white/5 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-purple-400" />
        <p className="text-sm font-medium">Room Chat</p>
        {messages.length > 0 && (
          <span className="text-[10px] text-muted-foreground ml-auto">{messages.length} messages</span>
        )}
      </div>

      <ScrollArea className="flex-1" ref={scrollRef} onScroll={handleScroll}>
        <div className="p-3 space-y-2">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <MessageSquare className="w-10 h-10 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No messages yet</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Be the first to say something!
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isSystem = isSystemMessage(msg);
              const isCurrent = msg.userId === currentUserId;
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  {isSystem ? (
                    <div className="flex items-center gap-2 py-1.5 px-2">
                      <span className="text-muted-foreground/40 shrink-0">
                        {getSystemIcon(msg)}
                      </span>
                      <p className="text-xs text-muted-foreground/60 italic flex-1">
                        {msg.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/30 shrink-0">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex items-start gap-2 px-2 py-1 rounded-lg ${
                      isCurrent ? 'bg-purple-500/5' : ''
                    }`}>
                      <Avatar className="w-6 h-6 mt-0.5 shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.username}`} />
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                          {msg.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-purple-400 truncate">
                            {msg.username}
                            {isCurrent && <span className="text-muted-foreground text-[10px] ml-1">(you)</span>}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40 shrink-0 ml-auto">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          {onReaction && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-foreground"
                            >
                              <SmilePlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-foreground/80 break-words mt-0.5">
                          {msg.message}
                        </p>
                        {hasReactions && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Object.entries(msg.reactions!).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={(e) => handleReactionClick(msg.id, emoji, e)}
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
                                  users.includes(currentUserId || '')
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px]">{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {showEmojiPicker === msg.id && onReaction && (
                    <div
                      className="absolute right-0 top-full z-50 mt-1 p-1.5 glass rounded-xl border border-white/10 shadow-xl flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => handleReactionClick(msg.id, emoji, e)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <AnimatePresence>
        {typingText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="px-3 py-1"
          >
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic">
              <div className="flex gap-0.5">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  className="w-1 h-1 bg-muted-foreground rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-1 h-1 bg-muted-foreground rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  className="w-1 h-1 bg-muted-foreground rounded-full"
                />
              </div>
              <span className="ml-1">{typingText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm pr-12"
              autoComplete="off"
              enterKeyHint="send"
              maxLength={200}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40">
              {input.length}/200
            </span>
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-9 w-9 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ChatPanel as ChatBox };
