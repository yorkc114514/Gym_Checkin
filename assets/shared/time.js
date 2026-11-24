export function formatTime(value) { // 定義 formatTime()：處理 共用日期、表單與介面 的 formatTime 邏輯
  return new Intl.DateTimeFormat('zh-TW', { // 回傳 new Intl.DateTimeFormat('zh-TW', {，交給 formatTime() 的呼叫端
    timeZone: 'Asia/Taipei', // 設定 timeZone 欄位的值或型別
    hour: '2-digit', // 設定 hour 欄位的值或型別
    minute: '2-digit', // 設定 minute 欄位的值或型別
    hour12: false, // 設定 hour12 欄位的值或型別
  }).format(new Date(value)); // 續接 formatTime() 的運算、回呼或參數：}).format(new Date(value));
} // 結束 formatTime() 的目前區塊、參數或資料結構

export function formatDateTime(value) { // 定義 formatDateTime()：處理 共用日期、表單與介面 的 formatDateTime 邏輯
  return new Intl.DateTimeFormat('zh-TW', { // 回傳 new Intl.DateTimeFormat('zh-TW', {，交給 formatDateTime() 的呼叫端
    timeZone: 'Asia/Taipei', // 設定 timeZone 欄位的值或型別
    year: 'numeric', // 設定 year 欄位的值或型別
    month: '2-digit', // 設定 month 欄位的值或型別
    day: '2-digit', // 設定 day 欄位的值或型別
    hour: '2-digit', // 設定 hour 欄位的值或型別
    minute: '2-digit', // 設定 minute 欄位的值或型別
    hour12: false, // 設定 hour12 欄位的值或型別
  }).format(new Date(value)); // 續接 formatDateTime() 的運算、回呼或參數：}).format(new Date(value));
} // 結束 formatDateTime() 的目前區塊、參數或資料結構

export function taipeiDateString(value = new Date()) { // 定義 taipeiDateString()：處理 共用日期、表單與介面 的 taipeiDateString 邏輯
  const parts = new Intl.DateTimeFormat('en', { // 宣告不可重新指定的 parts，供taipeiDateString()使用
    timeZone: 'Asia/Taipei', // 設定 timeZone 欄位的值或型別
    year: 'numeric', // 設定 year 欄位的值或型別
    month: '2-digit', // 設定 month 欄位的值或型別
    day: '2-digit', // 設定 day 欄位的值或型別
  }).formatToParts(value); // 續接 taipeiDateString() 的運算、回呼或參數：}).formatToParts(value);
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value])); // 宣告不可重新指定的 partMap，供事件回呼()使用
  return `${partMap.year}-${partMap.month}-${partMap.day}`; // 回傳 `${partMap.year}-${partMap.month}-${partMap.day}`，交給 taipeiDateString() 的呼叫端
} // 結束 taipeiDateString() 的目前區塊、參數或資料結構

export function nextDateString(dateString) { // 定義 nextDateString()：處理 共用日期、表單與介面 的 nextDateString 邏輯
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null; // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  const [year, month, day] = dateString.split('-').map(Number); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  const parsed = new Date(Date.UTC(year, month - 1, day)); // 宣告不可重新指定的 parsed，供nextDateString()使用

  if ( // 檢查 (；成立時才執行此分支
    parsed.getUTCFullYear() !== year || // 呼叫 parsed.getUTCFullYear()，處理 共用日期、表單與介面 的 getUTCFullYear 邏輯
    parsed.getUTCMonth() !== month - 1 || // 呼叫 parsed.getUTCMonth()，處理 共用日期、表單與介面 的 getUTCMonth 邏輯
    parsed.getUTCDate() !== day // 呼叫 parsed.getUTCDate()，處理 共用日期、表單與介面 的 getUTCDate 邏輯
  ) { // 續接 nextDateString() 的運算、回呼或參數：) {
    return null; // 回傳 null，交給 nextDateString() 的呼叫端
  } // 結束 nextDateString() 的目前區塊、參數或資料結構

  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10); // 回傳 new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10)，交給 nextDateString() 的呼叫端
} // 結束 nextDateString() 的目前區塊、參數或資料結構
