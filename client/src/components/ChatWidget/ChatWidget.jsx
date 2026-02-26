import { useState, useRef, useEffect } from 'react'
import './ChatWidget.css'
// const N8N_URL = 'http://localhost:5678/webhook-test/chat';

// This allows you to toggle easily or default to n8n
const CHAT_URL = 'http://localhost:3001/api/chat' ;

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me anything about the property — availability, pricing, amenities, and more.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message: text, sessionId: window.__chatSessionId || (window.__chatSessionId = crypto.randomUUID()) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-widget">
      <div className={`chat-panel ${open ? 'chat-panel--open' : ''}`}>
        <div className="chat-header">
          <span className="chat-title">Have a question?</span>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${msg.from}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble chat-bubble--bot">
              <span className="chat-dots">
                <span /><span /><span />
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask about availability, pricing..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>
            ↑
          </button>
        </div>
      </div>

      <button
        className={`chat-trigger ${open ? 'chat-trigger--active' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Open chat"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
