import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/chats/${roomId}`);
      setRoom(r.data.data);
      const m = await api.get(`/chats/${roomId}/messages`);
      setMessages(m.data.data || []);
    } catch {
      toast.error('Failed to load chat');
    }
  }, [roomId]);

  useEffect(() => { load(); }, [load]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const m = await api.get(`/chats/${roomId}/messages`);
        setMessages(m.data.data || []);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(id);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      await api.post(`/chats/${roomId}/messages`, { text: t });
      setText('');
      const m = await api.get(`/chats/${roomId}/messages`);
      setMessages(m.data.data || []);
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (!room) return <p className="p-4 dark:text-white">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[75vh] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-semibold dark:text-white">💬 {room.itemName}</p>
          <p className="text-xs text-gray-500">
            Private chat between Finder and Claimant. Never share bank details.
          </p>
        </div>
        <Link to="/chats" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2.5 py-1 bg-indigo-50 rounded-lg">
          ← Back to Chats
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderUserId === user?.email;
          const isSystem = m.senderUserId === 'system';
          if (isSystem) {
            return (
              <div key={m.id} className="text-center">
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {m.text}
                </span>
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                isMe
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
              }`}>
                {!isMe && (
                  <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                    {m.senderName}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex gap-2">
        <input
          className="flex-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}