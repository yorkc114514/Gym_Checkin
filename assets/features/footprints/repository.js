import { dateKey, validDate, validID, validate, fromAttendance, stats } from './model.js'; // 從 ./model.js 載入相依介面，供個人集章與簽退成果卡使用
const DB_NAME = 'gym-footprints-v1:' + new URL('.', location.href).pathname; // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
const MAX_ROWS = 20000; // 宣告不可重新指定的 MAX_ROWS，供個人集章與簽退成果卡使用
let database; // 宣告可更新的 database，供個人集章與簽退成果卡使用
function open() { // 定義 open()：處理 個人集章與簽退成果卡 的 open 邏輯
  if (database) return database; // 檢查 (database) return database;；成立時才執行此分支
  database = new Promise((resolve, reject) => { // 更新 database，保存本步處理結果
    const request = indexedDB.open(DB_NAME, 1); // 開啟或升級瀏覽器 IndexedDB，保存本機訓練與成果資料
    request.onupgradeneeded = () => { // 續接 事件回呼() 的運算、回呼或參數：request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('stamps', { // 在資料庫升級流程建立 IndexedDB 資料表
        keyPath: ['userId', 'kind', 'date'], // 設定 keyPath 欄位的值或型別
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
      store.createIndex('byUser', 'userId'); // 呼叫 store.createIndex()，處理 個人集章與簽退成果卡 的 createIndex 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    request.onsuccess = () => { // 續接 事件回呼() 的運算、回呼或參數：request.onsuccess = () => {
      request.result.onversionchange = () => { // 續接 事件回呼() 的運算、回呼或參數：request.result.onversionchange = () => {
        request.result.close(); // 呼叫 request.result.close()，處理 個人集章與簽退成果卡 的 close 邏輯
        database = null; // 更新 database，保存本步處理結果
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      resolve(request.result); // 呼叫 resolve()，處理 個人集章與簽退成果卡 的 resolve 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    request.onerror = () => reject(request.error); // 續接 事件回呼() 的運算、回呼或參數：request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('請先關閉其他健身足跡分頁後再試。')); // 續接 事件回呼() 的運算、回呼或參數：request.onblocked = () => reject(new Error('請先關閉其他健身足跡分頁後再試。'));
  }).catch((error) => { // 續接 事件回呼() 的運算、回呼或參數：}).catch((error) => {
    database = null; // 更新 database，保存本步處理結果
    throw error; // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  return database; // 回傳 database，交給 open() 的呼叫端
} // 結束 open() 的目前區塊、參數或資料結構
async function transaction(mode, operation) { // 定義 transaction()：處理 個人集章與簽退成果卡 的 transaction 邏輯
  const db = await open(); // 宣告不可重新指定的 本機 IndexedDB，供transaction()使用
  return new Promise((resolve, reject) => { // 回傳 new Promise((resolve, reject) => {，交給 事件回呼() 的呼叫端
    const tx = db.transaction('stamps', mode); // 建立 IndexedDB 交易，限定本次存取的資料表與讀寫模式
    let result, failure; // 宣告可更新的 處理結果，供事件回呼()使用
    tx.oncomplete = () => resolve(result); // 續接 事件回呼() 的運算、回呼或參數：tx.oncomplete = () => resolve(result);
    tx.onerror = () => {}; // 續接 事件回呼() 的運算、回呼或參數：tx.onerror = () => {};
    tx.onabort = () => // 續接 事件回呼() 的運算、回呼或參數：tx.onabort = () =>
      reject(failure || tx.error || new Error('手機未能儲存印章，請確認空間或瀏覽器設定。')); // 呼叫 reject()，處理 個人集章與簽退成果卡 的 reject 邏輯
    try { // 開始可捕捉例外的操作範圍
      operation( // 呼叫 operation()，處理 個人集章與簽退成果卡 的 operation 邏輯
        tx.objectStore('stamps'), // 呼叫 tx.objectStore()，處理 個人集章與簽退成果卡 的 objectStore 邏輯
        (value) => { // 續接 事件回呼() 的運算、回呼或參數：(value) => {
          result = value; // 更新 處理結果，保存本步處理結果
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        (error) => { // 續接 事件回呼() 的運算、回呼或參數：(error) => {
          failure = error; // 更新 failure，保存本步處理結果
          tx.abort(); // 呼叫 tx.abort()，處理 個人集章與簽退成果卡 的 abort 邏輯
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      failure = error; // 更新 failure，保存本步處理結果
      tx.abort(); // 呼叫 tx.abort()，處理 個人集章與簽退成果卡 的 abort 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 transaction() 的目前區塊、參數或資料結構
function all(userId) { // 定義 all()：處理 個人集章與簽退成果卡 的 all 邏輯
  if (!validID(userId)) return Promise.reject(new Error('請先登入。')); // 檢查 (!validID(userId)) return Promise.reject(new Error('請先登入。'));；成立時才執行此分支
  return transaction('readonly', (store, done) => { // 回傳 transaction('readonly', (store, done) => {，交給 事件回呼() 的呼叫端
    store.index('byUser').getAll(userId).onsuccess = (e) => done(e.target.result); // 呼叫 store.index()，處理 個人集章與簽退成果卡 的 index 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 all() 的目前區塊、參數或資料結構
function record(userId, kind, payload) { // 定義 record()：處理 個人集章與簽退成果卡 的 record 邏輯
  const entry = fromAttendance(userId, kind, payload); // 宣告不可重新指定的 entry，供record()使用
  return transaction('readwrite', (store, done, fail) => { // 回傳 transaction('readwrite', (store, done, fail) => {，交給 事件回呼() 的呼叫端
    store.get([userId, kind, entry.date]).onsuccess = (e) => { // 呼叫 store.get()，處理 個人集章與簽退成果卡 的 get 邏輯
      if (e.target.result) { // 檢查 (e.target.result)；成立時才執行此分支
        done({ entry: e.target.result, duplicate: true }); // 呼叫 done()，處理 個人集章與簽退成果卡 的 done 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      store.index('byUser').count(userId).onsuccess = (e) => { // 呼叫 store.index()，處理 個人集章與簽退成果卡 的 index 邏輯
        if (e.target.result >= MAX_ROWS) { // 檢查 (e.target.result >= MAX_ROWS)；成立時才執行此分支
          fail(new Error('本機集章已達容量上限，請先備份。')); // 呼叫 fail()，處理 個人集章與簽退成果卡 的 fail 邏輯
          return; // 提前結束 事件回呼()，不再執行後續操作
        } // 結束 事件回呼() 的目前區塊、參數或資料結構
        store.add(entry); // 呼叫 store.add()，處理 個人集章與簽退成果卡 的 add 邏輯
        done({ entry, duplicate: false }); // 呼叫 done()，處理 個人集章與簽退成果卡 的 done 邏輯
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 record() 的目前區塊、參數或資料結構
function parseBackup(data, userId) { // 定義 parseBackup()：處理 個人集章與簽退成果卡 的 parseBackup 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !data || // 續接 parseBackup() 的運算、回呼或參數：!data ||
    data.format !== 'gym-footprints-backup' || // 續接 parseBackup() 的運算、回呼或參數：data.format !== 'gym-footprints-backup' ||
    data.version !== 1 || // 續接 parseBackup() 的運算、回呼或參數：data.version !== 1 ||
    data.userId !== userId || // 續接 parseBackup() 的運算、回呼或參數：data.userId !== userId ||
    !Array.isArray(data.stamps) || // 續接 parseBackup() 的運算、回呼或參數：!Array.isArray(data.stamps) ||
    data.stamps.length > MAX_ROWS // 續接 parseBackup() 的運算、回呼或參數：data.stamps.length > MAX_ROWS
  ) // 結束 parseBackup() 的目前區塊、參數或資料結構
    throw new Error('請使用同一 Google 帳號匯出的健身足跡備份（版本 1）。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  const rows = data.stamps.map((r) => validate(r, userId)); // 宣告不可重新指定的 顯示用資料列，供事件回呼()使用
  if (new Set(rows.map((r) => `${r.kind}:${r.date}`)).size !== rows.length) // 檢查 (new Set(rows.map((r) => `${r.kind}:${r.date}`)).size !== rows.length)；成立時才執行此分支
    throw new Error('備份包含重複日期印章，未匯入。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  return rows; // 回傳 rows，交給 parseBackup() 的呼叫端
} // 結束 parseBackup() 的目前區塊、參數或資料結構
function merge(userId, rows) { // 定義 merge()：處理 個人集章與簽退成果卡 的 merge 邏輯
  const clean = rows.map((r) => validate(r, userId)); // 宣告不可重新指定的 clean，供事件回呼()使用
  return transaction('readwrite', (store, done, fail) => { // 回傳 transaction('readwrite', (store, done, fail) => {，交給 事件回呼() 的呼叫端
    store.index('byUser').getAll(userId).onsuccess = (e) => { // 呼叫 store.index()，處理 個人集章與簽退成果卡 的 index 邏輯
      const keys = new Set(e.target.result.map((r) => `${r.kind}:${r.date}`)); // 宣告不可重新指定的 keys，供事件回呼()使用
      const added = clean.filter((r) => !keys.has(`${r.kind}:${r.date}`)); // 宣告不可重新指定的 added，供事件回呼()使用
      if (keys.size + added.length > MAX_ROWS) { // 檢查 (keys.size + added.length > MAX_ROWS)；成立時才執行此分支
        fail(new Error('合併後超過本機容量上限，未匯入。')); // 呼叫 fail()，處理 個人集章與簽退成果卡 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      added.forEach((r) => store.add(r)); // 呼叫 added.forEach()，處理 個人集章與簽退成果卡 的 forEach 邏輯
      done({ added: added.length, skipped: clean.length - added.length }); // 呼叫 done()，處理 個人集章與簽退成果卡 的 done 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 merge() 的目前區塊、參數或資料結構
export const FootprintsStore = { // 宣告不可重新指定的 FootprintsStore，供個人集章與簽退成果卡使用
  record, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：record,
  all, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：all,
  stats, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：stats,
  fromAttendance, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：fromAttendance,
  parseBackup, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：parseBackup,
  merge, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：merge,
  dateKey, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：dateKey,
  validDate, // 續接 個人集章與簽退成果卡 的運算、回呼或參數：validDate,
}; // 結束 個人集章與簽退成果卡 的目前區塊、參數或資料結構
