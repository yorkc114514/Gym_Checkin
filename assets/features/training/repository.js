import { validDate, validate } from './validation.js'; // 從 ./validation.js 載入相依介面，供本機訓練紀錄使用
const DB_NAME = 'gym-training-v1:' + new URL('.', location.href).pathname; // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
const MAX_RECORDS = 10000; // 宣告不可重新指定的 MAX_RECORDS，供本機訓練紀錄使用
let database; // 宣告可更新的 database，供本機訓練紀錄使用
function open() { // 定義 open()：處理 本機訓練紀錄 的 open 邏輯
  if (database) return database; // 檢查 (database) return database;；成立時才執行此分支
  database = new Promise((resolve, reject) => { // 更新 database，保存本步處理結果
    const request = indexedDB.open(DB_NAME, 1); // 開啟或升級瀏覽器 IndexedDB，保存本機訓練與成果資料
    request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' }); // 在資料庫升級流程建立 IndexedDB 資料表
    request.onsuccess = () => { // 續接 事件回呼() 的運算、回呼或參數：request.onsuccess = () => {
      request.result.onversionchange = () => { // 續接 事件回呼() 的運算、回呼或參數：request.result.onversionchange = () => {
        request.result.close(); // 呼叫 request.result.close()，處理 本機訓練紀錄 的 close 邏輯
        database = null; // 更新 database，保存本步處理結果
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      resolve(request.result); // 呼叫 resolve()，處理 本機訓練紀錄 的 resolve 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    request.onerror = () => reject(request.error); // 續接 事件回呼() 的運算、回呼或參數：request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('請先關閉其他訓練助手分頁，再重新開啟。')); // 續接 事件回呼() 的運算、回呼或參數：request.onblocked = () => reject(new Error('請先關閉其他訓練助手分頁，再重新開啟。'));
  }).catch((error) => { // 續接 事件回呼() 的運算、回呼或參數：}).catch((error) => {
    database = null; // 更新 database，保存本步處理結果
    throw error; // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  return database; // 回傳 database，交給 open() 的呼叫端
} // 結束 open() 的目前區塊、參數或資料結構
async function transaction(mode, operation) { // 定義 transaction()：處理 本機訓練紀錄 的 transaction 邏輯
  const db = await open(); // 宣告不可重新指定的 本機 IndexedDB，供transaction()使用
  return new Promise((resolve, reject) => { // 回傳 new Promise((resolve, reject) => {，交給 事件回呼() 的呼叫端
    const tx = db.transaction('records', mode); // 建立 IndexedDB 交易，限定本次存取的資料表與讀寫模式
    let result, failure; // 宣告可更新的 處理結果，供事件回呼()使用
    tx.oncomplete = () => resolve(result); // 續接 事件回呼() 的運算、回呼或參數：tx.oncomplete = () => resolve(result);
    tx.onerror = () => {}; // onabort owns the final failure, including quota errors. // 續接 事件回呼() 的運算、回呼或參數：tx.onerror = () => {}; // onabort owns the final failure, including quota er…
    tx.onabort = () => // 續接 事件回呼() 的運算、回呼或參數：tx.onabort = () =>
      reject(failure || tx.error || new Error('儲存失敗，請確認手機空間與瀏覽器設定。')); // 呼叫 reject()，處理 本機訓練紀錄 的 reject 邏輯
    try { // 開始可捕捉例外的操作範圍
      operation( // 呼叫 operation()，處理 本機訓練紀錄 的 operation 邏輯
        tx.objectStore('records'), // 呼叫 tx.objectStore()，處理 本機訓練紀錄 的 objectStore 邏輯
        (value) => { // 續接 事件回呼() 的運算、回呼或參數：(value) => {
          result = value; // 更新 處理結果，保存本步處理結果
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        (error) => { // 續接 事件回呼() 的運算、回呼或參數：(error) => {
          failure = error; // 更新 failure，保存本步處理結果
          tx.abort(); // 呼叫 tx.abort()，處理 本機訓練紀錄 的 abort 邏輯
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      failure = error; // 更新 failure，保存本步處理結果
      tx.abort(); // 呼叫 tx.abort()，處理 本機訓練紀錄 的 abort 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 transaction() 的目前區塊、參數或資料結構
const all = () => // 宣告不可重新指定的 all，供all()使用
  transaction('readonly', (store, done) => { // 呼叫 transaction()，處理 本機訓練紀錄 的 transaction 邏輯
    store.getAll().onsuccess = (e) => done(e.target.result); // 呼叫 store.getAll()，處理 本機訓練紀錄 的 getAll 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
function save(record, expectedUpdate = null) { // 定義 save()：處理 本機訓練紀錄 的 save 邏輯
  const clean = validate(record); // 宣告不可重新指定的 clean，供save()使用
  return transaction('readwrite', (store, done, fail) => { // 回傳 transaction('readwrite', (store, done, fail) => {，交給 事件回呼() 的呼叫端
    store.get(clean.id).onsuccess = (event) => { // 呼叫 store.get()，處理 本機訓練紀錄 的 get 邏輯
      const old = event.target.result; // 宣告不可重新指定的 old，供事件回呼()使用
      if ( // 檢查 (；成立時才執行此分支
        (expectedUpdate !== null && (!old || old.updatedAt !== expectedUpdate)) || // 續接 事件回呼() 的運算、回呼或參數：(expectedUpdate !== null && (!old || old.updatedAt !== expectedUpdate)) ||
        (expectedUpdate === null && old) // 續接 事件回呼() 的運算、回呼或參數：(expectedUpdate === null && old)
      ) { // 續接 事件回呼() 的運算、回呼或參數：) {
        fail(new Error('這筆紀錄已在另一分頁變更，請重新整理後再編輯。')); // 呼叫 fail()，處理 本機訓練紀錄 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      store.count().onsuccess = (event) => { // 呼叫 store.count()，處理 本機訓練紀錄 的 count 邏輯
        if (!old && event.target.result >= MAX_RECORDS) { // 檢查 (!old && event.target.result >= MAX_RECORDS)；成立時才執行此分支
          fail(new Error('已達 10,000 筆，請先備份並整理紀錄。')); // 呼叫 fail()，處理 本機訓練紀錄 的 fail 邏輯
          return; // 提前結束 事件回呼()，不再執行後續操作
        } // 結束 事件回呼() 的目前區塊、參數或資料結構
        store.put(clean); // 呼叫 store.put()，處理 本機訓練紀錄 的 put 邏輯
        done(clean); // 呼叫 done()，處理 本機訓練紀錄 的 done 邏輯
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 save() 的目前區塊、參數或資料結構
function remove(id, expectedUpdate) { // 定義 remove()：處理 本機訓練紀錄 的 remove 邏輯
  return transaction('readwrite', (store, done, fail) => { // 回傳 transaction('readwrite', (store, done, fail) => {，交給 事件回呼() 的呼叫端
    store.get(id).onsuccess = (e) => { // 呼叫 store.get()，處理 本機訓練紀錄 的 get 邏輯
      if (!e.target.result || e.target.result.updatedAt !== expectedUpdate) { // 檢查 (!e.target.result || e.target.result.updatedAt !== expectedUpdate)；成立時才執行此分支
        fail(new Error('這筆紀錄已變更，請重新整理後再刪除。')); // 呼叫 fail()，處理 本機訓練紀錄 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      store.delete(id); // 呼叫 store.delete()，處理 本機訓練紀錄 的 delete 邏輯
      done(true); // 呼叫 done()，處理 本機訓練紀錄 的 done 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 remove() 的目前區塊、參數或資料結構
function parseBackup(data) { // 定義 parseBackup()：處理 本機訓練紀錄 的 parseBackup 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !data || // 續接 parseBackup() 的運算、回呼或參數：!data ||
    data.format !== 'gym-training-backup' || // 續接 parseBackup() 的運算、回呼或參數：data.format !== 'gym-training-backup' ||
    data.version !== 1 || // 續接 parseBackup() 的運算、回呼或參數：data.version !== 1 ||
    !Array.isArray(data.records) || // 續接 parseBackup() 的運算、回呼或參數：!Array.isArray(data.records) ||
    data.records.length > MAX_RECORDS // 續接 parseBackup() 的運算、回呼或參數：data.records.length > MAX_RECORDS
  ) // 結束 parseBackup() 的目前區塊、參數或資料結構
    throw new Error('請選擇本系統匯出的有效 JSON 備份（版本 1）。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  const records = data.records.map(validate); // 宣告不可重新指定的 紀錄清單，供parseBackup()使用
  if (new Set(records.map((r) => r.id)).size !== records.length) // 檢查 (new Set(records.map((r) => r.id)).size !== records.length)；成立時才執行此分支
    throw new Error('備份內有重複編號，未匯入。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  return records; // 回傳 records，交給 parseBackup() 的呼叫端
} // 結束 parseBackup() 的目前區塊、參數或資料結構
function merge(records) { // 定義 merge()：處理 本機訓練紀錄 的 merge 邏輯
  const clean = records.map(validate); // 宣告不可重新指定的 clean，供merge()使用
  return transaction('readwrite', (store, done, fail) => { // 回傳 transaction('readwrite', (store, done, fail) => {，交給 事件回呼() 的呼叫端
    store.getAllKeys().onsuccess = (event) => { // 呼叫 store.getAllKeys()，處理 本機訓練紀錄 的 getAllKeys 邏輯
      const keys = new Set(event.target.result); // 宣告不可重新指定的 keys，供事件回呼()使用
      const added = clean.filter((r) => !keys.has(r.id)); // 宣告不可重新指定的 added，供事件回呼()使用
      if (keys.size + added.length > MAX_RECORDS) { // 檢查 (keys.size + added.length > MAX_RECORDS)；成立時才執行此分支
        fail(new Error('合併後超過 10,000 筆上限，未匯入。')); // 呼叫 fail()，處理 本機訓練紀錄 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      added.forEach((r) => store.add(r)); // 呼叫 added.forEach()，處理 本機訓練紀錄 的 forEach 邏輯
      done({ added: added.length, skipped: clean.length - added.length }); // 呼叫 done()，處理 本機訓練紀錄 的 done 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 merge() 的目前區塊、參數或資料結構
export const TrainingStore = { all, save, remove, parseBackup, merge, validate, validDate }; // 宣告不可重新指定的 TrainingStore，供本機訓練紀錄使用
