function dateKey(value) { // 定義 dateKey()：處理 個人集章與簽退成果卡 的 dateKey 邏輯
  const parts = new Intl.DateTimeFormat('en', { // 宣告不可重新指定的 parts，供dateKey()使用
    timeZone: 'Asia/Taipei', // 設定 timeZone 欄位的值或型別
    year: 'numeric', // 設定 year 欄位的值或型別
    month: '2-digit', // 設定 month 欄位的值或型別
    day: '2-digit', // 設定 day 欄位的值或型別
  }).formatToParts(new Date(value)); // 續接 dateKey() 的運算、回呼或參數：}).formatToParts(new Date(value));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value])); // 宣告不可重新指定的 p，供事件回呼()使用
  return `${p.year}-${p.month}-${p.day}`; // 回傳 `${p.year}-${p.month}-${p.day}`，交給 dateKey() 的呼叫端
} // 結束 dateKey() 的目前區塊、參數或資料結構
const validDate = (value) => // 宣告不可重新指定的 validDate，供validDate()使用
  typeof value === 'string' && // 續接 validDate() 的運算、回呼或參數：typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  Number.isFinite(Date.parse(value)) && // 呼叫 Number.isFinite()，處理 個人集章與簽退成果卡 的 isFinite 邏輯
  new Date(value).toISOString().slice(0, 10) === value; // 續接 validDate() 的運算、回呼或參數：new Date(value).toISOString().slice(0, 10) === value;
const validID = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(value); // 建立測試案例，將下方操作與預期結果放在同一測試範圍
const validTime = (value) => // 宣告不可重新指定的 validTime，供validTime()使用
  typeof value === 'string' && // 續接 validTime() 的運算、回呼或參數：typeof value === 'string' &&
  /^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value) && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  Number.isFinite(Date.parse(value)); // 呼叫 Number.isFinite()，處理 個人集章與簽退成果卡 的 isFinite 邏輯
function validate(value, userId) { // 定義 validate()：處理 個人集章與簽退成果卡 的 validate 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !value || // 續接 validate() 的運算、回呼或參數：!value ||
    !validID(userId) || // 續接 validate() 的運算、回呼或參數：!validID(userId) ||
    value.userId !== userId || // 續接 validate() 的運算、回呼或參數：value.userId !== userId ||
    !validID(value.sessionId) || // 續接 validate() 的運算、回呼或參數：!validID(value.sessionId) ||
    !['in', 'out'].includes(value.kind) || // 續接 validate() 的運算、回呼或參數：!['in', 'out'].includes(value.kind) ||
    !validDate(value.date) || // 續接 validate() 的運算、回呼或參數：!validDate(value.date) ||
    !validTime(value.at) || // 續接 validate() 的運算、回呼或參數：!validTime(value.at) ||
    !validTime(value.checkedInAt) || // 續接 validate() 的運算、回呼或參數：!validTime(value.checkedInAt) ||
    (value.kind === 'out' && !validTime(value.checkedOutAt)) || // 續接 validate() 的運算、回呼或參數：(value.kind === 'out' && !validTime(value.checkedOutAt)) ||
    value.date !== dateKey(value.at) || // 續接 validate() 的運算、回呼或參數：value.date !== dateKey(value.at) ||
    (value.kind === 'in' && value.at !== value.checkedInAt) || // 續接 validate() 的運算、回呼或參數：(value.kind === 'in' && value.at !== value.checkedInAt) ||
    (value.kind === 'out' && // 續接 validate() 的運算、回呼或參數：(value.kind === 'out' &&
      (value.at !== value.checkedOutAt || // 續接 validate() 的運算、回呼或參數：(value.at !== value.checkedOutAt ||
        Date.parse(value.checkedOutAt) < Date.parse(value.checkedInAt))) // 呼叫 Date.parse()，處理 個人集章與簽退成果卡 的 parse 邏輯
  ) { // 續接 validate() 的運算、回呼或參數：) {
    throw new Error('蓋章資料格式不完整或帳號不符，未變更本機紀錄。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 validate() 的目前區塊、參數或資料結構
  return { // 回傳 {，交給 validate() 的呼叫端
    userId, // 續接 validate() 的運算、回呼或參數：userId,
    kind: value.kind, // 設定 kind 欄位的值或型別
    date: value.date, // 設定 查詢日期 欄位的值或型別
    at: value.at, // 設定 at 欄位的值或型別
    sessionId: value.sessionId, // 設定 sessionId 欄位的值或型別
    checkedInAt: value.checkedInAt, // 設定 checkedInAt 欄位的值或型別
    checkedOutAt: value.kind === 'out' ? value.checkedOutAt : null, // 設定 checkedOutAt 欄位的值或型別
  }; // 結束 validate() 的目前區塊、參數或資料結構
} // 結束 validate() 的目前區塊、參數或資料結構
function fromAttendance(userId, kind, payload) { // 定義 fromAttendance()：處理 個人集章與簽退成果卡 的 fromAttendance 邏輯
  const row = Array.isArray(payload) ? payload[0] : payload; // 宣告不可重新指定的 目前資料列，供fromAttendance()使用
  if (!row || row.user_id !== userId || !['in', 'out'].includes(kind)) // 檢查 (!row || row.user_id !== userId || !['in', 'out'].includes(kind))；成立時才執行此分支
    throw new Error('簽到／簽退回傳資料不足，無法建立本機印章。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  if (kind === 'out' && (row.checkout_method !== 'self' || row.checked_out_by !== userId)) { // 檢查 (kind === 'out' && (row.checkout_method !== 'self' || row.checked_out_by !== userId))；成立時才執行此分支
    throw new Error('只有本人成功簽退才會產生成果卡；協助他人簽退不集章。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 fromAttendance() 的目前區塊、參數或資料結構
  const at = kind === 'in' ? row.checked_in_at : row.checked_out_at; // 宣告不可重新指定的 at，供fromAttendance()使用
  if (!validTime(at)) throw new Error('缺少伺服器確認時間，未蓋章。'); // 檢查 (!validTime(at)) throw new Error('缺少伺服器確認時間，未蓋章。');；成立時才執行此分支
  return validate( // 回傳 validate(，交給 fromAttendance() 的呼叫端
    { // 續接 fromAttendance() 的運算、回呼或參數：{
      userId, // 續接 fromAttendance() 的運算、回呼或參數：userId,
      kind, // 續接 fromAttendance() 的運算、回呼或參數：kind,
      date: dateKey(at), // 設定 查詢日期 欄位的值或型別
      at, // 續接 fromAttendance() 的運算、回呼或參數：at,
      sessionId: row.id, // 設定 sessionId 欄位的值或型別
      checkedInAt: row.checked_in_at, // 設定 checkedInAt 欄位的值或型別
      checkedOutAt: row.checked_out_at, // 設定 checkedOutAt 欄位的值或型別
    }, // 結束 fromAttendance() 的目前區塊、參數或資料結構
    userId, // 續接 fromAttendance() 的運算、回呼或參數：userId,
  ); // 結束 fromAttendance() 的目前區塊、參數或資料結構
} // 結束 fromAttendance() 的目前區塊、參數或資料結構
function stats(rows, kind, date) { // 定義 stats()：處理 個人集章與簽退成果卡 的 stats 邏輯
  const d = new Date(`${date}T00:00:00Z`), // 宣告不可重新指定的 d，供stats()使用
    offset = (d.getUTCDay() + 6) % 7; // 更新 offset，保存本步處理結果
  d.setUTCDate(d.getUTCDate() - offset); // 呼叫 d.setUTCDate()，處理 個人集章與簽退成果卡 的 setUTCDate 邏輯
  const monday = d.toISOString().slice(0, 10); // 宣告不可重新指定的 monday，供stats()使用
  const dates = [ // 宣告不可重新指定的 dates，供stats()使用
    ...new Set(rows.filter((r) => r.kind === kind && r.date <= date).map((r) => r.date)), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  ]; // 結束 stats() 的目前區塊、參數或資料結構
  return { // 回傳 {，交給 stats() 的呼叫端
    total: dates.length, // 設定 total 欄位的值或型別
    month: dates.filter((v) => v.startsWith(date.slice(0, 7))).length, // 設定 month 欄位的值或型別
    week: dates.filter((v) => v >= monday).length, // 設定 week 欄位的值或型別
  }; // 結束 stats() 的目前區塊、參數或資料結構
} // 結束 stats() 的目前區塊、參數或資料結構

export { dateKey, validDate, validID, validate, fromAttendance, stats }; // 匯出本模組的公開介面，供其他頁面引用
