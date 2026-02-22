use std::{thread, time::Duration};
use tauri::{Emitter};
use x_win::get_active_window;


#[derive(Clone, serde::Serialize)]
struct WindowChange {
    app_name: String,
    window_title: String,
    timestamp: u64,
    position: WindowPosition,
}

#[derive(Clone, serde::Serialize)]
struct WindowPosition {
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    is_full_screen: bool,
}

#[tauri::command]
fn start_tracking(window: tauri::Window) {
    thread::spawn(move || {
        let mut last_app = String::new();

        loop {
            if let Ok(active) = get_active_window() {
                let current_app = active.info.name.clone();

                if current_app != last_app {
                    window
                        .emit(
                            "window_changed",
                            WindowChange {
                                app_name: current_app.clone(),
                                window_title: active.title.clone(),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64,
                                position: WindowPosition {
                                    x: active.position.x,
                                    y: active.position.y,
                                    width: active.position.width,
                                    height: active.position.height,
                                    is_full_screen: active.position.is_full_screen,
                                },
                            },
                        )
                        .ok();
                    last_app = current_app;
                }
            }
            thread::sleep(Duration::from_secs(1));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            start_tracking,
        ])
        .setup(|app| {
            // Set as Accessory app (no dock icon, appears above fullscreen)
            #[cfg(target_os = "macos")]
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Initialize global shortcuts plugin for desktop platforms
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_global_shortcut::Builder::new().build())?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
