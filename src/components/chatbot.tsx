
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { chatbotAction } from '@/lib/actions';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', content: "Hello! I'm the Earth Insights assistant. How can I help you today?" }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, userMessage];
    const result = await chatbotAction({ messages: newMessages });

    setIsLoading(false);

    if (result.error) {
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } else if (result.data) {
      const modelMessage: ChatMessage = { role: 'model', content: result.data.response };
      setMessages(prev => [...prev, modelMessage]);
    }
  };

  return (
    <>
      {isOpen ? (
        <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col z-50 shadow-2xl rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Earth Insights Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            <ScrollArea className="h-full" ref={scrollAreaRef as any}>
                <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'model' && (
                     <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                   <div className={cn(
                        'p-3 rounded-lg max-w-[80%]',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  {message.role === 'user' && (
                     <Avatar className="w-8 h-8">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
