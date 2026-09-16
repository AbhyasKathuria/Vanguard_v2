import React from 'react';
import { FileText, Video } from 'lucide-react';

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Just now';
  }
};

export default function MessageBubble({ msg, isOwn }) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      paddingInline: 4,
    }}>
      <div style={{
        maxWidth: '68%',
        minWidth: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap: 4,
      }}>
        {!isOwn && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: 'var(--accent)',
            paddingLeft: 4,
          }}>
            {msg.senderName}
          </span>
        )}

        <div style={{
          padding: '10px 14px',
          borderRadius: isOwn
            ? '16px 16px 4px 16px'
            : '16px 16px 16px 4px',
          background: isOwn ? 'var(--accent)' : 'var(--surface-2)',
          color: isOwn ? '#fff' : 'var(--text)',
          fontSize: 15,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          boxSizing: 'border-box',
        }}>
          {msg.type === 'audio' ? (
            <div>
              <audio controls src={msg.audioData || msg.audioUrl || msg.mediaUrl}
                     style={{ maxWidth: 220, height: 36 }}
                     preload="metadata" />
              <div style={{
                fontSize: 12, marginTop: 4,
                color: isOwn ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
              }}>
                Voice message
              </div>
            </div>
          ) : msg.type === 'image' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', maxWidth: 240 }}>
                <img 
                  src={msg.mediaUrl} 
                  alt="shared" 
                  style={{ width: '100%', objectFit: 'cover', maxHeight: 180, display: 'block', cursor: 'pointer' }}
                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                />
              </div>
              {msg.text && <p style={{ fontSize: 13, fontStyle: 'italic', marginTop: 4 }}>{msg.text}</p>}
            </div>
          ) : msg.type === 'pdf' ? (
            <a 
              href={msg.mediaUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                color: isOwn ? '#fff' : 'var(--text)',
                background: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 750,
                maxWidth: 240,
                border: '1px solid var(--border)',
              }}
            >
              <FileText style={{ width: 16, height: 16, flexShrink: 0 }} /> Download PDF Report
            </a>
          ) : msg.type === 'video' ? (
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', maxWidth: 240, position: 'relative' }}>
              <video src={msg.mediaUrl} style={{ width: '100%', objectFit: 'cover', maxHeight: 180, display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                <button 
                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                  className="w-10 h-10 bg-white/25 hover:bg-white/45 text-white flex items-center justify-center rounded-full cursor-pointer shadow-md transition"
                  style={{ border: 'none' }}
                >
                  <Video style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          ) : (
            msg.text
          )}
        </div>

        <span style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          paddingInline: 4,
        }}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}
