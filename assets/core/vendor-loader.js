const pending = new Map(); // 宣告不可重新指定的 pending，供共用連線與本機資料儲存使用
export function loadScript(url, ready) { // 定義 loadScript()：處理 共用連線與本機資料儲存 的 loadScript 邏輯
  if (ready()) return Promise.resolve(); // 檢查 (ready()) return Promise.resolve();；成立時才執行此分支
  if (!pending.has(url)) // 檢查 (!pending.has(url))；成立時才執行此分支
    pending.set( // 呼叫 pending.set()，處理 共用連線與本機資料儲存 的 set 邏輯
      url, // 續接 loadScript() 的運算、回呼或參數：url,
      new Promise((resolve, reject) => { // 續接 事件回呼() 的運算、回呼或參數：new Promise((resolve, reject) => {
        const script = document.createElement('script'); // 建立 script DOM 元素，供後續填值與插入
        script.src = url; // 續接 事件回呼() 的運算、回呼或參數：script.src = url;
        script.onload = () => (ready() ? resolve() : reject(new Error('外部程式庫未能初始化'))); // 續接 事件回呼() 的運算、回呼或參數：script.onload = () => (ready() ? resolve() : reject(new Error('外部程式庫未能初始化'))…
        script.onerror = () => { // 續接 事件回呼() 的運算、回呼或參數：script.onerror = () => {
          script.remove(); // 呼叫 script.remove()，處理 共用連線與本機資料儲存 的 remove 邏輯
          reject(new Error('外部程式庫載入失敗')); // 呼叫 reject()，處理 共用連線與本機資料儲存 的 reject 邏輯
        }; // 結束 事件回呼() 的目前區塊、參數或資料結構
        document.head.append(script); // 將建立的節點加入父容器，形成畫面內容
      }).catch((e) => { // 續接 事件回呼() 的運算、回呼或參數：}).catch((e) => {
        pending.delete(url); // 呼叫 pending.delete()，處理 共用連線與本機資料儲存 的 delete 邏輯
        throw e; // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      }), // 結束 事件回呼() 的目前區塊、參數或資料結構
    ); // 結束 loadScript() 的目前區塊、參數或資料結構
  return pending.get(url); // 回傳 pending.get(url)，交給 loadScript() 的呼叫端
} // 結束 loadScript() 的目前區塊、參數或資料結構
export async function loadDatePicker() { // 定義 loadDatePicker()：處理 共用連線與本機資料儲存 的 loadDatePicker 邏輯
  try { // 開始可捕捉例外的操作範圍
    await loadScript( // 等待非同步操作完成後，才繼續同一流程
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js', // 提供 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js', 文字、路徑或資料欄位值
      () => typeof window.flatpickr === 'function', // 續接 事件回呼() 的運算、回呼或參數：() => typeof window.flatpickr === 'function',
    ); // 結束 loadDatePicker() 的目前區塊、參數或資料結構
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    /* Native date input remains available. */
  } // 結束 loadDatePicker() 的目前區塊、參數或資料結構
} // 結束 loadDatePicker() 的目前區塊、參數或資料結構
