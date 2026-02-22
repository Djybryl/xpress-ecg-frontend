import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Tables } from '@/lib/database.types';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: Tables['users']['Row'];
}

interface ChatWindowProps {
  recipientId: string;
  ecgRecordId?: string;
}

export function ChatWindow({ recipientId, ecgRecordId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(*)
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('recipient_id', recipientId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [recipientId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage,
          ecg_record_id: ecgRecordId
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === recipientId ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.sender_id === recipientId
                  ? 'bg-gray-100'
                  : 'bg-blue-100'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-500">
                {format(new Date(message.created_at), 'PPp', { locale: fr })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>Envoyer</Button>
        </div>
      </div>
    </div>
  );
}