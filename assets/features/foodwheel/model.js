function uniqueItems(items) { // 定義 uniqueItems()：處理 餐廳分類與美食轉盤 的 uniqueItems 邏輯
  const seen = new Set(); // 宣告不可重新指定的 seen，供uniqueItems()使用
  return items // 回傳 items，交給 uniqueItems() 的呼叫端
    .map((item) => String(item || '').trim()) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    .filter((item) => { // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      if (!item || seen.has(item)) return false; // 檢查 (!item || seen.has(item)) return false;；成立時才執行此分支
      seen.add(item); // 呼叫 seen.add()，處理 餐廳分類與美食轉盤 的 add 邏輯
      return true; // 回傳 true，交給 事件回呼() 的呼叫端
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 uniqueItems() 的目前區塊、參數或資料結構

function parseCustomItems(value) { // 定義 parseCustomItems()：處理 餐廳分類與美食轉盤 的 parseCustomItems 邏輯
  return uniqueItems(String(value || '').split(/[\n,，;；]+/)); // 回傳 uniqueItems(String(value || '').split(/[\n,，;；]+/))，交給 parseCustomItems() 的呼叫端
} // 結束 parseCustomItems() 的目前區塊、參數或資料結構

function secureRandomIndex(max) { // 定義 secureRandomIndex()：處理 餐廳分類與美食轉盤 的 secureRandomIndex 邏輯
  if (max <= 1) return 0; // 檢查 (max <= 1) return 0;；成立時才執行此分支
  if (window.crypto?.getRandomValues) { // 檢查 (window.crypto?.getRandomValues)；成立時才執行此分支
    const buffer = new Uint32Array(1); // 宣告不可重新指定的 buffer，供secureRandomIndex()使用
    const limit = Math.floor(0x100000000 / max) * max; // 宣告不可重新指定的 顯示筆數上限，供secureRandomIndex()使用
    do { // 續接 secureRandomIndex() 的運算、回呼或參數：do {
      window.crypto.getRandomValues(buffer); // 產生密碼學安全亂數，供現場 Token 使用
    } while (buffer[0] >= limit); // 續接 secureRandomIndex() 的運算、回呼或參數：} while (buffer[0] >= limit);
    return buffer[0] % max; // 回傳 buffer[0] % max，交給 secureRandomIndex() 的呼叫端
  } // 結束 secureRandomIndex() 的目前區塊、參數或資料結構
  return Math.floor(Math.random() * max); // 回傳 Math.floor(Math.random() * max)，交給 secureRandomIndex() 的呼叫端
} // 結束 secureRandomIndex() 的目前區塊、參數或資料結構
export { uniqueItems, parseCustomItems, secureRandomIndex }; // 匯出本模組的公開介面，供其他頁面引用
