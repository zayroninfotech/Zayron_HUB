export function BtnSpinner({ size = 16, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

export function ActionBtn({ loading, success, error, onClick, children, disabled, style = {}, className = '' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px',
    borderRadius: 8, border: 'none', cursor: loading || disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, fontSize: 14, transition: 'all 0.2s', opacity: loading || disabled ? 0.75 : 1,
    ...style
  }

  if (success) base.background = '#059669'
  else if (error) base.background = '#dc2626'
  else if (!style.background) base.background = '#1e40af'
  if (!style.color) base.color = 'white'

  return (
    <button style={base} className={className} onClick={onClick} disabled={loading || disabled}>
      {loading && <BtnSpinner />}
      {success && !loading && <span>✓</span>}
      {error && !loading && <span>✕</span>}
      {children}
    </button>
  )
}
