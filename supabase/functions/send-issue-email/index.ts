import { createClient } from '@supabase/supabase-js'; // 從 @supabase/supabase-js 載入相依介面，供透過 Gmail API 發送問題通知使用

const corsHeaders = { // 宣告不可重新指定的 corsHeaders，供透過 Gmail API 發送問題通知使用
  'Access-Control-Allow-Origin': 'https://death-momoi.github.io', // 提供 'Access-Control-Allow-Origin': 'https://death-momoi.github.io', 文字、路徑或資料欄位值
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // 提供 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-t… 文字、路徑或資料欄位值
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 提供 'Access-Control-Allow-Methods': 'POST, OPTIONS', 文字、路徑或資料欄位值
  Vary: 'Origin', // 設定 Vary 欄位的值或型別
}; // 結束 透過 Gmail API 發送問題通知 的目前區塊、參數或資料結構

function jsonResponse(body, status = 200) { // 定義 jsonResponse()：處理 透過 Gmail API 發送問題通知 的 jsonResponse 邏輯
  return new Response(JSON.stringify(body), { // 把資料轉成 JSON 字串以傳送或保存
    status, // 續接 jsonResponse() 的運算、回呼或參數：status,
    headers: { // 設定 HTTP 標頭 欄位的值或型別
      ...corsHeaders, // 續接 jsonResponse() 的運算、回呼或參數：...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8', // 提供 'Content-Type': 'application/json; charset=utf-8', 文字、路徑或資料欄位值
    }, // 結束 jsonResponse() 的目前區塊、參數或資料結構
  }); // 結束 jsonResponse() 的目前區塊、參數或資料結構
} // 結束 jsonResponse() 的目前區塊、參數或資料結構

function describeError(error) { // 定義 describeError()：處理 透過 Gmail API 發送問題通知 的 describeError 邏輯
  if (error instanceof Error) return error.message; // 檢查 (error instanceof Error) return error.message;；成立時才執行此分支

  if ( // 檢查 (；成立時才執行此分支
    error && // 續接 describeError() 的運算、回呼或參數：error &&
    typeof error === 'object' && // 續接 describeError() 的運算、回呼或參數：typeof error === 'object' &&
    'message' in error && // 提供 'message' in error && 文字、路徑或資料欄位值
    typeof error.message === 'string' // 續接 describeError() 的運算、回呼或參數：typeof error.message === 'string'
  ) { // 續接 describeError() 的運算、回呼或參數：) {
    return error.message; // 回傳 error.message，交給 describeError() 的呼叫端
  } // 結束 describeError() 的目前區塊、參數或資料結構

  if (typeof error === 'string') return error; // 檢查 (typeof error === 'string') return error;；成立時才執行此分支

  try { // 開始可捕捉例外的操作範圍
    return JSON.stringify(error); // 把資料轉成 JSON 字串以傳送或保存
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    return '未知的 Gmail 通知錯誤'; // 回傳 '未知的 Gmail 通知錯誤'，交給 describeError() 的呼叫端
  } // 結束 describeError() 的目前區塊、參數或資料結構
} // 結束 describeError() 的目前區塊、參數或資料結構

function requiredEnv(name) { // 定義 requiredEnv()：讀取必要的伺服器環境設定
  const value = Deno.env.get(name)?.trim(); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
  if (!value) throw new Error(`缺少 Edge Function Secret：${name}`); // 檢查 (!value) throw new Error(`缺少 Edge Function Secret：${name}`);；成立時才執行此分支
  return value; // 回傳 value，交給 requiredEnv() 的呼叫端
} // 結束 requiredEnv() 的目前區塊、參數或資料結構

function readNamedSupabaseKey(name, legacyName) { // 定義 readNamedSupabaseKey()：處理 透過 Gmail API 發送問題通知 的 readNamedSupabaseKey 邏輯
  const rawValue = Deno.env.get(name); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰

  if (rawValue) { // 檢查 (rawValue)；成立時才執行此分支
    const parsed = JSON.parse(rawValue); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
    if (typeof parsed.default === 'string' && parsed.default) { // 檢查 (typeof parsed.default === 'string' && parsed.default)；成立時才執行此分支
      return parsed.default; // 回傳 parsed.default，交給 readNamedSupabaseKey() 的呼叫端
    } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構
  } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

  return requiredEnv(legacyName); // 回傳 requiredEnv(legacyName)，交給 readNamedSupabaseKey() 的呼叫端
} // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

function isUuid(value) { // 定義 isUuid()：處理 透過 Gmail API 發送問題通知 的 isUuid 邏輯
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); // 建立測試案例，將下方操作與預期結果放在同一測試範圍
} // 結束 isUuid() 的目前區塊、參數或資料結構

function escapeHtml(value) { // 定義 escapeHtml()：處理 透過 Gmail API 發送問題通知 的 escapeHtml 邏輯
  return String(value) // 回傳 String(value)，交給 escapeHtml() 的呼叫端
    .replaceAll('&', '&amp;') // 呼叫 .replaceAll()，處理 透過 Gmail API 發送問題通知 的 replaceAll 邏輯
    .replaceAll('<', '&lt;') // 呼叫 .replaceAll()，處理 透過 Gmail API 發送問題通知 的 replaceAll 邏輯
    .replaceAll('>', '&gt;') // 呼叫 .replaceAll()，處理 透過 Gmail API 發送問題通知 的 replaceAll 邏輯
    .replaceAll('"', '&quot;') // 呼叫 .replaceAll()，處理 透過 Gmail API 發送問題通知 的 replaceAll 邏輯
    .replaceAll("'", '&#039;'); // 呼叫 .replaceAll()，處理 透過 Gmail API 發送問題通知 的 replaceAll 邏輯
} // 結束 escapeHtml() 的目前區塊、參數或資料結構

function cleanHeader(value) { // 定義 cleanHeader()：處理 透過 Gmail API 發送問題通知 的 cleanHeader 邏輯
  return String(value) // 回傳 String(value)，交給 cleanHeader() 的呼叫端
    .replace(/[\r\n]/g, '') // 呼叫 .replace()，處理 透過 Gmail API 發送問題通知 的 replace 邏輯
    .trim(); // 呼叫 .trim()，處理 透過 Gmail API 發送問題通知 的 trim 邏輯
} // 結束 cleanHeader() 的目前區塊、參數或資料結構

function assertEmail(value, secretName) { // 定義 assertEmail()：處理 透過 Gmail API 發送問題通知 的 assertEmail 邏輯
  const email = cleanHeader(value); // 宣告不可重新指定的 email，供assertEmail()使用
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    throw new Error(`${secretName} 不是有效的 Email`); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 assertEmail() 的目前區塊、參數或資料結構
  return email; // 回傳 email，交給 assertEmail() 的呼叫端
} // 結束 assertEmail() 的目前區塊、參數或資料結構

function utf8ToBase64(value) { // 定義 utf8ToBase64()：處理 透過 Gmail API 發送問題通知 的 utf8ToBase64 邏輯
  const bytes = new TextEncoder().encode(value); // 宣告不可重新指定的 bytes，供utf8ToBase64()使用
  let binary = ''; // 宣告可更新的 binary，供utf8ToBase64()使用

  for (let offset = 0; offset < bytes.length; offset += 0x8000) { // 依 for (let offset = 0; offset < bytes.length; offset += 0x8000) 逐項處理或重複等待
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)); // 續接 utf8ToBase64() 的運算、回呼或參數：binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  } // 結束 utf8ToBase64() 的目前區塊、參數或資料結構

  return btoa(binary); // 回傳 btoa(binary)，交給 utf8ToBase64() 的呼叫端
} // 結束 utf8ToBase64() 的目前區塊、參數或資料結構

function utf8ToBase64Url(value) { // 定義 utf8ToBase64Url()：處理 透過 Gmail API 發送問題通知 的 utf8ToBase64Url 邏輯
  return utf8ToBase64(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, ''); // 回傳 utf8ToBase64(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, ''…，交給 utf8ToBase64Url() 的呼叫端
} // 結束 utf8ToBase64Url() 的目前區塊、參數或資料結構

function formatTaipeiTime(value) { // 定義 formatTaipeiTime()：處理 透過 Gmail API 發送問題通知 的 formatTaipeiTime 邏輯
  return new Intl.DateTimeFormat('zh-TW', { // 回傳 new Intl.DateTimeFormat('zh-TW', {，交給 formatTaipeiTime() 的呼叫端
    timeZone: 'Asia/Taipei', // 設定 timeZone 欄位的值或型別
    year: 'numeric', // 設定 year 欄位的值或型別
    month: '2-digit', // 設定 month 欄位的值或型別
    day: '2-digit', // 設定 day 欄位的值或型別
    hour: '2-digit', // 設定 hour 欄位的值或型別
    minute: '2-digit', // 設定 minute 欄位的值或型別
    second: '2-digit', // 設定 second 欄位的值或型別
    hour12: false, // 設定 hour12 欄位的值或型別
  }).format(new Date(value)); // 續接 formatTaipeiTime() 的運算、回呼或參數：}).format(new Date(value));
} // 結束 formatTaipeiTime() 的目前區塊、參數或資料結構

function buildRawEmail({ sender, recipient, subject, html }) { // 定義 buildRawEmail()：處理 透過 Gmail API 發送問題通知 的 buildRawEmail 邏輯
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subject)}?=`; // 宣告不可重新指定的 encodedSubject，供buildRawEmail()使用
  const encodedBody = utf8ToBase64(html); // 宣告不可重新指定的 encodedBody，供buildRawEmail()使用

  const mimeMessage = [ // 宣告不可重新指定的 mimeMessage，供buildRawEmail()使用
    `From: ${cleanHeader(sender)}`, // 續接 buildRawEmail() 的運算、回呼或參數：`From: ${cleanHeader(sender)}`,
    `To: ${cleanHeader(recipient)}`, // 續接 buildRawEmail() 的運算、回呼或參數：`To: ${cleanHeader(recipient)}`,
    `Subject: ${encodedSubject}`, // 續接 buildRawEmail() 的運算、回呼或參數：`Subject: ${encodedSubject}`,
    'MIME-Version: 1.0', // 提供 'MIME-Version: 1.0', 文字、路徑或資料欄位值
    'Content-Type: text/html; charset="UTF-8"', // 提供 'Content-Type: text/html; charset="UTF-8"', 文字、路徑或資料欄位值
    'Content-Transfer-Encoding: base64', // 提供 'Content-Transfer-Encoding: base64', 文字、路徑或資料欄位值
    '', // 提供 '', 文字、路徑或資料欄位值
    encodedBody, // 續接 buildRawEmail() 的運算、回呼或參數：encodedBody,
  ].join('\r\n'); // 續接 buildRawEmail() 的運算、回呼或參數：].join('\r\n');

  return utf8ToBase64Url(mimeMessage); // 回傳 utf8ToBase64Url(mimeMessage)，交給 buildRawEmail() 的呼叫端
} // 結束 buildRawEmail() 的目前區塊、參數或資料結構

async function getGoogleAccessToken() { // 定義 getGoogleAccessToken()：處理 透過 Gmail API 發送問題通知 的 getGoogleAccessToken 邏輯
  const response = await fetch('https://oauth2.googleapis.com/token', { // 送出 HTTP 請求；需再檢查回應狀態與內容
    method: 'POST', // 設定 method 欄位的值或型別
    headers: { // 設定 HTTP 標頭 欄位的值或型別
      'Content-Type': 'application/x-www-form-urlencoded', // 提供 'Content-Type': 'application/x-www-form-urlencoded', 文字、路徑或資料欄位值
    }, // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構
    body: new URLSearchParams({ // 設定 body 欄位的值或型別
      client_id: requiredEnv('GOOGLE_OAUTH_CLIENT_ID'), // 設定 client_id 欄位的值或型別
      client_secret: requiredEnv('GOOGLE_OAUTH_CLIENT_SECRET'), // 設定 client_secret 欄位的值或型別
      refresh_token: requiredEnv('GOOGLE_OAUTH_REFRESH_TOKEN'), // 設定 refresh_token 欄位的值或型別
      grant_type: 'refresh_token', // 設定 grant_type 欄位的值或型別
    }), // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構
  }); // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

  const payload = await response.json(); // 宣告不可重新指定的 payload，供getGoogleAccessToken()使用

  if (!response.ok || typeof payload.access_token !== 'string') { // 檢查 (!response.ok || typeof payload.access_token !== 'string')；成立時才執行此分支
    throw new Error(payload.error_description || payload.error || '無法取得 Google access token'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

  return payload.access_token; // 回傳 payload.access_token，交給 getGoogleAccessToken() 的呼叫端
} // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

Deno.serve(async (request) => { // 啟動 Edge Function 的 HTTP 請求入口
  if (request.method === 'OPTIONS') { // 檢查 (request.method === 'OPTIONS')；成立時才執行此分支
    return new Response(null, { status: 204, headers: corsHeaders }); // 回傳 new Response(null, { status: 204, headers: corsHeaders })，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  if (request.method !== 'POST') { // 檢查 (request.method !== 'POST')；成立時才執行此分支
    return jsonResponse({ error: '只接受 POST 請求' }, 405); // 回傳 jsonResponse({ error: '只接受 POST 請求' }, 405)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  const authorization = request.headers.get('Authorization') || ''; // 宣告不可重新指定的 authorization，供事件回呼()使用
  const jwt = authorization.startsWith('Bearer ') // 宣告不可重新指定的 jwt，供事件回呼()使用
    ? authorization.slice('Bearer '.length).trim() // 續接 事件回呼() 的運算、回呼或參數：? authorization.slice('Bearer '.length).trim()
    : ''; // 續接 事件回呼() 的運算、回呼或參數：: '';

  if (!jwt) { // 檢查 (!jwt)；成立時才執行此分支
    return jsonResponse({ error: '請先登入' }, 401); // 回傳 jsonResponse({ error: '請先登入' }, 401)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  let requestBody; // 宣告可更新的 requestBody，供事件回呼()使用
  try { // 開始可捕捉例外的操作範圍
    requestBody = await request.json(); // 更新 requestBody，保存本步處理結果
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    return jsonResponse({ error: '請求內容不是有效的 JSON' }, 400); // 回傳 jsonResponse({ error: '請求內容不是有效的 JSON' }, 400)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  const reportId = typeof requestBody?.report_id === 'string' ? requestBody.report_id : ''; // 宣告不可重新指定的 reportId，供事件回呼()使用

  if (!isUuid(reportId)) { // 檢查 (!isUuid(reportId))；成立時才執行此分支
    return jsonResponse({ error: '無效的問題回報 ID' }, 400); // 回傳 jsonResponse({ error: '無效的問題回報 ID' }, 400)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  let supabaseAdmin = null; // 宣告可更新的 supabaseAdmin，供事件回呼()使用
  let ownedReport = false; // 宣告可更新的 ownedReport，供事件回呼()使用

  try { // 開始可捕捉例外的操作範圍
    const supabaseUrl = requiredEnv('SUPABASE_URL'); // 宣告不可重新指定的 supabaseUrl，供事件回呼()使用
    const publishableKey = readNamedSupabaseKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'); // 宣告不可重新指定的 publishableKey，供事件回呼()使用
    const secretKey = readNamedSupabaseKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'); // 宣告不可重新指定的 secretKey，供事件回呼()使用

    const supabaseAuth = createClient(supabaseUrl, publishableKey, { // 宣告不可重新指定的 supabaseAuth，供事件回呼()使用
      auth: { // 設定 auth 欄位的值或型別
        autoRefreshToken: false, // 設定 autoRefreshToken 欄位的值或型別
        persistSession: false, // 設定 persistSession 欄位的值或型別
        detectSessionInUrl: false, // 設定 detectSessionInUrl 欄位的值或型別
      }, // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    const { // 續接 事件回呼() 的運算、回呼或參數：const {
      data: { user }, // 設定 查詢或回應資料 欄位的值或型別
      error: userError, // 設定 錯誤資訊 欄位的值或型別
    } = await supabaseAuth.auth.getUser(jwt); // 續接 事件回呼() 的運算、回呼或參數：} = await supabaseAuth.auth.getUser(jwt);

    if (userError || !user) { // 檢查 (userError || !user)；成立時才執行此分支
      return jsonResponse({ error: '登入狀態無效，請重新登入' }, 401); // 回傳 jsonResponse({ error: '登入狀態無效，請重新登入' }, 401)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    supabaseAdmin = createClient(supabaseUrl, secretKey, { // 更新 supabaseAdmin，保存本步處理結果
      auth: { // 設定 auth 欄位的值或型別
        autoRefreshToken: false, // 設定 autoRefreshToken 欄位的值或型別
        persistSession: false, // 設定 persistSession 欄位的值或型別
        detectSessionInUrl: false, // 設定 detectSessionInUrl 欄位的值或型別
      }, // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    const { data: report, error: reportError } = await supabaseAdmin // 續接 事件回呼() 的運算、回呼或參數：const { data: report, error: reportError } = await supabaseAdmin
      .from('issue_reports') // 選取 Supabase 的 issue_reports 資料表，後續串接查詢或寫入
      .select('id, reporter_id, description, created_at, notification_status') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
      .eq('id', reportId) // 加入相等條件，只處理指定識別碼或欄位的資料
      .maybeSingle(); // 取得單筆查詢結果；是否允許查無資料由所用方法決定

    if (reportError) throw reportError; // 檢查 (reportError) throw reportError;；成立時才執行此分支
    if (!report) return jsonResponse({ error: '找不到問題回報' }, 404); // 檢查 (!report) return jsonResponse({ error: '找不到問題回報' }, 404);；成立時才執行此分支

    if (report.reporter_id !== user.id) { // 檢查 (report.reporter_id !== user.id)；成立時才執行此分支
      return jsonResponse({ error: '無權寄送這筆問題回報' }, 403); // 回傳 jsonResponse({ error: '無權寄送這筆問題回報' }, 403)，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    ownedReport = true; // 更新 ownedReport，保存本步處理結果

    if (report.notification_status === 'sent') { // 檢查 (report.notification_status === 'sent')；成立時才執行此分支
      return jsonResponse({ ok: true, already_sent: true }); // 回傳 jsonResponse({ ok: true, already_sent: true })，交給 事件回呼() 的呼叫端
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const { data: profile, error: profileError } = await supabaseAdmin // 續接 事件回呼() 的運算、回呼或參數：const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles') // 選取 Supabase 的 profiles 資料表，後續串接查詢或寫入
      .select('display_name') // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
      .eq('id', user.id) // 加入相等條件，只處理指定識別碼或欄位的資料
      .single(); // 取得單筆查詢結果；是否允許查無資料由所用方法決定

    if (profileError) throw profileError; // 檢查 (profileError) throw profileError;；成立時才執行此分支

    const sender = assertEmail(requiredEnv('GMAIL_SENDER_EMAIL'), 'GMAIL_SENDER_EMAIL'); // 宣告不可重新指定的 sender，供事件回呼()使用
    const recipient = assertEmail(requiredEnv('ISSUE_NOTIFICATION_TO'), 'ISSUE_NOTIFICATION_TO'); // 宣告不可重新指定的 recipient，供事件回呼()使用

    const reporterName = profile.display_name || '未命名使用者'; // 宣告不可重新指定的 reporterName，供事件回呼()使用
    const reporterEmail = user.email || '未提供 Email'; // 宣告不可重新指定的 reporterEmail，供事件回呼()使用
    const subject = `[運科二簽到系統] 新問題回報：${reporterName}`; // 宣告不可重新指定的 subject，供事件回呼()使用
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827">
        <h2 style="color:#b91c1c">運動科學實驗室問題回報</h2>
        <p><strong>回報人：</strong>${escapeHtml(reporterName)}</p>
        <p><strong>Google 帳號：</strong>${escapeHtml(reporterEmail)}</p>
        <p><strong>回報時間：</strong>${escapeHtml(formatTaipeiTime(report.created_at))}</p>
        <p><strong>問題內容：</strong></p>
        <div style="padding:12px;background:#f3f4f6;border-left:4px solid #dc2626;white-space:pre-wrap">${escapeHtml(report.description)}</div>
        <p style="margin-top:20px;color:#6b7280;font-size:12px">本信件由運科二簽到系統自動發送。</p>
      </div>
    `.trim(); // 續接 事件回呼() 的運算、回呼或參數：`.trim();

    const accessToken = await getGoogleAccessToken(); // 宣告不可重新指定的 accessToken，供事件回呼()使用
    const raw = buildRawEmail({ sender, recipient, subject, html }); // 宣告不可重新指定的 raw，供事件回呼()使用

    const gmailResponse = await fetch( // 送出 HTTP 請求；需再檢查回應狀態與內容
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', // 提供 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send', 文字、路徑或資料欄位值
      { // 續接 事件回呼() 的運算、回呼或參數：{
        method: 'POST', // 設定 method 欄位的值或型別
        headers: { // 設定 HTTP 標頭 欄位的值或型別
          Authorization: `Bearer ${accessToken}`, // 設定 Authorization 欄位的值或型別
          'Content-Type': 'application/json', // 提供 'Content-Type': 'application/json', 文字、路徑或資料欄位值
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        body: JSON.stringify({ raw }), // 把資料轉成 JSON 字串以傳送或保存
      }, // 結束 事件回呼() 的目前區塊、參數或資料結構
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構

    const gmailBody = await gmailResponse.text(); // 宣告不可重新指定的 gmailBody，供事件回呼()使用

    if (!gmailResponse.ok) { // 檢查 (!gmailResponse.ok)；成立時才執行此分支
      throw new Error(`Gmail API 寄送失敗：${gmailBody.slice(0, 300)}`); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const { error: updateError } = await supabaseAdmin // 續接 事件回呼() 的運算、回呼或參數：const { error: updateError } = await supabaseAdmin
      .from('issue_reports') // 選取 Supabase 的 issue_reports 資料表，後續串接查詢或寫入
      .update({ // 送出新增、更新或依主鍵覆寫資料的資料庫操作
        notification_status: 'sent', // 設定 notification_status 欄位的值或型別
        notified_at: new Date().toISOString(), // 設定 notified_at 欄位的值或型別
        notification_error: null, // 設定 notification_error 欄位的值或型別
      }) // 結束 事件回呼() 的目前區塊、參數或資料結構
      .eq('id', reportId); // 加入相等條件，只處理指定識別碼或欄位的資料

    if (updateError) { // 檢查 (updateError)；成立時才執行此分支
      console.error('Gmail 已寄出，但更新通知狀態失敗', updateError); // 把偵錯或測試資訊寫到開發者主控台
      return jsonResponse({ // 回傳 jsonResponse({，交給 事件回呼() 的呼叫端
        ok: true, // 設定 ok 欄位的值或型別
        email_sent: true, // 設定 email_sent 欄位的值或型別
        status_recorded: false, // 設定 status_recorded 欄位的值或型別
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    return jsonResponse({ // 回傳 jsonResponse({，交給 事件回呼() 的呼叫端
      ok: true, // 設定 ok 欄位的值或型別
      email_sent: true, // 設定 email_sent 欄位的值或型別
      status_recorded: true, // 設定 status_recorded 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
    const errorMessage = describeError(error); // 宣告不可重新指定的 errorMessage，供事件回呼()使用

    console.error('send-issue-email failed', errorMessage, error); // 把偵錯或測試資訊寫到開發者主控台

    if (supabaseAdmin && ownedReport) { // 檢查 (supabaseAdmin && ownedReport)；成立時才執行此分支
      const { error: statusError } = await supabaseAdmin // 續接 事件回呼() 的運算、回呼或參數：const { error: statusError } = await supabaseAdmin
        .from('issue_reports') // 選取 Supabase 的 issue_reports 資料表，後續串接查詢或寫入
        .update({ // 送出新增、更新或依主鍵覆寫資料的資料庫操作
          notification_status: 'failed', // 設定 notification_status 欄位的值或型別
          notified_at: null, // 設定 notified_at 欄位的值或型別
          notification_error: errorMessage.slice(0, 500), // 設定 notification_error 欄位的值或型別
        }) // 結束 事件回呼() 的目前區塊、參數或資料結構
        .eq('id', reportId); // 加入相等條件，只處理指定識別碼或欄位的資料

      if (statusError) { // 檢查 (statusError)；成立時才執行此分支
        console.error('更新 Gmail 失敗狀態時發生錯誤', statusError); // 把偵錯或測試資訊寫到開發者主控台
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    return jsonResponse({ error: 'Gmail 通知寄送失敗' }, 500); // 回傳 jsonResponse({ error: 'Gmail 通知寄送失敗' }, 500)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
