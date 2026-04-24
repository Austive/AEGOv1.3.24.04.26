import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChatProps {
  bookingId: string;
}

export default function Chat({ bookingId }: ChatProps) {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) return;

    const q = query(
      collection(db, 'messages'),
      where('bookingId', '==', bookingId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [bookingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !role) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        bookingId,
        senderId: user.uid,
        senderRole: role,
        text: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-4">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-white">Live Operations Chat</h3>
        <span className="text-xs text-green-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Secure Channel
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            No messages yet. Send a message to start coordinating.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    {msg.senderRole}
                  </span>
                  {msg.createdAt && (
                    <span className="text-[10px] text-zinc-600">
                      {format(msg.createdAt.toDate(), 'HH:mm')}
                    </span>
                  )}
                </div>
                <div 
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    isMe 
                    ? 'bg-white text-black rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-300 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
          disabled={isSending}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || isSending}
          className="p-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
