import { createClient } from 'npm:@supabase/supabase-js@2'; // 從 npm:@supabase/supabase-js@2 載入相依介面，供驗證裝置並更新最新環境數據使用
import { createEnvironmentHandler } from './handler.ts'; // 從 ./handler.ts 載入相依介面，供驗證裝置並更新最新環境數據使用
function serverKey(): string { // 定義 serverKey()：處理 驗證裝置並更新最新環境數據 的 serverKey 邏輯
  const named = Deno.env.get('SUPABASE_SECRET_KEYS')?.trim(); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
  if (named) { // 檢查 (named)；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      const parsed = JSON.parse(named); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
      if (typeof parsed.default === 'string' && parsed.default) return parsed.default; // 檢查 (typeof parsed.default === 'string' && parsed.default) return parsed.default;；成立時才執行此分支
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      return named; // 回傳 named，交給 serverKey() 的呼叫端
    } // 結束 serverKey() 的目前區塊、參數或資料結構
  } // 結束 serverKey() 的目前區塊、參數或資料結構
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
  if (!legacy) throw new Error('Missing server-side Supabase key'); // 檢查 (!legacy) throw new Error('Missing server-side Supabase key');；成立時才執行此分支
  return legacy; // 回傳 legacy，交給 serverKey() 的呼叫端
} // 結束 serverKey() 的目前區塊、參數或資料結構
Deno.serve( // 啟動 Edge Function 的 HTTP 請求入口
  createEnvironmentHandler(() => // 呼叫 createEnvironmentHandler()，建立裝置驗證與資料寫入處理器
    createClient(Deno.env.get('SUPABASE_URL') || '', serverKey(), { // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
      auth: { persistSession: false, autoRefreshToken: false }, // 設定 auth 欄位的值或型別
    }), // 結束 事件回呼() 的目前區塊、參數或資料結構
  ), // 結束 驗證裝置並更新最新環境數據 的目前區塊、參數或資料結構
); // 結束 驗證裝置並更新最新環境數據 的目前區塊、參數或資料結構
