import { client } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { taipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { loadProfiles } from '../profiles/index.js'; // 從 ../profiles/index.js 載入相依介面，供現場 QR 認證與簽到簽退使用
export async function loadAttendanceActiveDates(startDate, endDate) { // 定義 loadAttendanceActiveDates()：處理 現場 QR 認證與簽到簽退 的 loadAttendanceActiveDates 邏輯
  const { data, error } = await client // 續接 loadAttendanceActiveDates() 的運算、回呼或參數：const { data, error } = await client
    .from('attendance_sessions') // 選取 Supabase 的 attendance_sessions 資料表，後續串接查詢或寫入
    .select('checked_in_at') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
    .gte('checked_in_at', `${startDate}T00:00:00+08:00`) // 呼叫 .gte()，處理 現場 QR 認證與簽到簽退 的 gte 邏輯
    .lt('checked_in_at', `${endDate}T00:00:00+08:00`) // 呼叫 .lt()，處理 現場 QR 認證與簽到簽退 的 lt 邏輯
    .order('checked_in_at', { ascending: true }) // 呼叫 .order()，處理 現場 QR 認證與簽到簽退 的 order 邏輯
    .limit(5000); // 呼叫 .limit()，處理 現場 QR 認證與簽到簽退 的 limit 邏輯

  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  return [ // 回傳 [，交給 loadAttendanceActiveDates() 的呼叫端
    ...new Set((data || []).map((record) => taipeiDateString(new Date(record.checked_in_at)))), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  ]; // 結束 loadAttendanceActiveDates() 的目前區塊、參數或資料結構
} // 結束 loadAttendanceActiveDates() 的目前區塊、參數或資料結構

export async function loadOpenPeople() { // 定義 loadOpenPeople()：處理 現場 QR 認證與簽到簽退 的 loadOpenPeople 邏輯
  const { data: sessions, error } = await client // 續接 loadOpenPeople() 的運算、回呼或參數：const { data: sessions, error } = await client
    .from('attendance_sessions') // 選取 Supabase 的 attendance_sessions 資料表，後續串接查詢或寫入
    .select('id, user_id, gym_role, checked_in_at') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
    .is('checked_out_at', null) // 呼叫 .is()，處理 現場 QR 認證與簽到簽退 的 is 邏輯
    .order('checked_in_at', { ascending: true }); // 呼叫 .order()，處理 現場 QR 認證與簽到簽退 的 order 邏輯

  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支

  const profileMap = await loadProfiles((sessions || []).map((item) => item.user_id)); // 宣告不可重新指定的 profileMap，供事件回呼()使用
  return (sessions || []).map((session) => ({ // 回傳 (sessions || []).map((session) => ({，交給 事件回呼() 的呼叫端
    ...session, // 續接 事件回呼() 的運算、回呼或參數：...session,
    profile: profileMap.get(session.user_id) || { // 設定 使用者資料 欄位的值或型別
      display_name: '未知使用者', // 設定 顯示名稱 欄位的值或型別
      avatar_url: null, // 設定 avatar_url 欄位的值或型別
    }, // 結束 事件回呼() 的目前區塊、參數或資料結構
  })); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 loadOpenPeople() 的目前區塊、參數或資料結構

export const AttendanceRepository = { // 宣告不可重新指定的 AttendanceRepository，供現場 QR 認證與簽到簽退使用
  presenceStatus: (args) => client.rpc('presence_token_status', args), // 呼叫 Supabase 資料庫函式，由伺服器處理權限與交易
  checkIn: (args) => client.rpc('gym_check_in_with_presence', args), // 呼叫 Supabase 資料庫函式，由伺服器處理權限與交易
  checkOut: (args) => client.rpc('gym_check_out', args), // 呼叫 Supabase 資料庫函式，由伺服器處理權限與交易
}; // 結束 現場 QR 認證與簽到簽退 的目前區塊、參數或資料結構
