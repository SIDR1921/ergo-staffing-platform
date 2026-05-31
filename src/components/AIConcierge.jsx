import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, MessageSquare } from 'lucide-react';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import { app } from '../lib/firebase';

const QUICK_CHIPS = [
  { label: 'Why do you need my SSN?', q: 'Why do you need my SSN?' },
  { label: 'How do I get paid?', q: 'How and when do I get paid?' },
  { label: 'Talk to a human', q: 'How do I reach a real person?' },
  { label: 'What labs do I visit?', q: 'Which labs can I use for testing?' },
];

async function getAIResponse(messages) {
  try {
    // In production with Firebase Blaze plan, uncomment this:
    // const functions = getFunctions(app);
    // const chatWithAI = httpsCallable(functions, 'chatWithAI');
    // const result = await chatWithAI({ messages });
    // return result.data.reply;

    // For prototype without Blaze plan:
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lastMsg = messages[messages.length - 1].text.toLowerCase();
    
    if (lastMsg.includes('ssn')) {
      return "We collect your SSN securely for background checks and tax reporting (1099). It is encrypted with AES-256-GCM.";
    } else if (lastMsg.includes('pay')) {
      return "Direct deposit is issued within 24-48 hours of a completed shift. Instant Pay enabled shifts receive funds within 2 hours.";
    } else if (lastMsg.includes('human') || lastMsg.includes('person')) {
      return "You can contact human support at support@ergo.health or call (555) 123-4567 (8AM-8PM EST).";
    } else if (lastMsg.includes('lab')) {
      return "Please visit Quest Diagnostics or LabCorp for your screenings. TB tests, drug screens, and flu vaccines are covered by Ergo.";
    } else {
      return "I can help you with questions regarding onboarding, compliance, and platform policies. How else can I assist you?";
    }
  } catch (e) {
    console.error("LLM Error:", e);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}

export default function AIConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput('');
    const newMessages = [...messages, { id: Date.now(), role: 'user', text: trimmed }];
    setMessages(newMessages);
    setTyping(true);
    
    const reply = await getAIResponse(newMessages);
    
    setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', text: reply }]);
    setTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 997,
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-text)', color: 'var(--color-accent)',
              border: '3px solid var(--color-accent)', boxShadow: 'var(--shadow-brutal)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 997,
              width: '380px', height: '520px',
              background: 'var(--color-bg)', border: '3px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', boxShadow: '8px 8px 0 var(--color-border)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem', borderBottom: '2px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--color-text)', color: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem' }}>FLOAT ASSISTANT</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-accent)' }}>AI CONCIERGE • ALWAYS ON</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 && (
                <div style={{ padding: '1rem', border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'rgba(0,229,255,0.05)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-accent)' }}>Hi! I'm Float Assistant.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>I can answer questions about onboarding, documents, and policies. Tap a chip or type a question.</p>
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`brutal-chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="brutal-chat-bubble assistant" style={{ display: 'flex', gap: '4px', padding: '0.75rem 1rem' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} className="animate-pulse" />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div style={{ padding: '0.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              {QUICK_CHIPS.map(c => (
                <button key={c.label} onClick={() => send(c.q)} disabled={typing}
                  style={{
                    fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '9999px',
                    border: '1px solid var(--color-accent)', background: 'rgba(0,229,255,0.05)',
                    color: 'var(--color-accent-dark)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s', opacity: typing ? 0.5 : 1
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '2px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
              <input
                className="brutal-input small"
                placeholder="Ask anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                disabled={typing}
              />
              <button className="brutal-button small" onClick={() => send(input)} disabled={typing || !input.trim()}>
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
