import { useState, useEffect, useCallback } from 'react'
import { LazyStore } from '@tauri-apps/plugin-store'
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings'

const STORE_FILE = 'settings.json'
const store = new LazyStore(STORE_FILE)

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // 設定を読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const shortcuts = await store.get<AppSettings['shortcuts']>('shortcuts')
        const appearance = await store.get<AppSettings['appearance']>('appearance')

        setSettings({
          shortcuts: shortcuts ?? DEFAULT_SETTINGS.shortcuts,
          appearance: appearance ?? DEFAULT_SETTINGS.appearance,
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // 設定を保存
  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await store.set('shortcuts', newSettings.shortcuts)
      await store.set('appearance', newSettings.appearance)
      await store.save()

      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }, [])

  // ショートカット設定の更新
  const updateShortcuts = useCallback(async (shortcuts: AppSettings['shortcuts']) => {
    const newSettings = { ...settings, shortcuts }
    await saveSettings(newSettings)
  }, [settings, saveSettings])

  // 外観設定の更新
  const updateAppearance = useCallback(async (appearance: AppSettings['appearance']) => {
    const newSettings = { ...settings, appearance }
    await saveSettings(newSettings)
  }, [settings, saveSettings])

  // 設定をリセット
  const resetSettings = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  return {
    settings,
    isLoading,
    saveSettings,
    updateShortcuts,
    updateAppearance,
    resetSettings,
  }
}
