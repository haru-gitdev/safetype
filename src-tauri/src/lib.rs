use tauri::{Manager, Emitter};
use tauri::menu::{Menu, MenuItem, Submenu, PredefinedMenuItem};
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
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![simulate_paste])
        .setup(|app| {
            // ウィンドウを取得
            let window = app.get_webview_window("main").unwrap();

            // メニューを作成
            let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?;

            let app_submenu = Submenu::with_items(
                app,
                "Safetype",
                true,
                &[
                    &PredefinedMenuItem::about(app, Some("About Safetype"), None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &settings_item,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?;

            let edit_submenu = Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?;

            let menu = Menu::with_items(app, &[&app_submenu, &edit_submenu])?;
            app.set_menu(menu)?;

            // メニューイベントをハンドル
            let window_clone = window.clone();
            app.on_menu_event(move |_app, event| {
                if event.id().as_ref() == "settings" {
                    // フロントエンドに設定画面を開くよう通知
                    window_clone.emit("open-settings", ()).unwrap();
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // 赤ボタン（閉じるボタン）を押したときの処理
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // ウィンドウを閉じずに非表示にする
                api.prevent_close();
                window.hide().unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
