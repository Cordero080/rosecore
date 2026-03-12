import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './ChatWidget.css'

const CHAT_URL = 'http://localhost:3001/api/chat'

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
      : part
  )
}

const DEFAULT_W = 340
const DEFAULT_H = 460

export default function ChatWidget() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [teaserVisible, setTeaserVisible] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [size, setSize] = useState({ width: DEFAULT_W, height: DEFAULT_H })
  const bottomRef = useRef(null)

  // Set initial greeting and update it when language changes
  useEffect(() => {
    setMessages(prev => [
      { from: 'bot', text: t('chat.greeting') },
      ...prev.slice(1),
    ])
  }, [i18n.resolvedLanguage]) // eslint-disable-line react-hooks/exhaustive-deps

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
        body: JSON.stringify({
          message: text,
          sessionId: window.__chatSessionId || (window.__chatSessionId = crypto.randomUUID()),
          lang: i18n.resolvedLanguage || 'en',
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: t('chat.error') }])
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

  function startResize(e) {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startW = size.width
    const startH = size.height

    function onMove(e) {
      setSize({
        width:  Math.max(280, Math.min(800, startW + (startX - e.clientX))),
        height: Math.max(360, Math.min(860, startH + (startY - e.clientY))),
      })
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-resize-handle" onMouseDown={startResize} title="Drag to resize" />
      )}
      <div
        className={`chat-panel ${open ? 'chat-panel--open' : ''}`}
        style={open ? { width: size.width, height: size.height } : undefined}
      >
        <div className="chat-header">
          <div className="chat-header-identity">
            <span className="chat-vita-name">{t('chat.title')}</span>
            <span className="chat-vita-role">{t('chat.role')}</span>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${msg.from}`}>
              {linkify(msg.text)}
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
            placeholder={t('chat.placeholder')}
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

      {teaserVisible && !open && (
        <button className="chat-teaser" onClick={() => setOpen(true)} aria-label="Chat with Vita">
          <span className="chat-teaser-text">{t('chat.teaser')}</span>
          <span className="chat-teaser-dismiss" onClick={e => { e.stopPropagation(); setTeaserVisible(false) }}>✕</span>
        </button>
      )}
    </div>
  )
}
