import { client } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供溫度、濕度與照度使用
export async function loadEnvironment(signal) { // 定義 loadEnvironment()：讀取每台裝置最新環境數據
  const { data, error } = await client // 續接 loadEnvironment() 的運算、回呼或參數：const { data, error } = await client
    .from('environment_latest') // 選取 Supabase 的 environment_latest 資料表，後續串接查詢或寫入
    .select( // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
      'device_id,device_code,display_name,temperature_c,humidity_pct,illuminance_lux,light_status,wifi_rssi,sampled_at,received_at', // 提供 'device_id,device_code,display_name,temperature_c,humidity_pct,illuminance_lux,l… 文字、路徑或資料欄位值
    ) // 結束 loadEnvironment() 的目前區塊、參數或資料結構
    .order('display_name') // 呼叫 .order()，處理 溫度、濕度與照度 的 order 邏輯
    .abortSignal(signal); // 把取消訊號交給資料查詢，讓逾時或離開頁面時能停止等待
  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  return data || []; // 回傳 data || []，交給 loadEnvironment() 的呼叫端
} // 結束 loadEnvironment() 的目前區塊、參數或資料結構
