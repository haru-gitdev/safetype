import { useState, useEffect, useRef, useCallback } from 'react'
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const appWindow = getCurrentWindow()

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
  }, [submitAndPaste, cancel])

  // グローバルホットキーの登録
  useEffect(() => {
    let lastToggleTime = 0
    const DEBOUNCE_MS = 300

    const setupShortcut = async () => {
      try {
        await unregisterAll()

        // ⌘+Shift+Space でウィンドウ表示
        await register('CommandOrControl+Shift+Space', async () => {
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
  }, [appWindow])

  // ウィンドウ表示時にテキストエリアにフォーカス
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isVisible])

  return (
    <div className="container" data-tauri-drag-region>
      <div className="editor-wrapper">
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
            <kbd>⌘</kbd>+<kbd>Enter</kbd> to paste
            <span className="separator">|</span>
            <kbd>Esc</kbd> to cancel
          </span>
          <button onClick={submitAndPaste} disabled={!text.trim()}>
            Paste
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
