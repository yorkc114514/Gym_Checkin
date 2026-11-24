import { createClient } from 'npm:@supabase/supabase-js@2'; // 從 npm:@supabase/supabase-js@2 載入相依介面，供裝置認證與 10 分鐘現場 QR Token使用

const TOKEN_TTL_SECONDS = 10 * 60; // 同一組現場 QR Token 有效 600 秒，也就是 10 分鐘

const corsHeaders = { // 宣告不可重新指定的 corsHeaders，供裝置認證與 10 分鐘現場 QR Token使用
  'Access-Control-Allow-Origin': '*', // 提供 'Access-Control-Allow-Origin': '*', 文字、路徑或資料欄位值
  'Access-Control-Allow-Headers': 'content-type, x-device-id, x-device-secret', // 提供 'Access-Control-Allow-Headers': 'content-type, x-device-id, x-device-secret', 文字、路徑或資料欄位值
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 提供 'Access-Control-Allow-Methods': 'POST, OPTIONS', 文字、路徑或資料欄位值
}; // 結束 裝置認證與 10 分鐘現場 QR Token 的目前區塊、參數或資料結構

function jsonResponse(body: Record<string, unknown>, status = 200) { // 定義 jsonResponse()：處理 裝置認證與 10 分鐘現場 QR Token 的 jsonResponse 邏輯
  return new Response(JSON.stringify(body), { // 把資料轉成 JSON 字串以傳送或保存
    status, // 續接 jsonResponse() 的運算、回呼或參數：status,
    headers: { // 設定 HTTP 標頭 欄位的值或型別
      ...corsHeaders, // 續接 jsonResponse() 的運算、回呼或參數：...corsHeaders,
      'Cache-Control': 'no-store', // 提供 'Cache-Control': 'no-store', 文字、路徑或資料欄位值
      'Content-Type': 'application/json; charset=utf-8', // 提供 'Content-Type': 'application/json; charset=utf-8', 文字、路徑或資料欄位值
    }, // 結束 jsonResponse() 的目前區塊、參數或資料結構
  }); // 結束 jsonResponse() 的目前區塊、參數或資料結構
} // 結束 jsonResponse() 的目前區塊、參數或資料結構

function requiredEnv(name: string) { // 定義 requiredEnv()：讀取必要的伺服器環境設定
  const value = Deno.env.get(name)?.trim(); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
  if (!value) throw new Error(`缺少 Edge Function Secret：${name}`); // 檢查 (!value) throw new Error(`缺少 Edge Function Secret：${name}`);；成立時才執行此分支
  return value; // 回傳 value，交給 requiredEnv() 的呼叫端
} // 結束 requiredEnv() 的目前區塊、參數或資料結構

function readNamedSupabaseKey(name: string, legacyName: string) { // 定義 readNamedSupabaseKey()：處理 裝置認證與 10 分鐘現場 QR Token 的 readNamedSupabaseKey 邏輯
  const rawValue = Deno.env.get(name)?.trim(); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰

  if (rawValue) { // 檢查 (rawValue)；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      const parsed = JSON.parse(rawValue); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
      if (typeof parsed.default === 'string' && parsed.default) { // 檢查 (typeof parsed.default === 'string' && parsed.default)；成立時才執行此分支
        return parsed.default; // 回傳 parsed.default，交給 readNamedSupabaseKey() 的呼叫端
      } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      // Some projects expose one key directly instead of a named-key object.
      return rawValue; // 回傳 rawValue，交給 readNamedSupabaseKey() 的呼叫端
    } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構
  } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

  return requiredEnv(legacyName); // 回傳 requiredEnv(legacyName)，交給 readNamedSupabaseKey() 的呼叫端
} // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

function bytesToHex(bytes: Uint8Array) { // 定義 bytesToHex()：處理 裝置認證與 10 分鐘現場 QR Token 的 bytesToHex 邏輯
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''); // 選取 Supabase 的 指定 資料表，後續串接查詢或寫入
} // 結束 bytesToHex() 的目前區塊、參數或資料結構

function bytesToBase64Url(bytes: Uint8Array) { // 定義 bytesToBase64Url()：處理 裝置認證與 10 分鐘現場 QR Token 的 bytesToBase64Url 邏輯
  let binary = ''; // 宣告可更新的 binary，供bytesToBase64Url()使用
  for (const byte of bytes) binary += String.fromCharCode(byte); // 依 for (const byte of bytes) binary += String.fromCharCode(byte); 逐項處理或重複等待
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, ''); // 回傳 btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')，交給 bytesToBase64Url() 的呼叫端
} // 結束 bytesToBase64Url() 的目前區塊、參數或資料結構

async function sha256Hex(value: string) { // 定義 sha256Hex()：將字串轉成 SHA-256 十六進位雜湊
  const bytes = new TextEncoder().encode(value); // 宣告不可重新指定的 bytes，供sha256Hex()使用
  const digest = await crypto.subtle.digest('SHA-256', bytes); // 使用 Web Crypto 計算雜湊，不把裝置密碼明文寫入資料表
  return bytesToHex(new Uint8Array(digest)); // 回傳 bytesToHex(new Uint8Array(digest))，交給 sha256Hex() 的呼叫端
} // 結束 sha256Hex() 的目前區塊、參數或資料結構

function constantTimeEqual(left: string, right: string) { // 定義 constantTimeEqual()：逐字比較雜湊，避免提早返回洩漏差異位置
  const maxLength = Math.max(left.length, right.length); // 宣告不可重新指定的 maxLength，供constantTimeEqual()使用
  let difference = left.length ^ right.length; // 宣告可更新的 difference，供constantTimeEqual()使用

  for (let index = 0; index < maxLength; index += 1) { // 依 for (let index = 0; index < maxLength; index += 1) 逐項處理或重複等待
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0); // 續接 constantTimeEqual() 的運算、回呼或參數：difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)…
  } // 結束 constantTimeEqual() 的目前區塊、參數或資料結構

  return difference === 0; // 回傳 difference === 0，交給 constantTimeEqual() 的呼叫端
} // 結束 constantTimeEqual() 的目前區塊、參數或資料結構

function checkInUrl(rawBaseUrl: string, token: string) { // 定義 checkInUrl()：將現場 Token 加入簽到網站網址
  const url = new URL(rawBaseUrl); // 宣告不可重新指定的 url，供checkInUrl()使用
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') { // 檢查 (url.protocol !== 'https:' && url.hostname !== 'localhost')；成立時才執行此分支
    throw new Error('CHECKIN_APP_URL 必須使用 HTTPS'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 checkInUrl() 的目前區塊、參數或資料結構
  url.searchParams.set('presence_token', token); // 呼叫 url.searchParams.set()，處理 裝置認證與 10 分鐘現場 QR Token 的 set 邏輯
  return url.toString(); // 回傳 url.toString()，交給 checkInUrl() 的呼叫端
} // 結束 checkInUrl() 的目前區塊、參數或資料結構

Deno.serve(async (request) => { // 啟動 Edge Function 的 HTTP 請求入口
  if (request.method === 'OPTIONS') { // 檢查 (request.method === 'OPTIONS')；成立時才執行此分支
    return new Response('ok', { headers: corsHeaders }); // 回傳 new Response('ok', { headers: corsHeaders })，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  if (request.method !== 'POST') { // 檢查 (request.method !== 'POST')；成立時才執行此分支
    return jsonResponse({ ok: false, error: '只接受 POST 請求' }, 405); // 回傳 jsonResponse({ ok: false, error: '只接受 POST 請求' }, 405)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  try { // 開始可捕捉例外的操作範圍
    const deviceCode = request.headers.get('x-device-id')?.trim().toLowerCase(); // 宣告不可重新指定的 裝置代碼，供事件回呼()使用
    const deviceSecret = request.headers.get('x-device-secret')?.trim(); // 宣告不可重新指定的 deviceSecret，供事件回呼()使用

    if (!deviceCode || !deviceSecret) { // 檢查 (!deviceCode || !deviceSecret)；成立時才執行此分支
      return jsonResponse({ ok: false, error: '缺少裝置認證資料' }, 401); // 回傳 jsonResponse({ ok: false, error: '缺少裝置認證資料' }, 401)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (!/^[a-z0-9][a-z0-9_-]{2,63}$/u.test(deviceCode)) { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
      return jsonResponse({ ok: false, error: '裝置代碼格式錯誤' }, 401); // 回傳 jsonResponse({ ok: false, error: '裝置代碼格式錯誤' }, 401)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const supabase = createClient( // 宣告不可重新指定的 supabase，供事件回呼()使用
      requiredEnv('SUPABASE_URL'), // 呼叫 requiredEnv()，讀取必要的伺服器環境設定
      readNamedSupabaseKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'), // 呼叫 readNamedSupabaseKey()，處理 裝置認證與 10 分鐘現場 QR Token 的 readNamedSupabaseKey 邏輯
      { auth: { persistSession: false, autoRefreshToken: false } }, // 續接 事件回呼() 的運算、回呼或參數：{ auth: { persistSession: false, autoRefreshToken: false } },
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構

    const { data: device, error: deviceError } = await supabase // 續接 事件回呼() 的運算、回呼或參數：const { data: device, error: deviceError } = await supabase
      .from('presence_devices') // 選取 Supabase 的 presence_devices 資料表，後續串接查詢或寫入
      .select('id, secret_hash, enabled') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
      .eq('device_code', deviceCode) // 加入相等條件，只處理指定識別碼或欄位的資料
      .maybeSingle(); // 取得單筆查詢結果；是否允許查無資料由所用方法決定

    if (deviceError) { // 檢查 (deviceError)；成立時才執行此分支
      console.error('presence device lookup failed', { // 把偵錯或測試資訊寫到開發者主控台
        code: deviceError.code, // 設定 錯誤或識別代碼 欄位的值或型別
        message: deviceError.message, // 設定 message 欄位的值或型別
        details: deviceError.details, // 設定 details 欄位的值或型別
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
      return jsonResponse({ ok: false, error: '無法讀取現場裝置資料' }, 500); // 回傳 jsonResponse({ ok: false, error: '無法讀取現場裝置資料' }, 500)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const suppliedSecretHash = await sha256Hex(deviceSecret); // 宣告不可重新指定的 suppliedSecretHash，供事件回呼()使用
    if (!device || !device.enabled || !constantTimeEqual(suppliedSecretHash, device.secret_hash)) { // 檢查 (!device || !device.enabled || !constantTimeEqual(suppliedSecretHash, device.secret_hash))；成立時才執行此分支
      return jsonResponse({ ok: false, error: '裝置認證失敗' }, 401); // 回傳 jsonResponse({ ok: false, error: '裝置認證失敗' }, 401)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const randomBytes = crypto.getRandomValues(new Uint8Array(18)); // 產生密碼學安全亂數，供現場 Token 使用
    const token = bytesToBase64Url(randomBytes); // 宣告不可重新指定的 token，供事件回呼()使用
    const tokenHash = await sha256Hex(token); // 宣告不可重新指定的 tokenHash，供事件回呼()使用
    const issuedAt = new Date(); // 宣告不可重新指定的 issuedAt，供事件回呼()使用
    const expiresAt = new Date(issuedAt.getTime() + TOKEN_TTL_SECONDS * 1000); // 宣告不可重新指定的 expiresAt，供事件回呼()使用

    const { error: insertError } = await supabase.from('presence_qr_tokens').insert({ // 選取 Supabase 的 presence_qr_tokens 資料表，後續串接查詢或寫入
      token_hash: tokenHash, // 設定 token_hash 欄位的值或型別
      device_id: device.id, // 設定 裝置資料列識別碼 欄位的值或型別
      issued_at: issuedAt.toISOString(), // 設定 issued_at 欄位的值或型別
      expires_at: expiresAt.toISOString(), // 設定 expires_at 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (insertError) throw insertError; // 檢查 (insertError) throw insertError;；成立時才執行此分支

    await supabase // 等待非同步操作完成後，才繼續同一流程
      .from('presence_devices') // 選取 Supabase 的 presence_devices 資料表，後續串接查詢或寫入
      .update({ last_seen_at: issuedAt.toISOString() }) // 送出新增、更新或依主鍵覆寫資料的資料庫操作
      .eq('id', device.id); // 加入相等條件，只處理指定識別碼或欄位的資料

    // Old hashes have no value after expiry. Keep one day for brief diagnostics.
    await supabase // 等待非同步操作完成後，才繼續同一流程
      .from('presence_qr_tokens') // 選取 Supabase 的 presence_qr_tokens 資料表，後續串接查詢或寫入
      .delete() // 呼叫 .delete()，處理 裝置認證與 10 分鐘現場 QR Token 的 delete 邏輯
      .lt('expires_at', new Date(issuedAt.getTime() - 86_400_000).toISOString()); // 呼叫 .lt()，處理 裝置認證與 10 分鐘現場 QR Token 的 lt 邏輯

    return jsonResponse({ // 回傳 jsonResponse({，交給 事件回呼() 的呼叫端
      ok: true, // 設定 ok 欄位的值或型別
      token, // 續接 事件回呼() 的運算、回呼或參數：token,
      check_in_url: checkInUrl(requiredEnv('CHECKIN_APP_URL'), token), // 設定 check_in_url 欄位的值或型別
      issued_at: issuedAt.toISOString(), // 設定 issued_at 欄位的值或型別
      expires_at: expiresAt.toISOString(), // 設定 expires_at 欄位的值或型別
      expires_in: TOKEN_TTL_SECONDS, // 設定 expires_in 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
    console.error('issue-presence-token failed', error); // 把偵錯或測試資訊寫到開發者主控台
    return jsonResponse( // 回傳 jsonResponse(，交給 事件回呼() 的呼叫端
      { // 續接 事件回呼() 的運算、回呼或參數：{
        ok: false, // 設定 ok 欄位的值或型別
        error: error instanceof Error ? error.message : '無法產生現場 QR Code', // 設定 錯誤資訊 欄位的值或型別
      }, // 結束 事件回呼() 的目前區塊、參數或資料結構
      500, // 續接 事件回呼() 的運算、回呼或參數：500,
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
