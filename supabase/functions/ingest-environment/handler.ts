import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'; // 從 npm:@supabase/supabase-js@2 載入相依介面，供驗證裝置並更新最新環境數據使用
const headers = { // 宣告不可重新指定的 HTTP 標頭，供驗證裝置並更新最新環境數據使用
  'Access-Control-Allow-Origin': '*', // 提供 'Access-Control-Allow-Origin': '*', 文字、路徑或資料欄位值
  'Access-Control-Allow-Headers': 'content-type, x-device-id, x-device-secret', // 提供 'Access-Control-Allow-Headers': 'content-type, x-device-id, x-device-secret', 文字、路徑或資料欄位值
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 提供 'Access-Control-Allow-Methods': 'POST, OPTIONS', 文字、路徑或資料欄位值
  'Content-Type': 'application/json; charset=utf-8', // 提供 'Content-Type': 'application/json; charset=utf-8', 文字、路徑或資料欄位值
  'Cache-Control': 'no-store', // 提供 'Cache-Control': 'no-store', 文字、路徑或資料欄位值
}; // 結束 驗證裝置並更新最新環境數據 的目前區塊、參數或資料結構
const respond = (body: Record<string, unknown>, status = 200) => // 宣告不可重新指定的 respond，供respond()使用
  new Response(JSON.stringify(body), { status, headers }); // 把資料轉成 JSON 字串以傳送或保存
export function validateReading(input: unknown) { // 定義 validateReading()：檢查環境資料格式、範圍與感測狀態
  if (!input || typeof input !== 'object' || Array.isArray(input)) // 檢查 (!input || typeof input !== 'object' || Array.isArray(input))；成立時才執行此分支
    throw new Error('Expected an object'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  const data = input as Record<string, unknown>; // 宣告不可重新指定的 查詢或回應資料，供validateReading()使用
  function number( // 定義 number()：處理 驗證裝置並更新最新環境數據 的 number 邏輯
    name: string, // 設定 name 欄位的值或型別
    min: number, // 設定 min 欄位的值或型別
    max: number, // 設定 max 欄位的值或型別
    nullable = false, // 更新 nullable，保存本步處理結果
    integer = false, // 更新 integer，保存本步處理結果
  ): number | null { // 續接 number() 的運算、回呼或參數：): number | null {
    const value = data[name]; // 宣告不可重新指定的 欄位值，供number()使用
    if (nullable && value === null) return null; // 檢查 (nullable && value === null) return null;；成立時才執行此分支
    if ( // 檢查 (；成立時才執行此分支
      typeof value !== 'number' || // 續接 number() 的運算、回呼或參數：typeof value !== 'number' ||
      !Number.isFinite(value) || // 續接 number() 的運算、回呼或參數：!Number.isFinite(value) ||
      value < min || // 續接 number() 的運算、回呼或參數：value < min ||
      value > max || // 續接 number() 的運算、回呼或參數：value > max ||
      (integer && !Number.isInteger(value)) // 續接 number() 的運算、回呼或參數：(integer && !Number.isInteger(value))
    ) // 結束 number() 的目前區塊、參數或資料結構
      throw new Error(`Invalid ${name}`); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    return value; // 回傳 value，交給 number() 的呼叫端
  } // 結束 number() 的目前區塊、參數或資料結構
  const temperature_c = number('temperature_c', -40, 80, true); // 宣告不可重新指定的 攝氏溫度，供validateReading()使用
  const humidity_pct = number('humidity_pct', 0, 100, true); // 宣告不可重新指定的 相對濕度百分比，供validateReading()使用
  const illuminance_lux = number('illuminance_lux', 0, 200000, true); // 宣告不可重新指定的 照度 lx，供validateReading()使用
  const full_spectrum = number('full_spectrum', 0, 65535, true, true); // 宣告不可重新指定的 全頻道原始光值，供validateReading()使用
  const infrared = number('infrared', 0, 65535, true, true); // 宣告不可重新指定的 紅外線原始光值，供validateReading()使用
  const wifi_rssi = number('wifi_rssi', -127, 0, true, true); // 宣告不可重新指定的 Wi-Fi 訊號強度，供validateReading()使用
  const uptime_s = number('uptime_s', 0, 4294967295, false, true)!; // 宣告不可重新指定的 開機秒數，供validateReading()使用
  const sample_age_ms = number('sample_age_ms', 0, 10000, false, true)!; // 宣告不可重新指定的 樣本年齡毫秒，供validateReading()使用
  const light_status = data.light_status; // 宣告不可重新指定的 光感測器狀態，供validateReading()使用
  if (!['ok', 'error', 'saturated'].includes(light_status as string)) // 檢查 (!['ok', 'error', 'saturated'].includes(light_status as string))；成立時才執行此分支
    throw new Error('Invalid light_status'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  if ( // 檢查 (；成立時才執行此分支
    light_status === 'ok' && // 更新 光感測器狀態，保存本步處理結果
    (illuminance_lux === null || full_spectrum === null || infrared === null) // 續接 validateReading() 的運算、回呼或參數：(illuminance_lux === null || full_spectrum === null || infrared === null)
  ) // 結束 validateReading() 的目前區塊、參數或資料結構
    throw new Error('Valid light requires lux and raw channels'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  if (light_status !== 'ok' && illuminance_lux !== null) // 檢查 (light_status !== 'ok' && illuminance_lux !== null)；成立時才執行此分支
    throw new Error('Invalid light must use null lux'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  if (light_status === 'error' && (full_spectrum !== null || infrared !== null)) // 檢查 (light_status === 'error' && (full_spectrum !== null || infrared !== null))；成立時才執行此分支
    throw new Error('Light read error must use null raw channels'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  if (light_status === 'saturated' && (full_spectrum === null || infrared === null)) // 檢查 (light_status === 'saturated' && (full_spectrum === null || infrared === null))；成立時才執行此分支
    throw new Error('Saturation requires raw channels'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  // Identity and timestamps cannot be supplied/overridden by the JSON payload.
  return { // 回傳 {，交給 validateReading() 的呼叫端
    temperature_c, // 續接 validateReading() 的運算、回呼或參數：temperature_c,
    humidity_pct, // 續接 validateReading() 的運算、回呼或參數：humidity_pct,
    illuminance_lux, // 續接 validateReading() 的運算、回呼或參數：illuminance_lux,
    light_status, // 續接 validateReading() 的運算、回呼或參數：light_status,
    full_spectrum, // 續接 validateReading() 的運算、回呼或參數：full_spectrum,
    infrared, // 續接 validateReading() 的運算、回呼或參數：infrared,
    wifi_rssi, // 續接 validateReading() 的運算、回呼或參數：wifi_rssi,
    uptime_s, // 續接 validateReading() 的運算、回呼或參數：uptime_s,
    sample_age_ms, // 續接 validateReading() 的運算、回呼或參數：sample_age_ms,
  }; // 結束 validateReading() 的目前區塊、參數或資料結構
} // 結束 validateReading() 的目前區塊、參數或資料結構
export async function sha256Hex(value: string) { // 定義 sha256Hex()：將字串轉成 SHA-256 十六進位雜湊
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); // 使用 Web Crypto 計算雜湊，不把裝置密碼明文寫入資料表
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''); // 選取 Supabase 的 指定 資料表，後續串接查詢或寫入
} // 結束 sha256Hex() 的目前區塊、參數或資料結構
function equalHash(left: string, right: string) { // 定義 equalHash()：比較雜湊內容
  if (right.length !== 64) return false; // 檢查 (right.length !== 64) return false;；成立時才執行此分支
  let difference = 0; // 宣告可更新的 difference，供equalHash()使用
  for (let i = 0; i < 64; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i); // 依 for (let i = 0; i < 64; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt… 逐項處理或重複等待
  return difference === 0; // 回傳 difference === 0，交給 equalHash() 的呼叫端
} // 結束 equalHash() 的目前區塊、參數或資料結構
async function readBody(request: Request) { // 定義 readBody()：在大小限制內讀取並解析請求 JSON
  if (!request.body) throw new Error('Missing body'); // 檢查 (!request.body) throw new Error('Missing body');；成立時才執行此分支
  const reader = request.body.getReader(); // 宣告不可重新指定的 reader，供readBody()使用
  const chunks: Uint8Array[] = []; // 宣告不可重新指定的 chunks，供readBody()使用
  let length = 0; // 宣告可更新的 length，供readBody()使用
  try { // 開始可捕捉例外的操作範圍
    for (;;) { // 依 for (;;) 逐項處理或重複等待
      const { done, value } = await reader.read(); // 續接 readBody() 的運算、回呼或參數：const { done, value } = await reader.read();
      if (done) break; // 檢查 (done) break;；成立時才執行此分支
      length += value.length; // 續接 readBody() 的運算、回呼或參數：length += value.length;
      if (length > 4096) { // 檢查 (length > 4096)；成立時才執行此分支
        await reader.cancel(); // 等待非同步操作完成後，才繼續同一流程
        throw new Error('Body too large'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      } // 結束 readBody() 的目前區塊、參數或資料結構
      chunks.push(value); // 呼叫 chunks.push()，處理 驗證裝置並更新最新環境數據 的 push 邏輯
    } // 結束 readBody() 的目前區塊、參數或資料結構
  } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
    reader.releaseLock(); // 呼叫 reader.releaseLock()，處理 驗證裝置並更新最新環境數據 的 releaseLock 邏輯
  } // 結束 readBody() 的目前區塊、參數或資料結構
  const bytes = new Uint8Array(length); // 宣告不可重新指定的 bytes，供readBody()使用
  let offset = 0; // 宣告可更新的 offset，供readBody()使用
  for (const chunk of chunks) { // 依 for (const chunk of chunks) 逐項處理或重複等待
    bytes.set(chunk, offset); // 呼叫 bytes.set()，處理 驗證裝置並更新最新環境數據 的 set 邏輯
    offset += chunk.length; // 續接 readBody() 的運算、回呼或參數：offset += chunk.length;
  } // 結束 readBody() 的目前區塊、參數或資料結構
  return JSON.parse(new TextDecoder().decode(bytes)); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
} // 結束 readBody() 的目前區塊、參數或資料結構
export function createEnvironmentHandler(getClient: () => SupabaseClient) { // 定義 createEnvironmentHandler()：建立裝置驗證與資料寫入處理器
  return async (request: Request): Promise<Response> => { // 回傳 async (request: Request): Promise<Response> => {，交給 事件回呼() 的呼叫端
    if (request.method === 'OPTIONS') return new Response('ok', { headers }); // 檢查 (request.method === 'OPTIONS') return new Response('ok', { headers });；成立時才執行此分支
    if (request.method !== 'POST') return respond({ ok: false, error: 'POST required' }, 405); // 檢查 (request.method !== 'POST') return respond({ ok: false, error: 'POST required' }, 405);；成立時才執行此分支
    const deviceCode = request.headers.get('x-device-id')?.trim().toLowerCase() || ''; // 宣告不可重新指定的 裝置代碼，供事件回呼()使用
    const secret = request.headers.get('x-device-secret')?.trim() || ''; // 宣告不可重新指定的 裝置認證密碼，供事件回呼()使用
    if (!/^[a-z0-9][a-z0-9_-]{2,63}$/.test(deviceCode) || !secret || secret.length > 512) // 建立測試案例，將下方操作與預期結果放在同一測試範圍
      return respond({ ok: false, error: 'Device authentication required' }, 401); // 回傳 respond({ ok: false, error: 'Device authentication required' }, 401)，交給 事件回呼() 的呼叫端
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) // 檢查 (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))；成立時才執行此分支
      return respond({ ok: false, error: 'application/json required' }, 415); // 回傳 respond({ ok: false, error: 'application/json required' }, 415)，交給 事件回呼() 的呼叫端
    try { // 開始可捕捉例外的操作範圍
      const client = getClient(); // 宣告不可重新指定的 Supabase 用戶端，供事件回呼()使用
      const { data: device, error } = await client // 續接 事件回呼() 的運算、回呼或參數：const { data: device, error } = await client
        .from('presence_devices') // 選取 Supabase 的 presence_devices 資料表，後續串接查詢或寫入
        .select('id, device_code, display_name, secret_hash, enabled') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
        .eq('device_code', deviceCode) // 加入相等條件，只處理指定識別碼或欄位的資料
        .maybeSingle(); // 取得單筆查詢結果；是否允許查無資料由所用方法決定
      if (error) throw new Error(`Device lookup failed (${error.code})`); // 檢查 (error) throw new Error(`Device lookup failed (${error.code})`);；成立時才執行此分支
      const hash = await sha256Hex(secret); // 宣告不可重新指定的 hash，供事件回呼()使用
      if (!device || !device.enabled || !equalHash(hash, device.secret_hash)) // 檢查 (!device || !device.enabled || !equalHash(hash, device.secret_hash))；成立時才執行此分支
        return respond({ ok: false, error: 'Device authentication failed' }, 401); // 回傳 respond({ ok: false, error: 'Device authentication failed' }, 401)，交給 事件回呼() 的呼叫端
      let reading; // 宣告可更新的 reading，供事件回呼()使用
      try { // 開始可捕捉例外的操作範圍
        reading = validateReading(await readBody(request)); // 更新 reading，保存本步處理結果
      } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
        return respond( // 回傳 respond(，交給 事件回呼() 的呼叫端
          { ok: false, error: error instanceof Error ? error.message : 'Invalid body' }, // 續接 事件回呼() 的運算、回呼或參數：{ ok: false, error: error instanceof Error ? error.message : 'Invalid body' …
          400, // 續接 事件回呼() 的運算、回呼或參數：400,
        ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      const { sample_age_ms, ...values } = reading; // 續接 事件回呼() 的運算、回呼或參數：const { sample_age_ms, ...values } = reading;
      const now = Date.now(); // 宣告不可重新指定的 目前時間，供事件回呼()使用
      const received_at = new Date(now).toISOString(); // 宣告不可重新指定的 伺服器接收時間，供事件回呼()使用
      const { error: writeError } = await client.from('environment_latest').upsert( // 選取 Supabase 的 environment_latest 資料表，後續串接查詢或寫入
        { // 續接 事件回呼() 的運算、回呼或參數：{
          ...values, // 續接 事件回呼() 的運算、回呼或參數：...values,
          device_id: device.id, // 設定 裝置資料列識別碼 欄位的值或型別
          device_code: device.device_code, // 設定 裝置代碼 欄位的值或型別
          display_name: device.display_name, // 設定 顯示名稱 欄位的值或型別
          sampled_at: new Date(now - sample_age_ms).toISOString(), // 設定 估算感測時間 欄位的值或型別
          received_at, // 續接 事件回呼() 的運算、回呼或參數：received_at,
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        { onConflict: 'device_id' }, // 續接 事件回呼() 的運算、回呼或參數：{ onConflict: 'device_id' },
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      if (writeError) throw new Error(`Environment write failed (${writeError.code})`); // 檢查 (writeError) throw new Error(`Environment write failed (${writeError.code})`);；成立時才執行此分支
      return respond({ ok: true, received_at, next_upload_seconds: 60 }); // 回傳 respond({ ok: true, received_at, next_upload_seconds: 60 })，交給 事件回呼() 的呼叫端
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error( // 把偵錯或測試資訊寫到開發者主控台
        'ingest-environment failed', // 提供 'ingest-environment failed', 文字、路徑或資料欄位值
        error instanceof Error ? error.message : 'unknown error', // 續接 事件回呼() 的運算、回呼或參數：error instanceof Error ? error.message : 'unknown error',
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      return respond({ ok: false, error: 'Environment service unavailable' }, 500); // 回傳 respond({ ok: false, error: 'Environment service unavailable' }, 500)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 createEnvironmentHandler() 的目前區塊、參數或資料結構
