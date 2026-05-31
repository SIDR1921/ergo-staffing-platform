import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, User, Building2, Clock } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_THREADS = [
  { id: 1, name: 'Memorial Hospital', role: 'facility', lastMsg: 'Your shift on May 15 has been confirmed. Please arrive 15 minutes early.', time: '2:30 PM', unread: 2 },
  { id: 2, name: 'Ergo Support', role: 'admin', lastMsg: 'Your credential verification is complete. You are now shift-ready!', time: '11:15 AM', unread: 0 },
  { id: 3, name: 'City Medical Center', role: 'facility', lastMsg: 'We have an urgent overnight shift available. Are you interested?', time: 'Yesterday', unread: 1 },
  { id: 4, name: 'Sunrise Care', role: 'facility', lastMsg: 'Thank you for your excellent work last week. We would love to have you back.', time: 'May 12', unread: 0 },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'Memorial Hospital', isMe: false, text: 'Hi Sarah, we have a night shift opening on May 15th. Would you be available?', time: '10:00 AM' },
    { id: 2, sender: 'You', isMe: true, text: 'Yes, I\'m available! What time does it start?', time: '10:15 AM' },
    { id: 3, sender: 'Memorial Hospital', isMe: false, text: '7:00 PM to 7:00 AM. ICU floor. Rate is $52/hr.', time: '10:20 AM' },
    { id: 4, sender: 'You', isMe: true, text: 'Perfect, I\'ll take it. I\'ll be there at 6:45.', time: '10:25 AM' },
    { id: 5, sender: 'Memorial Hospital', isMe: false, text: 'Your shift on May 15 has been confirmed. Please arrive 15 minutes early.', time: '2:30 PM' },
  ],
};

export default function Messages() {
  const [selectedThread, setSelectedThread] = useState(null);
  const [search, setSearch] = useState('');
  const [newMsg, setNewMsg] = useState('');

  const filteredThreads = MOCK_THREADS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const messages = selectedThread ? (MOCK_MESSAGES[selectedThread] || []) : [];
  const thread = MOCK_THREADS.find(t => t.id === selectedThread);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    alert('Message sent: ' + newMsg);
    setNewMsg('');
  };

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>MESSAGES</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Communicate with facilities and support.</p>
        </motion.div>

        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1rem', height: 'calc(100vh - 14rem)' }}>
          {/* Thread List */}
          <div className="brutal-card no-hover" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="brutal-input small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredThreads.map(t => (
                <div key={t.id} onClick={() => setSelectedThread(t.id)}
                  style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', cursor: 'pointer', background: selectedThread === t.id ? 'rgba(0,229,255,0.08)' : 'transparent', borderLeft: selectedThread === t.id ? '3px solid var(--color-accent)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {t.role === 'facility' ? <Building2 size={14} /> : <User size={14} />}
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }} className="line-clamp-2">{t.lastMsg}</p>
                    {t.unread > 0 && <span className="brutal-badge accent" style={{ fontSize: '0.6rem', minWidth: '20px', textAlign: 'center' }}>{t.unread}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="brutal-card no-hover" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selectedThread ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <Send size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>SELECT A CONVERSATION</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-border)' }}>
                    {thread?.role === 'facility' ? <Building2 size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{thread?.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{thread?.role === 'facility' ? 'Healthcare Facility' : 'Support Team'}</div>
                  </div>
                </div>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.map(m => (
                    <div key={m.id} className={`brutal-chat-bubble ${m.isMe ? 'user' : 'assistant'}`}>
                      <p style={{ margin: 0 }}>{m.text}</p>
                      <div style={{ fontSize: '0.65rem', color: m.isMe ? 'rgba(0,0,0,0.5)' : 'var(--color-text-muted)', marginTop: '0.25rem' }}>{m.time}</div>
                    </div>
                  ))}
                </div>
                {/* Input */}
                <div style={{ padding: '1rem', borderTop: '2px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                  <input className="brutal-input small" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
                  <button className="brutal-button small" onClick={sendMessage}><Send size={14} /></button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
