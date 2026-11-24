import { createClient } from 'npm:@supabase/supabase-js@2'; // 從 npm:@supabase/supabase-js@2 載入相依介面，供讀取 Google Calendar 預約使用

const TAIPEI_TIME_ZONE = 'Asia/Taipei'; // 宣告不可重新指定的 TAIPEI_TIME_ZONE，供讀取 Google Calendar 預約使用

const corsHeaders = { // 宣告不可重新指定的 corsHeaders，供讀取 Google Calendar 預約使用
  'Access-Control-Allow-Origin': 'https://death-momoi.github.io', // 提供 'Access-Control-Allow-Origin': 'https://death-momoi.github.io', 文字、路徑或資料欄位值
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // 提供 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-t… 文字、路徑或資料欄位值
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 提供 'Access-Control-Allow-Methods': 'POST, OPTIONS', 文字、路徑或資料欄位值
  Vary: 'Origin', // 設定 Vary 欄位的值或型別
}; // 結束 讀取 Google Calendar 預約 的目前區塊、參數或資料結構

function jsonResponse(body, status = 200) { // 定義 jsonResponse()：處理 讀取 Google Calendar 預約 的 jsonResponse 邏輯
  return new Response(JSON.stringify(body), { // 把資料轉成 JSON 字串以傳送或保存
    status, // 續接 jsonResponse() 的運算、回呼或參數：status,
    headers: { // 設定 HTTP 標頭 欄位的值或型別
      ...corsHeaders, // 續接 jsonResponse() 的運算、回呼或參數：...corsHeaders,
      'Cache-Control': 'no-store', // 提供 'Cache-Control': 'no-store', 文字、路徑或資料欄位值
      'Content-Type': 'application/json; charset=utf-8', // 提供 'Content-Type': 'application/json; charset=utf-8', 文字、路徑或資料欄位值
    }, // 結束 jsonResponse() 的目前區塊、參數或資料結構
  }); // 結束 jsonResponse() 的目前區塊、參數或資料結構
} // 結束 jsonResponse() 的目前區塊、參數或資料結構

function requiredEnv(name) { // 定義 requiredEnv()：讀取必要的伺服器環境設定
  const value = Deno.env.get(name)?.trim(); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰
  if (!value) throw new Error(`缺少 Edge Function Secret：${name}`); // 檢查 (!value) throw new Error(`缺少 Edge Function Secret：${name}`);；成立時才執行此分支
  return value; // 回傳 value，交給 requiredEnv() 的呼叫端
} // 結束 requiredEnv() 的目前區塊、參數或資料結構

function readNamedSupabaseKey(name, legacyName) { // 定義 readNamedSupabaseKey()：處理 讀取 Google Calendar 預約 的 readNamedSupabaseKey 邏輯
  const rawValue = Deno.env.get(name); // 從 Edge Function 執行環境讀取設定，避免硬編碼伺服器密鑰

  if (rawValue) { // 檢查 (rawValue)；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      const parsed = JSON.parse(rawValue); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
      if (typeof parsed.default === 'string' && parsed.default) { // 檢查 (typeof parsed.default === 'string' && parsed.default)；成立時才執行此分支
        return parsed.default; // 回傳 parsed.default，交給 readNamedSupabaseKey() 的呼叫端
      } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      // 新版 Supabase 專案可能直接提供單一字串，交由舊名稱後援處理。
    } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構
  } // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

  return requiredEnv(legacyName); // 回傳 requiredEnv(legacyName)，交給 readNamedSupabaseKey() 的呼叫端
} // 結束 readNamedSupabaseKey() 的目前區塊、參數或資料結構

function parseDate(value) { // 定義 parseDate()：處理 讀取 Google Calendar 預約 的 parseDate 邏輯
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    return null; // 回傳 null，交給 parseDate() 的呼叫端
  } // 結束 parseDate() 的目前區塊、參數或資料結構

  const [year, month, day] = value.split('-').map(Number); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  const utcDate = new Date(Date.UTC(year, month - 1, day)); // 宣告不可重新指定的 utcDate，供parseDate()使用

  if ( // 檢查 (；成立時才執行此分支
    utcDate.getUTCFullYear() !== year || // 呼叫 utcDate.getUTCFullYear()，處理 讀取 Google Calendar 預約 的 getUTCFullYear 邏輯
    utcDate.getUTCMonth() !== month - 1 || // 呼叫 utcDate.getUTCMonth()，處理 讀取 Google Calendar 預約 的 getUTCMonth 邏輯
    utcDate.getUTCDate() !== day // 呼叫 utcDate.getUTCDate()，處理 讀取 Google Calendar 預約 的 getUTCDate 邏輯
  ) { // 續接 parseDate() 的運算、回呼或參數：) {
    return null; // 回傳 null，交給 parseDate() 的呼叫端
  } // 結束 parseDate() 的目前區塊、參數或資料結構

  return { value, year, month, day }; // 回傳 { value, year, month, day }，交給 parseDate() 的呼叫端
} // 結束 parseDate() 的目前區塊、參數或資料結構

function parseMonth(value) { // 定義 parseMonth()：處理 讀取 Google Calendar 預約 的 parseMonth 邏輯
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    return null; // 回傳 null，交給 parseMonth() 的呼叫端
  } // 結束 parseMonth() 的目前區塊、參數或資料結構

  const [year, month] = value.split('-').map(Number); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  if (year < 2000 || year > 2100 || month < 1 || month > 12) { // 檢查 (year < 2000 || year > 2100 || month < 1 || month > 12)；成立時才執行此分支
    return null; // 回傳 null，交給 parseMonth() 的呼叫端
  } // 結束 parseMonth() 的目前區塊、參數或資料結構
  return { value, year, month }; // 回傳 { value, year, month }，交給 parseMonth() 的呼叫端
} // 結束 parseMonth() 的目前區塊、參數或資料結構

function nextDateString({ year, month, day }) { // 定義 nextDateString()：處理 讀取 Google Calendar 預約 的 nextDateString 邏輯
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10); // 回傳 new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10)，交給 nextDateString() 的呼叫端
} // 結束 nextDateString() 的目前區塊、參數或資料結構

function nextMonthString({ year, month }) { // 定義 nextMonthString()：處理 讀取 Google Calendar 預約 的 nextMonthString 邏輯
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7); // 回傳 new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7)，交給 nextMonthString() 的呼叫端
} // 結束 nextMonthString() 的目前區塊、參數或資料結構

function minuteLabel(minutes) { // 定義 minuteLabel()：處理 讀取 Google Calendar 預約 的 minuteLabel 邏輯
  if (minutes >= 1440) return '24:00'; // 檢查 (minutes >= 1440) return '24:00';；成立時才執行此分支

  const safeMinutes = Math.max(0, Math.min(1439, minutes)); // 宣告不可重新指定的 safeMinutes，供minuteLabel()使用
  const hour = Math.floor(safeMinutes / 60); // 宣告不可重新指定的 hour，供minuteLabel()使用
  const minute = safeMinutes % 60; // 宣告不可重新指定的 minute，供minuteLabel()使用
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`; // 回傳 `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`，交給 minuteLabel() 的呼叫端
} // 結束 minuteLabel() 的目前區塊、參數或資料結構

function eventToPublicRecord(event, dayStartMs, dayEndMs) { // 定義 eventToPublicRecord()：處理 讀取 Google Calendar 預約 的 eventToPublicRecord 邏輯
  const isAllDay = typeof event?.start?.date === 'string'; // 宣告不可重新指定的 isAllDay，供eventToPublicRecord()使用
  const startValue = isAllDay ? event?.start?.date : event?.start?.dateTime; // 宣告不可重新指定的 startValue，供eventToPublicRecord()使用
  const endValue = isAllDay ? event?.end?.date : event?.end?.dateTime; // 宣告不可重新指定的 endValue，供eventToPublicRecord()使用

  if (typeof startValue !== 'string' || typeof endValue !== 'string') { // 檢查 (typeof startValue !== 'string' || typeof endValue !== 'string')；成立時才執行此分支
    return null; // 回傳 null，交給 eventToPublicRecord() 的呼叫端
  } // 結束 eventToPublicRecord() 的目前區塊、參數或資料結構

  const startMs = Date.parse(isAllDay ? `${startValue}T00:00:00+08:00` : startValue); // 宣告不可重新指定的 startMs，供eventToPublicRecord()使用
  const endMs = Date.parse(isAllDay ? `${endValue}T00:00:00+08:00` : endValue); // 宣告不可重新指定的 endMs，供eventToPublicRecord()使用

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) { // 檢查 (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs)；成立時才執行此分支
    return null; // 回傳 null，交給 eventToPublicRecord() 的呼叫端
  } // 結束 eventToPublicRecord() 的目前區塊、參數或資料結構

  const visibleStartMs = Math.max(startMs, dayStartMs); // 宣告不可重新指定的 visibleStartMs，供eventToPublicRecord()使用
  const visibleEndMs = Math.min(endMs, dayEndMs); // 宣告不可重新指定的 visibleEndMs，供eventToPublicRecord()使用

  if (visibleEndMs <= visibleStartMs) return null; // 檢查 (visibleEndMs <= visibleStartMs) return null;；成立時才執行此分支

  const startMinute = Math.max( // 宣告不可重新指定的 startMinute，供eventToPublicRecord()使用
    0, // 續接 eventToPublicRecord() 的運算、回呼或參數：0,
    Math.min(1440, Math.floor((visibleStartMs - dayStartMs) / 60000)), // 呼叫 Math.min()，處理 讀取 Google Calendar 預約 的 min 邏輯
  ); // 結束 eventToPublicRecord() 的目前區塊、參數或資料結構
  const endMinute = Math.max(0, Math.min(1440, Math.ceil((visibleEndMs - dayStartMs) / 60000))); // 宣告不可重新指定的 endMinute，供eventToPublicRecord()使用

  const rawTitle = typeof event.summary === 'string' ? event.summary.trim() : ''; // 宣告不可重新指定的 rawTitle，供eventToPublicRecord()使用

  return { // 回傳 {，交給 eventToPublicRecord() 的呼叫端
    id: typeof event.id === 'string' ? event.id : null, // 設定 id 欄位的值或型別
    title: (rawTitle || '未命名預約').slice(0, 200), // 設定 title 欄位的值或型別
    all_day: isAllDay, // 設定 all_day 欄位的值或型別
    start: startValue, // 設定 start 欄位的值或型別
    end: endValue, // 設定 end 欄位的值或型別
    start_minute: startMinute, // 設定 start_minute 欄位的值或型別
    end_minute: endMinute, // 設定 end_minute 欄位的值或型別
    start_label: minuteLabel(startMinute), // 設定 start_label 欄位的值或型別
    end_label: minuteLabel(endMinute), // 設定 end_label 欄位的值或型別
  }; // 結束 eventToPublicRecord() 的目前區塊、參數或資料結構
} // 結束 eventToPublicRecord() 的目前區塊、參數或資料結構

async function getGoogleAccessToken() { // 定義 getGoogleAccessToken()：處理 讀取 Google Calendar 預約 的 getGoogleAccessToken 邏輯
  const response = await fetch('https://oauth2.googleapis.com/token', { // 送出 HTTP 請求；需再檢查回應狀態與內容
    method: 'POST', // 設定 method 欄位的值或型別
    headers: { // 設定 HTTP 標頭 欄位的值或型別
      'Content-Type': 'application/x-www-form-urlencoded', // 提供 'Content-Type': 'application/x-www-form-urlencoded', 文字、路徑或資料欄位值
    }, // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構
    body: new URLSearchParams({ // 設定 body 欄位的值或型別
      client_id: requiredEnv('GOOGLE_OAUTH_CLIENT_ID'), // 設定 client_id 欄位的值或型別
      client_secret: requiredEnv('GOOGLE_OAUTH_CLIENT_SECRET'), // 設定 client_secret 欄位的值或型別
      refresh_token: requiredEnv('GOOGLE_CALENDAR_REFRESH_TOKEN'), // 設定 refresh_token 欄位的值或型別
      grant_type: 'refresh_token', // 設定 grant_type 欄位的值或型別
    }), // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構
  }); // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

  const payload = await response.json(); // 宣告不可重新指定的 payload，供getGoogleAccessToken()使用

  if (!response.ok || typeof payload.access_token !== 'string') { // 檢查 (!response.ok || typeof payload.access_token !== 'string')；成立時才執行此分支
    throw new Error( // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      payload.error_description || payload.error || '無法取得 Google Calendar access token', // 續接 getGoogleAccessToken() 的運算、回呼或參數：payload.error_description || payload.error || '無法取得 Google Calendar access t…
    ); // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構
  } // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

  return payload.access_token; // 回傳 payload.access_token，交給 getGoogleAccessToken() 的呼叫端
} // 結束 getGoogleAccessToken() 的目前區塊、參數或資料結構

async function getGoogleCalendarEvents(timeMin, timeMax, accessToken) { // 定義 getGoogleCalendarEvents()：處理 讀取 Google Calendar 預約 的 getGoogleCalendarEvents 邏輯
  const calendarId = requiredEnv('GOOGLE_CALENDAR_ID'); // 宣告不可重新指定的 calendarId，供getGoogleCalendarEvents()使用
  const allEvents = []; // 宣告不可重新指定的 allEvents，供getGoogleCalendarEvents()使用
  let pageToken = ''; // 宣告可更新的 pageToken，供getGoogleCalendarEvents()使用

  do { // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：do {
    const params = new URLSearchParams({ // 宣告不可重新指定的 params，供getGoogleCalendarEvents()使用
      timeMin, // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：timeMin,
      timeMax, // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：timeMax,
      singleEvents: 'true', // 設定 singleEvents 欄位的值或型別
      orderBy: 'startTime', // 設定 orderBy 欄位的值或型別
      showDeleted: 'false', // 設定 showDeleted 欄位的值或型別
      timeZone: TAIPEI_TIME_ZONE, // 設定 timeZone 欄位的值或型別
      maxResults: '250', // 設定 maxResults 欄位的值或型別
      eventTypes: 'default', // 設定 eventTypes 欄位的值或型別
      fields: 'items(id,summary,status,start,end),nextPageToken', // 設定 fields 欄位的值或型別
    }); // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

    if (pageToken) params.set('pageToken', pageToken); // 檢查 (pageToken) params.set('pageToken', pageToken);；成立時才執行此分支

    const response = await fetch( // 送出 HTTP 請求；需再檢查回應狀態與內容
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calen…
      { // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：{
        headers: { // 設定 HTTP 標頭 欄位的值或型別
          Authorization: `Bearer ${accessToken}`, // 設定 Authorization 欄位的值或型別
          Accept: 'application/json', // 設定 Accept 欄位的值或型別
        }, // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構
      }, // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構
    ); // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

    if (!response.ok) { // 檢查 (!response.ok)；成立時才執行此分支
      console.error('Google Calendar API error', response.status); // 把偵錯或測試資訊寫到開發者主控台

      if (response.status === 401 || response.status === 403) { // 檢查 (response.status === 401 || response.status === 403)；成立時才執行此分支
        throw new Error('Google Calendar 授權無效或沒有該日曆的讀取權限'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      } // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

      if (response.status === 404) { // 檢查 (response.status === 404)；成立時才執行此分支
        throw new Error('找不到指定的 Google Calendar，請檢查 Calendar ID'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      } // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

      throw new Error('Google Calendar API 暫時無法使用'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
    } // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

    const payload = await response.json(); // 宣告不可重新指定的 payload，供getGoogleCalendarEvents()使用
    if (Array.isArray(payload.items)) allEvents.push(...payload.items); // 檢查 (Array.isArray(payload.items)) allEvents.push(...payload.items);；成立時才執行此分支
    pageToken = typeof payload.nextPageToken === 'string' ? payload.nextPageToken : ''; // 更新 pageToken，保存本步處理結果
  } while (pageToken); // 續接 getGoogleCalendarEvents() 的運算、回呼或參數：} while (pageToken);

  return allEvents.filter((event) => event?.status !== 'cancelled'); // 回傳 allEvents.filter((event) => event?.status !== 'cancelled')，交給 事件回呼() 的呼叫端
} // 結束 getGoogleCalendarEvents() 的目前區塊、參數或資料結構

async function getCalendarEvents(date, accessToken) { // 定義 getCalendarEvents()：處理 讀取 Google Calendar 預約 的 getCalendarEvents 邏輯
  const nextDate = nextDateString(date); // 宣告不可重新指定的 nextDate，供getCalendarEvents()使用
  const timeMin = `${date.value}T00:00:00+08:00`; // 宣告不可重新指定的 timeMin，供getCalendarEvents()使用
  const timeMax = `${nextDate}T00:00:00+08:00`; // 宣告不可重新指定的 timeMax，供getCalendarEvents()使用
  const dayStartMs = Date.parse(timeMin); // 宣告不可重新指定的 dayStartMs，供getCalendarEvents()使用
  const dayEndMs = Date.parse(timeMax); // 宣告不可重新指定的 dayEndMs，供getCalendarEvents()使用
  const events = await getGoogleCalendarEvents(timeMin, timeMax, accessToken); // 宣告不可重新指定的 events，供getCalendarEvents()使用

  return events // 回傳 events，交給 getCalendarEvents() 的呼叫端
    .map((event) => eventToPublicRecord(event, dayStartMs, dayEndMs)) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    .filter(Boolean) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    .sort( // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      (left, right) => // 續接 事件回呼() 的運算、回呼或參數：(left, right) =>
        left.start_minute - right.start_minute || // 續接 事件回呼() 的運算、回呼或參數：left.start_minute - right.start_minute ||
        left.end_minute - right.end_minute || // 續接 事件回呼() 的運算、回呼或參數：left.end_minute - right.end_minute ||
        left.title.localeCompare(right.title, 'zh-Hant'), // 呼叫 left.title.localeCompare()，處理 讀取 Google Calendar 預約 的 localeCompare 邏輯
    ); // 結束 getCalendarEvents() 的目前區塊、參數或資料結構
} // 結束 getCalendarEvents() 的目前區塊、參數或資料結構

function eventTimeBounds(event) { // 定義 eventTimeBounds()：處理 讀取 Google Calendar 預約 的 eventTimeBounds 邏輯
  const isAllDay = typeof event?.start?.date === 'string'; // 宣告不可重新指定的 isAllDay，供eventTimeBounds()使用
  const startValue = isAllDay ? event?.start?.date : event?.start?.dateTime; // 宣告不可重新指定的 startValue，供eventTimeBounds()使用
  const endValue = isAllDay ? event?.end?.date : event?.end?.dateTime; // 宣告不可重新指定的 endValue，供eventTimeBounds()使用
  if (typeof startValue !== 'string' || typeof endValue !== 'string') { // 檢查 (typeof startValue !== 'string' || typeof endValue !== 'string')；成立時才執行此分支
    return null; // 回傳 null，交給 eventTimeBounds() 的呼叫端
  } // 結束 eventTimeBounds() 的目前區塊、參數或資料結構

  const startMs = Date.parse(isAllDay ? `${startValue}T00:00:00+08:00` : startValue); // 宣告不可重新指定的 startMs，供eventTimeBounds()使用
  const endMs = Date.parse(isAllDay ? `${endValue}T00:00:00+08:00` : endValue); // 宣告不可重新指定的 endMs，供eventTimeBounds()使用
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) { // 檢查 (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs)；成立時才執行此分支
    return null; // 回傳 null，交給 eventTimeBounds() 的呼叫端
  } // 結束 eventTimeBounds() 的目前區塊、參數或資料結構
  return { startMs, endMs }; // 回傳 { startMs, endMs }，交給 eventTimeBounds() 的呼叫端
} // 結束 eventTimeBounds() 的目前區塊、參數或資料結構

async function getCalendarActiveDates(month, accessToken) { // 定義 getCalendarActiveDates()：處理 讀取 Google Calendar 預約 的 getCalendarActiveDates 邏輯
  const nextMonth = nextMonthString(month); // 宣告不可重新指定的 nextMonth，供getCalendarActiveDates()使用
  const timeMin = `${month.value}-01T00:00:00+08:00`; // 宣告不可重新指定的 timeMin，供getCalendarActiveDates()使用
  const timeMax = `${nextMonth}-01T00:00:00+08:00`; // 宣告不可重新指定的 timeMax，供getCalendarActiveDates()使用
  const events = await getGoogleCalendarEvents(timeMin, timeMax, accessToken); // 宣告不可重新指定的 events，供getCalendarActiveDates()使用
  const eventBounds = events.map(eventTimeBounds).filter(Boolean); // 宣告不可重新指定的 eventBounds，供getCalendarActiveDates()使用
  const activeDates = []; // 宣告不可重新指定的 activeDates，供getCalendarActiveDates()使用
  const daysInMonth = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate(); // 宣告不可重新指定的 daysInMonth，供getCalendarActiveDates()使用

  for (let day = 1; day <= daysInMonth; day += 1) { // 依 for (let day = 1; day <= daysInMonth; day += 1) 逐項處理或重複等待
    const dateValue = [ // 宣告不可重新指定的 dateValue，供getCalendarActiveDates()使用
      String(month.year).padStart(4, '0'), // 呼叫 String()，處理 讀取 Google Calendar 預約 的 String 邏輯
      String(month.month).padStart(2, '0'), // 呼叫 String()，處理 讀取 Google Calendar 預約 的 String 邏輯
      String(day).padStart(2, '0'), // 呼叫 String()，處理 讀取 Google Calendar 預約 的 String 邏輯
    ].join('-'); // 續接 getCalendarActiveDates() 的運算、回呼或參數：].join('-');
    const dayStartMs = Date.parse(`${dateValue}T00:00:00+08:00`); // 宣告不可重新指定的 dayStartMs，供getCalendarActiveDates()使用
    const dayEndMs = dayStartMs + 86_400_000; // 宣告不可重新指定的 dayEndMs，供getCalendarActiveDates()使用
    const hasEvent = eventBounds.some( // 宣告不可重新指定的 hasEvent，供getCalendarActiveDates()使用
      (bounds) => bounds.startMs < dayEndMs && bounds.endMs > dayStartMs, // 續接 事件回呼() 的運算、回呼或參數：(bounds) => bounds.startMs < dayEndMs && bounds.endMs > dayStartMs,
    ); // 結束 getCalendarActiveDates() 的目前區塊、參數或資料結構
    if (hasEvent) activeDates.push(dateValue); // 檢查 (hasEvent) activeDates.push(dateValue);；成立時才執行此分支
  } // 結束 getCalendarActiveDates() 的目前區塊、參數或資料結構

  return activeDates; // 回傳 activeDates，交給 getCalendarActiveDates() 的呼叫端
} // 結束 getCalendarActiveDates() 的目前區塊、參數或資料結構

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

  if (!jwt) return jsonResponse({ error: '請先登入' }, 401); // 檢查 (!jwt) return jsonResponse({ error: '請先登入' }, 401);；成立時才執行此分支

  let requestBody; // 宣告可更新的 requestBody，供事件回呼()使用
  try { // 開始可捕捉例外的操作範圍
    requestBody = await request.json(); // 更新 requestBody，保存本步處理結果
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    return jsonResponse({ error: '請求內容不是有效的 JSON' }, 400); // 回傳 jsonResponse({ error: '請求內容不是有效的 JSON' }, 400)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  const mode = requestBody?.mode === 'active_dates' ? 'active_dates' : 'events'; // 宣告不可重新指定的 mode，供事件回呼()使用
  const date = mode === 'events' ? parseDate(requestBody?.date) : null; // 宣告不可重新指定的 查詢日期，供事件回呼()使用
  const month = mode === 'active_dates' ? parseMonth(requestBody?.month) : null; // 宣告不可重新指定的 month，供事件回呼()使用
  if (mode === 'events' && !date) { // 檢查 (mode === 'events' && !date)；成立時才執行此分支
    return jsonResponse({ error: '日期格式必須是 YYYY-MM-DD' }, 400); // 回傳 jsonResponse({ error: '日期格式必須是 YYYY-MM-DD' }, 400)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
  if (mode === 'active_dates' && !month) { // 檢查 (mode === 'active_dates' && !month)；成立時才執行此分支
    return jsonResponse({ error: '月份格式必須是 YYYY-MM' }, 400); // 回傳 jsonResponse({ error: '月份格式必須是 YYYY-MM' }, 400)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構

  try { // 開始可捕捉例外的操作範圍
    const supabaseUrl = requiredEnv('SUPABASE_URL'); // 宣告不可重新指定的 supabaseUrl，供事件回呼()使用
    const publishableKey = readNamedSupabaseKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'); // 宣告不可重新指定的 publishableKey，供事件回呼()使用
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

    const accessToken = await getGoogleAccessToken(); // 宣告不可重新指定的 accessToken，供事件回呼()使用
    if (mode === 'active_dates') { // 檢查 (mode === 'active_dates')；成立時才執行此分支
      if (!month) return jsonResponse({ error: '無效的月份' }, 400); // 檢查 (!month) return jsonResponse({ error: '無效的月份' }, 400);；成立時才執行此分支
      const activeDates = await getCalendarActiveDates(month, accessToken); // 宣告不可重新指定的 activeDates，供事件回呼()使用
      return jsonResponse({ // 回傳 jsonResponse({，交給 事件回呼() 的呼叫端
        ok: true, // 設定 ok 欄位的值或型別
        month: month.value, // 設定 month 欄位的值或型別
        time_zone: TAIPEI_TIME_ZONE, // 設定 time_zone 欄位的值或型別
        active_dates: activeDates, // 設定 active_dates 欄位的值或型別
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (!date) return jsonResponse({ error: '無效的日期' }, 400); // 檢查 (!date) return jsonResponse({ error: '無效的日期' }, 400);；成立時才執行此分支
    const events = await getCalendarEvents(date, accessToken); // 宣告不可重新指定的 events，供事件回呼()使用

    return jsonResponse({ // 回傳 jsonResponse({，交給 事件回呼() 的呼叫端
      ok: true, // 設定 ok 欄位的值或型別
      date: date.value, // 設定 查詢日期 欄位的值或型別
      time_zone: TAIPEI_TIME_ZONE, // 設定 time_zone 欄位的值或型別
      events, // 續接 事件回呼() 的運算、回呼或參數：events,
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
    const message = error instanceof Error ? error.message : '讀取 Google Calendar 時發生未知錯誤'; // 宣告不可重新指定的 message，供事件回呼()使用

    console.error('get-calendar-events failed', message); // 把偵錯或測試資訊寫到開發者主控台
    return jsonResponse({ error: message }, 500); // 回傳 jsonResponse({ error: message }, 500)，交給 事件回呼() 的呼叫端
  } // 結束 事件回呼() 的目前區塊、參數或資料結構
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
