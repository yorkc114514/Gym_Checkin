function validDate(value) { // 定義 validDate()：處理 本機訓練紀錄 的 validDate 邏輯
  return ( // 回傳 (，交給 validDate() 的呼叫端
    typeof value === 'string' && // 續接 validDate() 的運算、回呼或參數：typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    Number.isFinite(Date.parse(value)) && // 呼叫 Number.isFinite()，處理 本機訓練紀錄 的 isFinite 邏輯
    new Date(value).toISOString().slice(0, 10) === value // 續接 validDate() 的運算、回呼或參數：new Date(value).toISOString().slice(0, 10) === value
  ); // 結束 validDate() 的目前區塊、參數或資料結構
} // 結束 validDate() 的目前區塊、參數或資料結構
function validate(record) { // 定義 validate()：處理 本機訓練紀錄 的 validate 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !record || // 續接 validate() 的運算、回呼或參數：!record ||
    typeof record !== 'object' || // 續接 validate() 的運算、回呼或參數：typeof record !== 'object' ||
    typeof record.id !== 'string' || // 續接 validate() 的運算、回呼或參數：typeof record.id !== 'string' ||
    !/^[a-zA-Z0-9_-]{8,80}$/.test(record.id) || // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    !validDate(record.date) || // 續接 validate() 的運算、回呼或參數：!validDate(record.date) ||
    typeof record.exercise !== 'string' || // 續接 validate() 的運算、回呼或參數：typeof record.exercise !== 'string' ||
    !record.exercise.trim() || // 續接 validate() 的運算、回呼或參數：!record.exercise.trim() ||
    record.exercise.length > 60 || // 續接 validate() 的運算、回呼或參數：record.exercise.length > 60 ||
    typeof record.note !== 'string' || // 續接 validate() 的運算、回呼或參數：typeof record.note !== 'string' ||
    record.note.length > 200 || // 續接 validate() 的運算、回呼或參數：record.note.length > 200 ||
    !Number.isFinite(record.weight) || // 續接 validate() 的運算、回呼或參數：!Number.isFinite(record.weight) ||
    record.weight < 0 || // 續接 validate() 的運算、回呼或參數：record.weight < 0 ||
    record.weight > 2000 || // 續接 validate() 的運算、回呼或參數：record.weight > 2000 ||
    !Number.isInteger(record.reps) || // 續接 validate() 的運算、回呼或參數：!Number.isInteger(record.reps) ||
    record.reps < 1 || // 續接 validate() 的運算、回呼或參數：record.reps < 1 ||
    record.reps > 999 || // 續接 validate() 的運算、回呼或參數：record.reps > 999 ||
    !Number.isInteger(record.sets) || // 續接 validate() 的運算、回呼或參數：!Number.isInteger(record.sets) ||
    record.sets < 1 || // 續接 validate() 的運算、回呼或參數：record.sets < 1 ||
    record.sets > 100 || // 續接 validate() 的運算、回呼或參數：record.sets > 100 ||
    !Number.isSafeInteger(record.createdAt) || // 續接 validate() 的運算、回呼或參數：!Number.isSafeInteger(record.createdAt) ||
    record.createdAt < 0 || // 續接 validate() 的運算、回呼或參數：record.createdAt < 0 ||
    !Number.isSafeInteger(record.updatedAt) || // 續接 validate() 的運算、回呼或參數：!Number.isSafeInteger(record.updatedAt) ||
    record.updatedAt < record.createdAt // 續接 validate() 的運算、回呼或參數：record.updatedAt < record.createdAt
  ) { // 續接 validate() 的運算、回呼或參數：) {
    throw new Error('紀錄格式或數值不正確，未變更手機資料。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 validate() 的目前區塊、參數或資料結構
  return { // 回傳 {，交給 validate() 的呼叫端
    id: record.id, // 設定 id 欄位的值或型別
    date: record.date, // 設定 查詢日期 欄位的值或型別
    exercise: record.exercise.trim(), // 設定 exercise 欄位的值或型別
    weight: record.weight, // 設定 weight 欄位的值或型別
    reps: record.reps, // 設定 reps 欄位的值或型別
    sets: record.sets, // 設定 sets 欄位的值或型別
    note: record.note.trim(), // 設定 note 欄位的值或型別
    createdAt: record.createdAt, // 設定 createdAt 欄位的值或型別
    updatedAt: record.updatedAt, // 設定 updatedAt 欄位的值或型別
  }; // 結束 validate() 的目前區塊、參數或資料結構
} // 結束 validate() 的目前區塊、參數或資料結構

export { validDate, validate }; // 匯出本模組的公開介面，供其他頁面引用
