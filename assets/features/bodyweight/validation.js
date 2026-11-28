import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供體重紀錄使用
import { validDate } from '../../shared/validation.js'; // 從 ../../shared/validation.js 載入相依介面，供體重紀錄使用
import { round } from '../../shared/numbers.js'; // 從 ../../shared/numbers.js 載入相依介面，供體重紀錄使用
export function weight(r) { // 定義 weight()：處理 體重紀錄 的 weight 邏輯
  if ( // 檢查 (；成立時才執行此分支
    !r || // 續接 weight() 的運算、回呼或參數：!r ||
    !validDate(r.date) || // 續接 weight() 的運算、回呼或參數：!validDate(r.date) ||
    r.date > appTaipeiDateString() || // 續接 weight() 的運算、回呼或參數：r.date > appTaipeiDateString() ||
    !Number.isFinite(r.kg) || // 續接 weight() 的運算、回呼或參數：!Number.isFinite(r.kg) ||
    r.kg <= 0 || // 續接 weight() 的運算、回呼或參數：r.kg <= 0 ||
    r.kg > 1000 || // 續接 weight() 的運算、回呼或參數：r.kg > 1000 ||
    !Number.isSafeInteger(r.updatedAt) || // 續接 weight() 的運算、回呼或參數：!Number.isSafeInteger(r.updatedAt) ||
    r.updatedAt < 0 // 續接 weight() 的運算、回呼或參數：r.updatedAt < 0
  ) // 結束 weight() 的目前區塊、參數或資料結構
    throw Error('體重格式不正確；日期不可在未來，重量須介於 0 與 1,000 kg 之間。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  const kg = round(r.kg); // 宣告不可重新指定的 kg，供weight()使用
  if (kg <= 0) throw Error('體重至少為 0.01 kg。'); // 檢查 (kg <= 0) throw Error('體重至少為 0.01 kg。');；成立時才執行此分支
  return { date: r.date, kg, updatedAt: r.updatedAt }; // 回傳 { date: r.date, kg, updatedAt: r.updatedAt }，交給 weight() 的呼叫端
} // 結束 weight() 的目前區塊、參數或資料結構
