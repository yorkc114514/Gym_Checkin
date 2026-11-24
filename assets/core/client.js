import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js'; // 從 ./config.js 載入相依介面，供共用連線與本機資料儲存使用
import { loadScript } from './vendor-loader.js'; // 從 ./vendor-loader.js 載入相依介面，供共用連線與本機資料儲存使用
export let client = null; // 宣告可更新的 Supabase 用戶端，供共用連線與本機資料儲存使用
export async function initializeClient() { // 定義 initializeClient()：處理 共用連線與本機資料儲存 的 initializeClient 邏輯
  await loadScript( // 等待非同步操作完成後，才繼續同一流程
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', // 提供 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 文字、路徑或資料欄位值
    () => typeof window.supabase?.createClient === 'function', // 續接 事件回呼() 的運算、回呼或參數：() => typeof window.supabase?.createClient === 'function',
  ); // 結束 initializeClient() 的目前區塊、參數或資料結構
  if (!client) // 檢查 (!client)；成立時才執行此分支
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { // 更新 Supabase 用戶端，保存本步處理結果
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }, // 設定 auth 欄位的值或型別
    }); // 結束 initializeClient() 的目前區塊、參數或資料結構
  return client; // 回傳 client，交給 initializeClient() 的呼叫端
} // 結束 initializeClient() 的目前區塊、參數或資料結構
