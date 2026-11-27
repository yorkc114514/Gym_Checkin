import { mount } from '../features/history/controller.js'; // 從 ../features/history/controller.js 載入相依介面，供按日期查詢簽到紀錄使用
import { startRestTimer } from '../features/rest-timer/index.js'; // 從 ../features/rest-timer/index.js 載入相依介面，供按日期查詢簽到紀錄使用
import { renderMini } from '../features/rest-timer/index.js'; // 從 ../features/rest-timer/index.js 載入相依介面，供按日期查詢簽到紀錄使用
import { setMessage } from '../shared/ui/messages.js'; // 從 ../shared/ui/messages.js 載入相依介面，供按日期查詢簽到紀錄使用
import { loadDatePicker } from '../core/vendor-loader.js'; // 從 ../core/vendor-loader.js 載入相依介面，供按日期查詢簽到紀錄使用
startRestTimer(renderMini); // 呼叫 startRestTimer()，處理 按日期查詢簽到紀錄 的 startRestTimer 邏輯
loadDatePicker() // 呼叫 loadDatePicker()，處理 按日期查詢簽到紀錄 的 loadDatePicker 邏輯
  .then(() => mount()) // 呼叫 .then()，處理 按日期查詢簽到紀錄 的 then 邏輯
  .then(() => { // 呼叫 .then()，處理 按日期查詢簽到紀錄 的 then 邏輯
    document.body.dataset.pageReady = 'true'; // 續接 事件回呼() 的運算、回呼或參數：document.body.dataset.pageReady = 'true';
  }) // 結束 事件回呼() 的目前區塊、參數或資料結構
  .catch((error) => { // 呼叫 .catch()，處理 按日期查詢簽到紀錄 的 catch 邏輯
    document.body.dataset.pageReady = 'error'; // 續接 事件回呼() 的運算、回呼或參數：document.body.dataset.pageReady = 'error';
    console.error(error); // 把偵錯或測試資訊寫到開發者主控台
    setMessage('頁面載入失敗：' + error.message, 'error'); // 呼叫 setMessage()，處理 按日期查詢簽到紀錄 的 setMessage 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
