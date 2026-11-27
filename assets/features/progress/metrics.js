import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供訓練進步圖表使用
import { round } from '../../shared/numbers.js'; // 從 ../../shared/numbers.js 載入相依介面，供訓練進步圖表使用
import { normalized, volume } from '../training/index.js'; // 從 ../training/index.js 載入相依介面，供訓練進步圖表使用
function progress(records, exercise, today = appTaipeiDateString()) { // 定義 progress()：處理 訓練進步圖表 的 progress 邏輯
  const days = new Map(); // 宣告不可重新指定的 days，供progress()使用
  records // 續接 progress() 的運算、回呼或參數：records
    .filter((r) => normalized(r.exercise) === normalized(exercise) && r.date <= today) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    .forEach((r) => { // 呼叫 .forEach()，處理 訓練進步圖表 的 forEach 邏輯
      const d = days.get(r.date) || { date: r.date, max: 0, volume: 0 }; // 宣告不可重新指定的 d，供事件回呼()使用
      d.max = Math.max(d.max, r.weight); // 續接 事件回呼() 的運算、回呼或參數：d.max = Math.max(d.max, r.weight);
      d.volume += volume(r); // 續接 事件回呼() 的運算、回呼或參數：d.volume += volume(r);
      days.set(r.date, d); // 呼叫 days.set()，處理 訓練進步圖表 的 set 邏輯
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  return [...days.values()] // 回傳 [...days.values()]，交給 progress() 的呼叫端
    .sort((a, b) => a.date.localeCompare(b.date)) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    .slice(-10) // 呼叫 .slice()，處理 訓練進步圖表 的 slice 邏輯
    .map((d) => ({ ...d, volume: round(d.volume) })); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
} // 結束 progress() 的目前區塊、參數或資料結構

export const ProgressMetrics = { progress, normalized }; // 宣告不可重新指定的 ProgressMetrics，供訓練進步圖表使用
