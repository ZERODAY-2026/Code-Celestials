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
            <rect x="14" y="8" width="36" height="46" rx="6" fill="#061F18" stroke="#059669" strokeWidth="1.8"/>
            <path d="M22 20h20M22 26h20M22 32h14" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="42" cy="42" r="14" fill="#059669"/>
            <path d="M42 34a4 4 0 0 0-4 4v3h8v-3a4 4 0 0 0-4-4z" fill="#F8FAFC"/>
            <rect x="36" y="41" width="12" height="8" rx="2" fill="#021C16"/>
            <circle cx="42" cy="45" r="1.5" fill="#34D399"/>
          </svg>
        </div>

        <div className="counsel-privacy-banner-text">
          <h3>Private. Secure. On Your Device.</h3>
          <p>Your documents are processed locally, keeping confidential legal information under your control.</p>
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
