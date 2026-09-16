import React from 'react';
import useAuth from '../../hooks/useAuth';

export default function WorkerCard({ worker, onHire }) {
  const { dbUser } = useAuth();
  const currentUserDistrict = dbUser?.district;
  const initial = (worker.name || 'W').charAt(0).toUpperCase()

  const skillColors = {
    electrician: { bg: '#FEF3C7', color: '#D97706' },
    plumber: { bg: '#DBEAFE', color: '#1D4ED8' },
    farmer: { bg: '#D1FAE5', color: '#065F46' },
    construction: { bg: '#FCE7F3', color: '#9D174D' },
    carpenter: { bg: '#EDE9FE', color: '#5B21B6' },
    labor: { bg: '#FEE2E2', color: '#991B1B' },
  }

  const primarySkill = (worker.skills?.[0] || '').toLowerCase()
  const skillStyle = skillColors[primarySkill] || 
    { bg: 'var(--accent-soft)', color: 'var(--accent)' }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 20px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
    }}>
      {/* Initials avatar */}
      <div style={{
        width: 50, height: 50, flexShrink: 0,
        borderRadius: '50%',
        background: skillStyle.bg,
        color: skillStyle.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800,
        fontFamily: 'inherit',
      }}>
        {initial}
      </div>

      {/* Worker info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 8, flexWrap: 'wrap', marginBottom: 4,
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700,
            color: 'var(--text)',
          }}>
            {worker.name}
          </span>
          {worker.district === currentUserDistrict && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: '#D1FAE5', color: '#065F46',
              padding: '2px 8px', borderRadius: 20,
            }}>
              Near you
            </span>
          )}
          {!worker.isAvailable && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: '#FEE2E2', color: '#991B1B',
              padding: '2px 8px', borderRadius: 20,
            }}>
              Unavailable
            </span>
          )}
        </div>

        {/* Stars */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginBottom: 6,
        }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{
              fontSize: 14,
              color: s <= Math.round(worker.rating || 0)
                ? '#F59E0B' : 'var(--border)',
            }}>★</span>
          ))}
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            marginLeft: 4,
          }}>
            ({worker.reviewCount || 0} reviews)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {(worker.skills || []).join(' · ')}
          </span>
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: 'var(--accent)',
          }}>
            ₹{worker.dailyRate || 0}/day
          </span>
        </div>
      </div>

      {/* Hire button — proper rectangle, NOT a tiny pill */}
      <button
        onClick={() => onHire?.(worker)}
        disabled={!worker.isAvailable}
        style={{
          flexShrink: 0,
          minWidth: 72,
          padding: '10px 20px',
          background: worker.isAvailable ? 'var(--accent)' : 'var(--surface-3)',
          color: worker.isAvailable ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: worker.isAvailable ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}
      >
        {worker.isAvailable ? 'Hire' : 'Busy'}
      </button>
    </div>
  )
}
