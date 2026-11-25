export const REFRESH_INTERVAL_MS = 60_000; // 宣告不可重新指定的 REFRESH_INTERVAL_MS，供溫度、濕度與照度使用
export const STALE_AFTER_MS = 150_000; // 宣告不可重新指定的 STALE_AFTER_MS，供溫度、濕度與照度使用
export function metric(value) { // 定義 metric()：將有效數字格式化，缺值顯示破折號
  return typeof value === 'number' && Number.isFinite(value) // 回傳 typeof value === 'number' && Number.isFinite(value)，交給 metric() 的呼叫端
    ? value.toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) // 續接 metric() 的運算、回呼或參數：? value.toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionD…
    : '—'; // 續接 metric() 的運算、回呼或參數：: '—';
} // 結束 metric() 的目前區塊、參數或資料結構
export function readingState(row, now = Date.now()) { // 定義 readingState()：判斷資料是否過期或有感測異常
  const received = Date.parse(row?.received_at), // 宣告不可重新指定的 伺服器接收時間，供readingState()使用
    sampled = Date.parse(row?.sampled_at); // 更新 感測時間，保存本步處理結果
  if ( // 檢查 (；成立時才執行此分支
    !Number.isFinite(received) || // 續接 readingState() 的運算、回呼或參數：!Number.isFinite(received) ||
    !Number.isFinite(sampled) || // 續接 readingState() 的運算、回呼或參數：!Number.isFinite(sampled) ||
    received > now + 30_000 || // 續接 readingState() 的運算、回呼或參數：received > now + 30_000 ||
    sampled > now + 30_000 // 續接 readingState() 的運算、回呼或參數：sampled > now + 30_000
  ) // 結束 readingState() 的目前區塊、參數或資料結構
    return 'stale'; // 回傳 'stale'，交給 readingState() 的呼叫端
  if (now - Math.min(received, sampled) > STALE_AFTER_MS) return 'stale'; // 檢查 (now - Math.min(received, sampled) > STALE_AFTER_MS) return 'stale';；成立時才執行此分支
  if ( // 檢查 (；成立時才執行此分支
    metric(row.temperature_c) === '—' || // 呼叫 metric()，將有效數字格式化，缺值顯示破折號
    metric(row.humidity_pct) === '—' || // 呼叫 metric()，將有效數字格式化，缺值顯示破折號
    row.light_status !== 'ok' || // 續接 readingState() 的運算、回呼或參數：row.light_status !== 'ok' ||
    metric(row.illuminance_lux) === '—' // 呼叫 metric()，將有效數字格式化，缺值顯示破折號
  ) // 結束 readingState() 的目前區塊、參數或資料結構
    return 'partial'; // 回傳 'partial'，交給 readingState() 的呼叫端
  return 'fresh'; // 回傳 'fresh'，交給 readingState() 的呼叫端
} // 結束 readingState() 的目前區塊、參數或資料結構
export function ageText(value, now = Date.now()) { // 定義 ageText()：將資料年齡換成易讀時間
  const timestamp = Date.parse(value); // 宣告不可重新指定的 timestamp，供ageText()使用
  if (!Number.isFinite(timestamp) || timestamp > now + 30_000) return '時間不明'; // 檢查 (!Number.isFinite(timestamp) || timestamp > now + 30_000) return '時間不明';；成立時才執行此分支
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000)); // 宣告不可重新指定的 seconds，供ageText()使用
  if (seconds < 60) return `${seconds} 秒`; // 檢查 (seconds < 60) return `${seconds} 秒`;；成立時才執行此分支
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`; // 檢查 (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;；成立時才執行此分支
  if (seconds < 86400) // 檢查 (seconds < 86400)；成立時才執行此分支
    return `${Math.floor(seconds / 3600)} 小時 ${Math.floor((seconds % 3600) / 60)} 分`; // 回傳 `${Math.floor(seconds / 3600)} 小時 ${Math.floor((seconds % 3600) / 60)} 分`，交給 ageText() 的呼叫端
  return `${Math.floor(seconds / 86400)} 天`; // 回傳 `${Math.floor(seconds / 86400)} 天`，交給 ageText() 的呼叫端
} // 結束 ageText() 的目前區塊、參數或資料結構
