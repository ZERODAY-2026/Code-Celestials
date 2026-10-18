import React from 'react'
import { AlertTriangleIcon } from './Icons'

interface DisclaimerBannerProps {
  customMessage?: string
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  customMessage,
}) => {
  return (
    <div className="disclaimer-banner" role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <AlertTriangleIcon />
      </div>
      <div>
        <strong>LEGAL DISCLAIMER // NON-PRIVILEGED</strong>
        <span style={{ marginLeft: '8px' }}>
          {customMessage ||
            'This analysis is generated deterministically by a local Gemma edge model for preliminary issue-spotting and triage. It does not constitute legal counsel, enforceable contract review, or attorney-client privilege. Consult a licensed legal practitioner for definitive representation.'}
        </span>
      </div>
    </div>
  )
}
