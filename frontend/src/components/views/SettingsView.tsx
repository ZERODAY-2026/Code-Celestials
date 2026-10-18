import React, { useState } from 'react'
import type { HealthResponse, PrivacyStatus } from '../../types'
import { fetchHealth } from '../../api'

interface SettingsViewProps {
  health: HealthResponse | null
  privacy: PrivacyStatus | null
  onClearAllDocs: () => void
  onReloadSamples: () => void
  totalDocs: number
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  privacy,
  onClearAllDocs,
  onReloadSamples,
  totalDocs,
}) => {
  const [temperature, setTemperature] = useState(0.1)
  const [maxTokens, setMaxTokens] = useState(8192)
  const [isPinging, setIsPinging] = useState(false)
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [airGappedEnforced, setAirGappedEnforced] = useState(true)

  const handleTestConnection = async () => {
    setIsPinging(true)
    setPingResult(null)
    try {
      const h = await fetchHealth()
      setPingResult(`Connected to Ollama on loopback! Model: ${h.model_name}`)
    } catch (err: any) {
      setPingResult(`Connection error: ${err?.message || 'Check Ollama is running on 127.0.0.1:11434'}`)
    } finally {
      setIsPinging(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '840px' }}>
      {/* 1. Model Configuration */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
              Local AI Engine Configuration
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Settings for on-device Gemma 3n inference running via local Ollama.
            </p>
          </div>
          <button
            type="button"
            className="counsel-btn-white"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={handleTestConnection}
            disabled={isPinging}
          >
            {isPinging ? 'Pinging...' : '⚡ Test Connection'}
          </button>
        </div>

        {pingResult && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              marginBottom: '16px',
              background: pingResult.includes('Connected') ? '#ECFDF5' : '#FEF2F2',
              color: pingResult.includes('Connected') ? '#047857' : '#DC2626',
              border: `1px solid ${pingResult.includes('Connected') ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            {pingResult}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Local Endpoint URL
            </label>
            <input
              type="text"
              readOnly
              value={health?.ollama_url || 'http://127.0.0.1:11434'}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#F9FAFB',
                color: '#4B5563',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Active Model
            </label>
            <input
              type="text"
              readOnly
              value={health?.model_name || 'gemma3n:4b'}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#F9FAFB',
                color: '#4B5563',
              }}
            />
          </div>
        </div>

        {/* Temperature Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            <span>Inference Temperature (Lower = More Deterministic)</span>
            <span>{temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9CA3AF' }}>
            <span>0.0 (Strict Grounding)</span>
            <span>1.0 (Creative)</span>
          </div>
        </div>

        {/* Max Tokens Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            <span>Max Predict Tokens</span>
            <span>{maxTokens} tokens</span>
          </div>
          <input
            type="range"
            min="2048"
            max="16384"
            step="1024"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* 2. Privacy & Air-Gap Enforcement */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          Air-Gapped Privacy & Security Safeguards
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '16px' }}>
          CounselDesk is engineered to eliminate data leakage risks in sensitive legal analysis.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAF9', borderRadius: '6px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#111827' }}>
                Strict Local Loopback Only
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                All requests routed strictly to 127.0.0.1. External HTTP egress blocked.
              </div>
            </div>
            <input
              type="checkbox"
              checked={airGappedEnforced}
              onChange={(e) => setAirGappedEnforced(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAF9', borderRadius: '6px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#111827' }}>
                Zero Telemetry or Prompt Logging
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                No prompt contents, extracted text, or user inquiries are logged to disk.
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '4px' }}>
              ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* 3. Storage & Workspace Reset */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          Workspace Data & Reset
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '16px' }}>
          Currently managing <strong>{totalDocs}</strong> document(s) in local workspace.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="counsel-btn-white"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            onClick={onReloadSamples}
          >
            Load 3 Sample Contracts
          </button>

          <button
            type="button"
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              borderRadius: '6px',
              border: '1px solid #DC2626',
              background: '#FFFFFF',
              color: '#DC2626',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => {
              if (confirm('Are you sure you want to clear all loaded contracts from your local workspace?')) {
                onClearAllDocs()
              }
            }}
          >
            Clear All Workspace Documents
          </button>
        </div>
      </div>
    </div>
  )
}
