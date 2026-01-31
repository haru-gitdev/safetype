import { useState, useCallback } from 'react'
import './ShortcutInput.css'

interface ShortcutInputProps {
  value: string  // "accelerator|displayKey" 形式、または "accelerator" のみ
  onChange: (shortcut: string) => void
  label: string
}

// ショートカット値をパース
function parseShortcutValue(value: string): { accelerator: string; displayKey?: string } {
  const [accelerator, displayKey] = value.split('|')
  return { accelerator, displayKey }
}

// 許可されたキーのリスト（Tauriのglobal-shortcutで使用可能なキー）
const ALLOWED_KEYS = new Set([
  // 英字
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // 数字
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // ファンクションキー
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  // 特殊キー
  'Space', 'Enter', 'Tab', 'Backspace', 'Delete', 'Escape',
  'Up', 'Down', 'Left', 'Right',
  'Home', 'End', 'PageUp', 'PageDown',
  // 記号（Tauriでサポートされているもののみ）
  'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash',
  'Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Backquote',
])

// キーコードをTauriショートカット形式に変換（displayKey付き）
function keyEventToShortcut(e: KeyboardEvent): { accelerator: string; displayKey: string } | null {
  const parts: string[] = []
  const displayParts: string[] = []
  const isMac = navigator.platform.includes('Mac')

  // 修飾キーのみの場合は無視
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    return null
  }

  // 修飾キー（Ctrl と Cmd を別々に扱う）
  if (e.metaKey) {
    parts.push('Command')
    displayParts.push('⌘')
  }
  if (e.ctrlKey) {
    parts.push('Control')
    displayParts.push('^')
  }
  if (e.altKey) {
    parts.push('Alt')
    displayParts.push(isMac ? '⌥' : 'Alt')
  }
  if (e.shiftKey) {
    parts.push('Shift')
    displayParts.push(isMac ? '⇧' : 'Shift')
  }

  // メインキー（Tauri用）
  let mainKey = e.key
  // 表示用キー（ユーザーが実際に押したキー）
  let displayMainKey = e.key

  // 特殊キーの変換
  if (mainKey === ' ') {
    mainKey = 'Space'
    displayMainKey = '␣'
  } else if (mainKey === 'Enter') {
    displayMainKey = '↵'
  } else if (mainKey === 'Escape') {
    mainKey = 'Escape'
    displayMainKey = 'Esc'
  } else if (mainKey === 'Backspace') {
    displayMainKey = '⌫'
  } else if (mainKey === 'Delete') {
    displayMainKey = '⌦'
  } else if (mainKey === 'Tab') {
    displayMainKey = '⇥'
  } else if (mainKey === 'ArrowUp') {
    mainKey = 'Up'
    displayMainKey = '↑'
  } else if (mainKey === 'ArrowDown') {
    mainKey = 'Down'
    displayMainKey = '↓'
  } else if (mainKey === 'ArrowLeft') {
    mainKey = 'Left'
    displayMainKey = '←'
  } else if (mainKey === 'ArrowRight') {
    mainKey = 'Right'
    displayMainKey = '→'
  }
  // 英数字は大文字に
  else if (/^[a-zA-Z0-9]$/.test(mainKey)) {
    mainKey = mainKey.toUpperCase()
    displayMainKey = mainKey.toUpperCase()
  }
  // 記号キーはcodeから取得（Tauri用）、表示はe.keyをそのまま使う
  else if (e.code.startsWith('Key')) {
    mainKey = e.code.replace('Key', '')
  } else if (e.code.startsWith('Digit')) {
    mainKey = e.code.replace('Digit', '')
  } else if (e.code === 'Minus') mainKey = 'Minus'
  else if (e.code === 'Equal') mainKey = 'Equal'
  else if (e.code === 'BracketLeft') mainKey = 'BracketLeft'
  else if (e.code === 'BracketRight') mainKey = 'BracketRight'
  else if (e.code === 'Backslash') mainKey = 'Backslash'
  else if (e.code === 'Semicolon') mainKey = 'Semicolon'
  else if (e.code === 'Quote') mainKey = 'Quote'
  else if (e.code === 'Comma') mainKey = 'Comma'
  else if (e.code === 'Period') mainKey = 'Period'
  else if (e.code === 'Slash') mainKey = 'Slash'
  else if (e.code === 'Backquote') mainKey = 'Backquote'

  // 許可されたキーかチェック
  if (!ALLOWED_KEYS.has(mainKey)) {
    return null
  }

  parts.push(mainKey)
  displayParts.push(displayMainKey)

  // 少なくとも1つの修飾キーが必要
  if (parts.length < 2) {
    return null
  }

  return {
    accelerator: parts.join('+'),
    displayKey: displayParts.join(' + '),
  }
}

// キーコード→表示名のマッピング
const KEY_DISPLAY_NAMES: Record<string, string> = {
  'Space': '␣',
  'Enter': '↵',
  'Escape': 'Esc',
  'Backspace': '⌫',
  'Delete': '⌦',
  'Tab': '⇥',
  'Up': '↑',
  'Down': '↓',
  'Left': '←',
  'Right': '→',
  // 記号キー
  'Minus': '-',
  'Equal': '=',
  'BracketLeft': '[',
  'BracketRight': ']',
  'Backslash': '\\',
  'Semicolon': ';',
  'Quote': "'",
  'Comma': ',',
  'Period': '.',
  'Slash': '/',
  'Backquote': '`',
}

// ショートカットを表示用にフォーマット
function formatShortcut(shortcut: string): string {
  const isMac = navigator.platform.includes('Mac')

  return shortcut
    .split('+')
    .map(part => {
      if (part === 'CommandOrControl') return isMac ? '⌘' : 'Ctrl'  // 互換性のため残す
      if (part === 'Command') return '⌘'
      if (part === 'Control') return '^'
      if (part === 'Shift') return isMac ? '⇧' : 'Shift'
      if (part === 'Alt') return isMac ? '⌥' : 'Alt'
      return KEY_DISPLAY_NAMES[part] || part
    })
    .join(' + ')
}

export function ShortcutInput({ value, onChange, label }: ShortcutInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [tempResult, setTempResult] = useState<{ accelerator: string; displayKey: string } | null>(null)

  // 保存されている値をパース
  const { accelerator, displayKey } = parseShortcutValue(value)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const result = keyEventToShortcut(e.nativeEvent)
    if (result) {
      setTempResult(result)
    }
  }, [])

  const handleKeyUp = useCallback(() => {
    if (tempResult) {
      // "accelerator|displayKey" 形式で保存
      onChange(`${tempResult.accelerator}|${tempResult.displayKey}`)
      setIsRecording(false)
      setTempResult(null)
    }
  }, [tempResult, onChange])

  const handleFocus = useCallback(() => {
    setIsRecording(true)
    setTempResult(null)
  }, [])

  const handleBlur = useCallback(() => {
    setIsRecording(false)
    setTempResult(null)
  }, [])

  // 表示用の値を決定
  const displayValue = isRecording
    ? (tempResult ? tempResult.displayKey : 'Press keys...')
    : (displayKey || formatShortcut(accelerator))

  return (
    <div className="shortcut-input-wrapper">
      <label className="shortcut-label">{label}</label>
      <input
        type="text"
        className={`shortcut-input ${isRecording ? 'recording' : ''}`}
        value={displayValue}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readOnly
        placeholder="Click to record"
      />
    </div>
  )
}
