// 設定の型定義
export interface AppSettings {
  shortcuts: {
    toggleWindow: string   // default: "CommandOrControl+Shift+Space"
    submitPaste: string    // default: "CommandOrControl+Enter"
  }
  appearance: {
    opacity: number        // default: 1.0 (0.3 - 1.0)
  }
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  shortcuts: {
    toggleWindow: 'CommandOrControl+Shift+Space',
    submitPaste: 'CommandOrControl+Enter',
  },
  appearance: {
    opacity: 1.0,
  },
}

// 透過度の範囲
export const OPACITY_MIN = 0.3
export const OPACITY_MAX = 1.0
export const OPACITY_STEP = 0.05
