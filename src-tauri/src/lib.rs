use tauri::Manager;
use enigo::{Enigo, Keyboard, Settings, Key, Direction};
use std::thread;
use std::time::Duration;

// 前のアプリにフォーカスを戻してから⌘Vをシミュレート
#[tauri::command]
fn simulate_paste() -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    {
        // Cmd+Tab で前のアプリに切り替え
        enigo.key(Key::Meta, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Tab, Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Meta, Direction::Release).map_err(|e| e.to_string())?;

        // フォーカスが切り替わるまで待つ
        thread::sleep(Duration::from_millis(300));

        // ⌘V でペースト
        enigo.key(Key::Meta, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Unicode('v'), Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Meta, Direction::Release).map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        // Alt+Tab で前のアプリに切り替え
        enigo.key(Key::Alt, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Tab, Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Alt, Direction::Release).map_err(|e| e.to_string())?;

        thread::sleep(Duration::from_millis(300));

        // Ctrl+V でペースト
        enigo.key(Key::Control, Direction::Press).map_err(|e| e.to_string())?;
        enigo.key(Key::Unicode('v'), Direction::Click).map_err(|e| e.to_string())?;
        enigo.key(Key::Control, Direction::Release).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![simulate_paste])
        .setup(|app| {
            // ウィンドウを取得
            let _window = app.get_webview_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
