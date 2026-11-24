export function setMessage(text, type = '') { // 定義 setMessage()：處理 共用日期、表單與介面 的 setMessage 邏輯
  const element = document.getElementById('message'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  if (!element) return; // 檢查 (!element) return;；成立時才執行此分支
  element.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  element.className = `message${type ? ` ${type}` : ''}`; // 續接 setMessage() 的運算、回呼或參數：element.className = `message${type ? ` ${type}` : ''}`;
  element.classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
} // 結束 setMessage() 的目前區塊、參數或資料結構

export function hideMessage() { // 定義 hideMessage()：處理 共用日期、表單與介面 的 hideMessage 邏輯
  document.getElementById('message')?.classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
} // 結束 hideMessage() 的目前區塊、參數或資料結構
