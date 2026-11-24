let database; // 宣告可更新的 database，供共用連線與本機資料儲存使用
const DB = 'gym-fitness-v19:' + new URL('.', location.href).pathname; // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
function open() { // 定義 open()：處理 共用連線與本機資料儲存 的 open 邏輯
  if (database) return database; // 檢查 (database) return database;；成立時才執行此分支
  database = new Promise((resolve, reject) => { // 更新 database，保存本步處理結果
    const req = indexedDB.open(DB, 1); // 開啟或升級瀏覽器 IndexedDB，保存本機訓練與成果資料
    req.onupgradeneeded = () => { // 續接 事件回呼() 的運算、回呼或參數：req.onupgradeneeded = () => {
      req.result.createObjectStore('weights', { keyPath: 'date' }); // 在資料庫升級流程建立 IndexedDB 資料表
      req.result // 續接 事件回呼() 的運算、回呼或參數：req.result
        .createObjectStore('cards', { keyPath: ['userId', 'month'] }) // 在資料庫升級流程建立 IndexedDB 資料表
        .createIndex('byUser', 'userId'); // 呼叫 .createIndex()，處理 共用連線與本機資料儲存 的 createIndex 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    req.onsuccess = () => { // 續接 事件回呼() 的運算、回呼或參數：req.onsuccess = () => {
      req.result.onversionchange = () => { // 續接 事件回呼() 的運算、回呼或參數：req.result.onversionchange = () => {
        req.result.close(); // 呼叫 req.result.close()，處理 共用連線與本機資料儲存 的 close 邏輯
        database = null; // 更新 database，保存本步處理結果
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      resolve(req.result); // 呼叫 resolve()，處理 共用連線與本機資料儲存 的 resolve 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    req.onerror = () => reject(req.error); // 續接 事件回呼() 的運算、回呼或參數：req.onerror = () => reject(req.error);
    req.onblocked = () => reject(Error('請關閉其他分頁後再試。')); // 續接 事件回呼() 的運算、回呼或參數：req.onblocked = () => reject(Error('請關閉其他分頁後再試。'));
  }).catch((e) => { // 續接 事件回呼() 的運算、回呼或參數：}).catch((e) => {
    database = null; // 更新 database，保存本步處理結果
    throw e; // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  return database; // 回傳 database，交給 open() 的呼叫端
} // 結束 open() 的目前區塊、參數或資料結構
async function tx(table, mode, op) { // 定義 tx()：處理 共用連線與本機資料儲存 的 tx 邏輯
  const db = await open(); // 宣告不可重新指定的 本機 IndexedDB，供tx()使用
  return new Promise((resolve, reject) => { // 回傳 new Promise((resolve, reject) => {，交給 事件回呼() 的呼叫端
    const t = db.transaction(table, mode); // 建立 IndexedDB 交易，限定本次存取的資料表與讀寫模式
    let result, failure; // 宣告可更新的 處理結果，供事件回呼()使用
    t.oncomplete = () => resolve(result); // 續接 事件回呼() 的運算、回呼或參數：t.oncomplete = () => resolve(result);
    t.onerror = () => {}; // 續接 事件回呼() 的運算、回呼或參數：t.onerror = () => {};
    t.onabort = () => reject(failure || t.error || Error('本機儲存失敗，請確認瀏覽器空間。')); // 續接 事件回呼() 的運算、回呼或參數：t.onabort = () => reject(failure || t.error || Error('本機儲存失敗，請確認瀏覽器空間。'));
    try { // 開始可捕捉例外的操作範圍
      op( // 呼叫 op()，處理 共用連線與本機資料儲存 的 op 邏輯
        t.objectStore(table), // 呼叫 t.objectStore()，處理 共用連線與本機資料儲存 的 objectStore 邏輯
        (v) => { // 續接 事件回呼() 的運算、回呼或參數：(v) => {
          result = v; // 更新 處理結果，保存本步處理結果
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        (e) => { // 續接 事件回呼() 的運算、回呼或參數：(e) => {
          failure = e; // 更新 failure，保存本步處理結果
          t.abort(); // 呼叫 t.abort()，處理 共用連線與本機資料儲存 的 abort 邏輯
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      failure = e; // 更新 failure，保存本步處理結果
      t.abort(); // 呼叫 t.abort()，處理 共用連線與本機資料儲存 的 abort 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 tx() 的目前區塊、參數或資料結構

export { tx }; // 匯出本模組的公開介面，供其他頁面引用
