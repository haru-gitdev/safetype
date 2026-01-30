import { useState } from 'react'
import { ShortcutInput } from './ShortcutInput'
import { OpacitySlider } from './OpacitySlider'
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings'
import './Settings.css'

interface SettingsProps {
  settings: AppSettings
  onSave: (settings: AppSettings) => Promise<void>
  onClose: () => void
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShortcutChange = (key: keyof AppSettings['shortcuts'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      shortcuts: { ...prev.shortcuts, [key]: value },
    }))
    setError(null)
  }

  const handleOpacityChange = (opacity: number) => {
    setLocalSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, opacity },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      await onSave(localSettings)
      onClose()
    } catch (err) {
      setError('Failed to save settings. Please try again.')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS)
    setError(null)
  }

  const hasChanges =
    JSON.stringify(localSettings) !== JSON.stringify(settings)

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="settings-grid">
              <ShortcutInput
                label="Toggle Window"
                value={localSettings.shortcuts.toggleWindow}
                onChange={(v) => handleShortcutChange('toggleWindow', v)}
              />
              <ShortcutInput
                label="Submit & Paste"
                value={localSettings.shortcuts.submitPaste}
                onChange={(v) => handleShortcutChange('submitPaste', v)}
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>Appearance</h3>
            <OpacitySlider
              value={localSettings.appearance.opacity}
              onChange={handleOpacityChange}
            />
          </section>

          {error && <div className="settings-error">{error}</div>}
        </div>

        <div className="settings-footer">
          <button className="reset-button" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
