export const validDate = (v) => // 宣告不可重新指定的 validDate，供validDate()使用
  typeof v === 'string' && // 續接 validDate() 的運算、回呼或參數：typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  Number.isFinite(Date.parse(v)) && // 呼叫 Number.isFinite()，處理 共用日期、表單與介面 的 isFinite 邏輯
  new Date(v).toISOString().slice(0, 10) === v; // 續接 validDate() 的運算、回呼或參數：new Date(v).toISOString().slice(0, 10) === v;
export const validID = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(v); // 建立測試案例，將下方操作與預期結果放在同一測試範圍
export const validMonth = (v) => // 宣告不可重新指定的 validMonth，供validMonth()使用
  typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v) && Number(v.slice(0, 4)) >= 1970; // 建立測試案例，將下方操作與預期結果放在同一測試範圍
export const nonnegative = (v) => Number.isFinite(v) && v >= 0; // 宣告不可重新指定的 nonnegative，供nonnegative()使用
