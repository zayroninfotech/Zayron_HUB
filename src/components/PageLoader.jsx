export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(2px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <svg viewBox="0 0 56 56" style={{ position: 'absolute', inset: 0, animation: 'spin 1.2s linear infinite' }}>
            <circle cx="28" cy="28" r="24" fill="none" stroke="#e0e7ff" strokeWidth="4" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#1e40af" strokeWidth="4"
              strokeDasharray="60 96" strokeLinecap="round" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20
          }}>⚡</div>
        </div>
        <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{text}</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%', background: '#1e40af',
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite alternate`
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { from { transform: translateY(0); opacity: 0.4; } to { transform: translateY(-8px); opacity: 1; } }
      `}</style>
    </div>
  )
}
