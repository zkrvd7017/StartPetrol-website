import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'admin';
  content: string;
  created_at?: string;
}

const getOrCreateUserId = (): string => {
  try {
    const key = 'sp_user_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const uid = (self.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(key, uid);
    return uid;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const ChatWidget = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_ORIGIN || '';
  const WS_ORIGIN = (import.meta as any).env?.VITE_WS_ORIGIN || '';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'admin', content: "Salom! Savollaringizni yozing: narx, yetkazib berish, mahsulotlar va hokazo." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [since, setSince] = useState<string | null>(null);
  const [userId] = useState<string>(() => getOrCreateUserId());
  const endRef = useRef<HTMLDivElement | null>(null);
  const pollTimer = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // WebSocket connect on session
  useEffect(() => {
    if (!sessionId) return;
    const wsBase = WS_ORIGIN || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
    const url = `${wsBase}/ws/webchat/${sessionId}/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data && data.role === 'admin' && data.content) {
          setMessages((prev: ChatMessage[]) => ([...prev, { role: 'admin', content: String(data.content), created_at: data.created_at }]));
          if (data.created_at) setSince(data.created_at);
        }
      } catch { }
    };
    ws.onclose = () => { wsRef.current = null; };
    return () => { ws.close(); };
  }, [sessionId]);

  // Polling fallback for admin replies
  useEffect(() => {
    if (!sessionId) return;
    const poll = async () => {
      try {
        const base = API_BASE || window.location.origin;
        const url = new URL(`/api/webchat/${sessionId}/poll/`, base);
        if (since) url.searchParams.set('since', since);
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          const onlyAdmin = data.filter((m: any) => m.role === 'admin');
          if (onlyAdmin.length) {
            setMessages((prev: ChatMessage[]) => ([
              ...prev,
              ...onlyAdmin.map((m: any): ChatMessage => ({ role: 'admin', content: m.content as string, created_at: m.created_at as string }))
            ]));
          }
          const last = data[data.length - 1];
          if (last?.created_at) setSince(last.created_at);
        }
      } catch { }
    };
    if (!wsRef.current) {
      poll();
      pollTimer.current = window.setInterval(poll, 2000);
    }
    return () => { if (pollTimer.current) window.clearInterval(pollTimer.current); };
  }, [sessionId, since]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/send-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, user_id: userId, session_id: sessionId || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.session_id && !sessionId) setSessionId(String(data.session_id));
      }
    } catch {
      setMessages(prev => [...prev, { role: 'admin', content: 'Ulanishda xatolik. Keyinroq urinib ko‘ring.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!open ? (
          <Button onClick={() => setOpen(true)} className="rounded-full shadow-lg btn-glow">
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat
          </Button>
        ) : null}
      </div>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96">
          <Card className="shadow-xl border border-border/50 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="font-semibold">Yordamchi</div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block px-3 py-2 rounded-xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} whitespace-pre-line`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-border/50 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Savolingizni yozing..."
              />
              <Button onClick={sendMessage} disabled={loading} className="btn-glow">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
