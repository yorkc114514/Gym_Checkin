import { client } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供使用者姓名、頭像與角色資料使用
export async function fetchProfile(session) { // 定義 fetchProfile()：讀取登入者的個人資料
  if (!session) return null; // 檢查 (!session) return null;；成立時才執行此分支

  const { data, error } = await client // 續接 fetchProfile() 的運算、回呼或參數：const { data, error } = await client
    .from('profiles') // 選取 Supabase 的 profiles 資料表，後續串接查詢或寫入
    .select('id, display_name, avatar_url, status, app_role, name_confirmed') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
    .eq('id', session.user.id) // 加入相等條件，只處理指定識別碼或欄位的資料
    .single(); // 取得單筆查詢結果；是否允許查無資料由所用方法決定

  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  return data; // 回傳 data，交給 fetchProfile() 的呼叫端
} // 結束 fetchProfile() 的目前區塊、參數或資料結構

export async function loadProfiles(profileIds) { // 定義 loadProfiles()：處理 使用者姓名、頭像與角色資料 的 loadProfiles 邏輯
  const ids = [...new Set((profileIds || []).filter(Boolean))]; // 宣告不可重新指定的 ids，供loadProfiles()使用
  if (ids.length === 0) return new Map(); // 檢查 (ids.length === 0) return new Map();；成立時才執行此分支

  const { data, error } = await client // 續接 loadProfiles() 的運算、回呼或參數：const { data, error } = await client
    .from('profiles') // 選取 Supabase 的 profiles 資料表，後續串接查詢或寫入
    .select('id, display_name, avatar_url') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
    .in('id', ids); // 呼叫 .in()，處理 使用者姓名、頭像與角色資料 的 in 邏輯

  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  return new Map((data || []).map((profile) => [profile.id, profile])); // 回傳 new Map((data || []).map((profile) => [profile.id, profile]))，交給 事件回呼() 的呼叫端
} // 結束 loadProfiles() 的目前區塊、參數或資料結構

export const confirmName = (name) => // 宣告不可重新指定的 confirmName，供confirmName()使用
  client.rpc('update_my_display_name', { new_display_name: name }); // 呼叫 Supabase 資料庫函式，由伺服器處理權限與交易
