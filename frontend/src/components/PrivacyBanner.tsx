import React from 'react'

interface PrivacyBannerProps {
  onLearnMore: () => void
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onLearnMore }) => {
  return (
    <div className="counsel-privacy-banner">
      <div className="counsel-privacy-banner-left">
        {/* Shield / Document Illustration */}
        <div className="counsel-privacy-banner-graphic">
          <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
            <rect x="14" y="8" width="36" height="46" rx="4" fill="#E8F8F2" stroke="#10B981" strokeWidth="1.8"/>
            <path d="M22 20h20M22 26h20M22 32h14" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="42" cy="42" r="14" fill="#10B981"/>
            <path d="M42 34a4 4 0 0 0-4 4v3h8v-3a4 4 0 0 0-4-4z" fill="#FFFFFF"/>
            <rect x="36" y="41" width="12" height="8" rx="2" fill="#065F46"/>
            <circle cx="42" cy="45" r="1.5" fill="#FFFFFF"/>
          </svg>
        </div>

        <div className="counsel-privacy-banner-text">
          <h3>Private. Secure. On your device.</h3>
          <p>All processing happens locally. Your documents never leave this device.</p>
          <a onClick={onLearnMore}>
            Learn more about our privacy →
          </a>
        </div>
      </div>

      <div className="counsel-verified-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Verified Local Processing</span>
      </div>
    </div>
  )
}
