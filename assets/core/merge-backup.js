import { tx } from './fitness-db.js'; // 從 ./fitness-db.js 載入相依介面，供共用連線與本機資料儲存使用
export function mergeRecords({ data, table, format, validate, key, userId, max }) { // 定義 mergeRecords()：處理 共用連線與本機資料儲存 的 mergeRecords 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !data || // 續接 mergeRecords() 的運算、回呼或參數：!data ||
    data.format !== format || // 續接 mergeRecords() 的運算、回呼或參數：data.format !== format ||
    data.version !== 1 || // 續接 mergeRecords() 的運算、回呼或參數：data.version !== 1 ||
    (userId && data.userId !== userId) || // 續接 mergeRecords() 的運算、回呼或參數：(userId && data.userId !== userId) ||
    !Array.isArray(data.records) || // 續接 mergeRecords() 的運算、回呼或參數：!Array.isArray(data.records) ||
    data.records.length > max // 續接 mergeRecords() 的運算、回呼或參數：data.records.length > max
  ) // 結束 mergeRecords() 的目前區塊、參數或資料結構
    throw Error('請使用正確的備份檔及帳號。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  const clean = data.records.map(validate), // 宣告不可重新指定的 clean，供mergeRecords()使用
    keys = clean.map(key); // 更新 keys，保存本步處理結果
  if (new Set(keys).size !== keys.length) throw Error('備份中有重複日期或月份。'); // 檢查 (new Set(keys).size !== keys.length) throw Error('備份中有重複日期或月份。');；成立時才執行此分支
  return tx(table, 'readwrite', (s, done, fail) => { // 回傳 tx(table, 'readwrite', (s, done, fail) => {，交給 事件回呼() 的呼叫端
    const req = userId ? s.index('byUser').getAll(userId) : s.getAll(); // 宣告不可重新指定的 req，供事件回呼()使用
    req.onsuccess = (e) => { // 續接 事件回呼() 的運算、回呼或參數：req.onsuccess = (e) => {
      const existing = new Set(e.target.result.map(key)), // 宣告不可重新指定的 existing，供事件回呼()使用
        added = clean.filter((r) => !existing.has(key(r))); // 更新 added，保存本步處理結果
      if (existing.size + added.length > max) { // 檢查 (existing.size + added.length > max)；成立時才執行此分支
        fail(Error('合併後超過本機筆數上限。')); // 呼叫 fail()，處理 共用連線與本機資料儲存 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      added.forEach((r) => s.add(r)); // 呼叫 added.forEach()，處理 共用連線與本機資料儲存 的 forEach 邏輯
      done({ added: added.length, skipped: clean.length - added.length }); // 呼叫 done()，處理 共用連線與本機資料儲存 的 done 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 mergeRecords() 的目前區塊、參數或資料結構
