import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { chatWithAssistant } from '../../services/aiService';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hey, I'm Rex — your RB_Protein fitness assistant. Ask me about protein timing, macros, or what to stack with your goals." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await chatWithAssistant(text, history);
      setMessages((m) => [...m, { role: 'assistant', text: res.reply || "I couldn't process that — try rephrasing." }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'The assistant is temporarily unavailable. Please try again shortly.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-brand-green-500 text-brand-black grid place-items-center shadow-glow hover:scale-105 transition-transform"
        aria-label="Open fitness chatbot"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[28rem] rounded-2xl border border-gray-200 dark:border-brand-border
                        bg-white dark:bg-brand-surface shadow-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-brand-black text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-green-500 animate-pulse" />
            <span className="font-display font-semibold">Rex — Fitness AI</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl ${
                m.role === 'user'
                  ? 'ml-auto bg-brand-green-500 text-brand-black rounded-br-sm'
                  : 'bg-gray-100 dark:bg-brand-charcoal rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="text-xs text-gray-400">Rex is typing…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-brand-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about macros, timing, stacks…"
              className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-100 dark:bg-brand-charcoal focus:outline-none"
            />
            <button onClick={send} className="h-9 w-9 grid place-items-center rounded-full bg-brand-green-500 text-brand-black">
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
