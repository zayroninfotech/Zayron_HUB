export default function Completion() {
  return (
    <div className="completion-page">
      <div className="completion-card">
        <div className="completion-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Thank You!</h1>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)', marginBottom: 20 }}>Onboarding Completed Successfully</h2>

        <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
          <p style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 12 }}>What you've completed:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Non-Disclosure Agreement (NDA) signed',
              'Personal information submitted',
              'Bank details recorded',
              'Documents uploaded',
            ].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 14, color: 'var(--gray-700)' }}>
                <span style={{ width: 20, height: 20, background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 8 }}>
          Welcome to <strong>Zayron Infotech Pvt. Ltd.</strong>! We are excited to have you on board.
        </p>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.7 }}>
          Our HR team will review your submitted documents and contact you shortly regarding your joining formalities, ID card, and other details.
        </p>

        <div style={{ marginTop: 32, padding: '16px 24px', background: '#eff6ff', borderRadius: 10, fontSize: 13, color: 'var(--primary)' }}>
          📧 A copy of your signed NDA has been sent to your registered email address. Please keep it for your records.
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--gray-200)', fontSize: 12, color: 'var(--gray-400)' }}>
          © 2024 Zayron Infotech Pvt. Ltd. · HR Onboarding Portal
        </div>
      </div>
    </div>
  )
}
