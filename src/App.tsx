import { useState, useEffect, useRef, useCallback } from 'react'
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { Settings } from './components/Settings'
import { useSettings } from './hooks/useSettings'
import { AppSettings } from './types/settings'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const appWindow = getCurrentWindow()

  const { settings, isLoading, saveSettings } = useSettings()

  // 透過度をCSS変数に反映
  useEffect(() => {
    document.documentElement.style.setProperty('--app-opacity', String(settings.appearance.opacity))
  }, [settings.appearance.opacity])

  // テキストを送信してペースト
  const submitAndPaste = useCallback(async () => {
    if (!text.trim()) return

    try {
      // クリップボードにコピー
      await writeText(text)

      // ウィンドウを非表示
      await appWindow.hide()
      setIsVisible(false)
      setText('')

      // フォーカスが元のアプリに戻るまで待つ（500ms）
      await new Promise(resolve => setTimeout(resolve, 500))

      // Rust側でペーストをシミュレート
      await invoke('simulate_paste')
    } catch (error) {
      console.error('Paste failed:', error)
    }
  }, [text, appWindow])

  // キャンセル
  const cancel = useCallback(async () => {
    await appWindow.hide()
    setIsVisible(false)
    setText('')
  }, [appWindow])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+, で設定画面を開く（どの状態でも有効）
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
        return
      }

      // 設定画面が開いている場合は他のショートカットを無視
      if (showSettings) return

      // ⌘+Enter で送信
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        submitAndPaste()
      }
      // Esc でキャンセル
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submitAndPaste, cancel, showSettings])

  // ショートカット値からaccelerator部分を取得
  const getAccelerator = (shortcutValue: string) => shortcutValue.split('|')[0]

  // グローバルホットキーの登録
  useEffect(() => {
    if (isLoading) return

    let lastToggleTime = 0
    const DEBOUNCE_MS = 300

    const setupShortcut = async () => {
      try {
        await unregisterAll()

        // 設定から取得したショートカットでウィンドウ表示（accelerator部分のみ使用）
        await register(getAccelerator(settings.shortcuts.toggleWindow), async () => {
          // デバウンス処理
          const now = Date.now()
          if (now - lastToggleTime < DEBOUNCE_MS) {
            return
          }
          lastToggleTime = now

          const visible = await appWindow.isVisible()
          if (visible) {
            await appWindow.hide()
            setIsVisible(false)
          } else {
            await appWindow.show()
            await appWindow.setFocus()
            setIsVisible(true)
            // テキストエリアにフォーカス
            setTimeout(() => textareaRef.current?.focus(), 50)
          }
        })
      } catch (error) {
        console.error('Failed to register shortcut:', error)
      }
    }

    setupShortcut()

    return () => {
      unregisterAll()
    }
  }, [appWindow, settings.shortcuts.toggleWindow, isLoading])

  // ウィンドウ表示時にテキストエリアにフォーカス
  useEffect(() => {
    if (isVisible && textareaRef.current && !showSettings) {
      textareaRef.current.focus()
    }
  }, [isVisible, showSettings])

  // メニューからの設定画面オープンイベントをリッスン
  useEffect(() => {
    const unlisten = listen('open-settings', () => {
      setShowSettings(true)
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // 設定保存ハンドラ
  const handleSaveSettings = useCallback(async (newSettings: AppSettings) => {
    await saveSettings(newSettings)
  }, [saveSettings])

  // ショートカット表示用のフォーマット
  const formatShortcutDisplay = (shortcutValue: string) => {
    // "accelerator|displayKey" 形式の場合、displayKeyを使用
    const [accelerator, displayKey] = shortcutValue.split('|')
    if (displayKey) return displayKey

    // displayKeyがない場合はacceleratorをフォーマット
    const isMac = navigator.platform.includes('Mac')
    return accelerator
      .replace('CommandOrControl', isMac ? '⌘' : 'Ctrl')
      .replace('+Enter', '+Enter')
      .replace('+', '+')
  }

  if (isLoading) {
    return (
      <div className="container loading">
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div className="editor-wrapper">
        <div className="toolbar">
          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            title="Settings (⌘,)"
          >
            <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/>
            </svg>
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here..."
          className="editor"
          autoFocus
        />
        <div className="actions">
          <span className="hint">
            <kbd>{formatShortcutDisplay(settings.shortcuts.submitPaste).split('+')[0]}</kbd>+<kbd>Enter</kbd> to paste
            <span className="separator">|</span>
            <kbd>Esc</kbd> to cancel
          </span>
          <button onClick={submitAndPaste} disabled={!text.trim()}>
            Paste
          </button>
        </div>
      </div>

      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
