import { tx } from '../../core/fitness-db.js'; // 從 ../../core/fitness-db.js 載入相依介面，供體重紀錄使用
import { mergeRecords } from '../../core/merge-backup.js'; // 從 ../../core/merge-backup.js 載入相依介面，供體重紀錄使用
import { weight } from './validation.js'; // 從 ./validation.js 載入相依介面，供體重紀錄使用
const weights = () => // 宣告不可重新指定的 weights，供weights()使用
  tx('weights', 'readonly', (s, done) => { // 呼叫 tx()，處理 體重紀錄 的 tx 邏輯
    s.getAll().onsuccess = (e) => done(e.target.result); // 呼叫 s.getAll()，處理 體重紀錄 的 getAll 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
function saveWeight(r, expected = null) { // 定義 saveWeight()：處理 體重紀錄 的 saveWeight 邏輯
  const clean = weight(r); // 宣告不可重新指定的 clean，供saveWeight()使用
  return tx('weights', 'readwrite', (s, done, fail) => { // 回傳 tx('weights', 'readwrite', (s, done, fail) => {，交給 事件回呼() 的呼叫端
    s.get(clean.date).onsuccess = (e) => { // 呼叫 s.get()，處理 體重紀錄 的 get 邏輯
      const old = e.target.result; // 宣告不可重新指定的 old，供事件回呼()使用
      if ((expected === null && old) || (expected !== null && old?.updatedAt !== expected)) { // 檢查 ((expected === null && old) || (expected !== null && old?.updatedAt !== expected))；成立時才執行此分支
        fail(Error('此日期已在另一分頁變更，請重新讀取再修改。')); // 呼叫 fail()，處理 體重紀錄 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      s.count().onsuccess = (e) => { // 呼叫 s.count()，處理 體重紀錄 的 count 邏輯
        if (!old && e.target.result >= 10000) { // 檢查 (!old && e.target.result >= 10000)；成立時才執行此分支
          fail(Error('已達 10,000 筆，請先備份並整理。')); // 呼叫 fail()，處理 體重紀錄 的 fail 邏輯
          return; // 提前結束 事件回呼()，不再執行後續操作
        } // 結束 事件回呼() 的目前區塊、參數或資料結構
        s.put(clean); // 呼叫 s.put()，處理 體重紀錄 的 put 邏輯
        done(clean); // 呼叫 done()，處理 體重紀錄 的 done 邏輯
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 saveWeight() 的目前區塊、參數或資料結構
function removeWeight(date, expected) { // 定義 removeWeight()：處理 體重紀錄 的 removeWeight 邏輯
  return tx('weights', 'readwrite', (s, done, fail) => { // 回傳 tx('weights', 'readwrite', (s, done, fail) => {，交給 事件回呼() 的呼叫端
    s.get(date).onsuccess = (e) => { // 呼叫 s.get()，處理 體重紀錄 的 get 邏輯
      if (e.target.result?.updatedAt !== expected) { // 檢查 (e.target.result?.updatedAt !== expected)；成立時才執行此分支
        fail(Error('紀錄已變更，請重新讀取。')); // 呼叫 fail()，處理 體重紀錄 的 fail 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      s.delete(date); // 呼叫 s.delete()，處理 體重紀錄 的 delete 邏輯
      done(true); // 呼叫 done()，處理 體重紀錄 的 done 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 removeWeight() 的目前區塊、參數或資料結構

function merge(data) { // 定義 merge()：處理 體重紀錄 的 merge 邏輯
  return mergeRecords({ // 回傳 mergeRecords({，交給 merge() 的呼叫端
    data, // 續接 merge() 的運算、回呼或參數：data,
    table: 'weights', // 設定 table 欄位的值或型別
    format: 'gym-bodyweight-backup', // 設定 format 欄位的值或型別
    validate: weight, // 設定 validate 欄位的值或型別
    key: (r) => r.date, // 設定 key 欄位的值或型別
    max: 10000, // 設定 max 欄位的值或型別
  }); // 結束 merge() 的目前區塊、參數或資料結構
} // 結束 merge() 的目前區塊、參數或資料結構
export const BodyweightStore = { weights, saveWeight, removeWeight, merge }; // 宣告不可重新指定的 BodyweightStore，供體重紀錄使用
