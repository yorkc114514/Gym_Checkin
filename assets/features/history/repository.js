import { client } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供按日期查詢簽到紀錄使用
export function loadHistory(selectedDate, nextDate) { // 定義 loadHistory()：處理 按日期查詢簽到紀錄 的 loadHistory 邏輯
  return client // 回傳 client，交給 loadHistory() 的呼叫端
    .from('attendance_sessions') // 選取 Supabase 的 attendance_sessions 資料表，後續串接查詢或寫入
    .select( // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
      'id, user_id, gym_role, checked_in_at, checked_out_at, ' + // 提供 'id, user_id, gym_role, checked_in_at, checked_out_at, ' + 文字、路徑或資料欄位值
        'checked_out_by, checkout_method, transferred_to', // 提供 'checked_out_by, checkout_method, transferred_to', 文字、路徑或資料欄位值
    ) // 結束 loadHistory() 的目前區塊、參數或資料結構
    .gte('checked_in_at', `${selectedDate}T00:00:00+08:00`) // 呼叫 .gte()，處理 按日期查詢簽到紀錄 的 gte 邏輯
    .lt('checked_in_at', `${nextDate}T00:00:00+08:00`) // 呼叫 .lt()，處理 按日期查詢簽到紀錄 的 lt 邏輯
    .order('checked_in_at', { ascending: false }) // 呼叫 .order()，處理 按日期查詢簽到紀錄 的 order 邏輯
    .limit(200); // 呼叫 .limit()，處理 按日期查詢簽到紀錄 的 limit 邏輯
} // 結束 loadHistory() 的目前區塊、參數或資料結構
