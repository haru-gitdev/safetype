import { useEffect, useCallback, useRef } from 'react'
import { register, unregister } from '@tauri-apps/plugin-global-shortcut'

interface UseShortcutsOptions {
  toggleWindowShortcut: string
  onToggle: () => void
}

export function useShortcuts({ toggleWindowShortcut, onToggle }: UseShortcutsOptions) {
  const currentShortcutRef = useRef<string | null>(null)
  const lastToggleTimeRef = useRef(0)
  const DEBOUNCE_MS = 300

  // ショートカットを登録
  const registerShortcut = useCallback(async (shortcut: string) => {
    try {
      // 既存のショートカットを解除
      if (currentShortcutRef.current) {
        try {
          await unregister(currentShortcutRef.current)
        } catch {
          // 既に解除されている可能性があるので無視
        }
      }

      // 新しいショートカットを登録
      await register(shortcut, async () => {
        // デバウンス処理
        const now = Date.now()
        if (now - lastToggleTimeRef.current < DEBOUNCE_MS) {
          return
        }
        lastToggleTimeRef.current = now

        onToggle()
      })

      currentShortcutRef.current = shortcut
    } catch (error) {
      console.error('Failed to register shortcut:', error)
      throw error
    }
  }, [onToggle])

  // ショートカット設定変更時に再登録
  useEffect(() => {
    registerShortcut(toggleWindowShortcut)

    return () => {
      if (currentShortcutRef.current) {
        unregister(currentShortcutRef.current).catch(() => {})
      }
    }
  }, [toggleWindowShortcut, registerShortcut])

  return { registerShortcut }
}

// ウィンドウ内のキーボードショートカット用フック
interface UseLocalShortcutsOptions {
  submitPasteShortcut: string
  onSubmit: () => void
  onCancel: () => void
}

export function useLocalShortcuts({ submitPasteShortcut, onSubmit, onCancel }: UseLocalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 送信ショートカット（CommandOrControl+Enterの形式をパース）
      const isModKey = e.metaKey || e.ctrlKey
      if (isModKey && e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }

      // Escでキャンセル
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submitPasteShortcut, onSubmit, onCancel])
}
