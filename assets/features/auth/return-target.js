import { RETURN_TO_KEY } from '../../core/config.js'; // 從 ../../core/config.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
export function pageFileName() { // 定義 pageFileName()：處理 Google 登入、登入狀態與姓名確認 的 pageFileName 邏輯
  const name = window.location.pathname.split('/').pop(); // 宣告不可重新指定的 name，供pageFileName()使用
  return name || 'index.html'; // 回傳 name || 'index.html'，交給 pageFileName() 的呼叫端
} // 結束 pageFileName() 的目前區塊、參數或資料結構

export function safeReturnTarget(value) { // 定義 safeReturnTarget()：處理 Google 登入、登入狀態與姓名確認 的 safeReturnTarget 邏輯
  return typeof value === 'string' && /^[a-z-]+\.html(?:\?[^#]*)?$/.test(value) ? value : null; // 建立測試案例，將下方操作與預期結果放在同一測試範圍
} // 結束 safeReturnTarget() 的目前區塊、參數或資料結構

export function rememberCurrentPage() { // 定義 rememberCurrentPage()：處理 Google 登入、登入狀態與姓名確認 的 rememberCurrentPage 邏輯
  const file = pageFileName(); // 宣告不可重新指定的 file，供rememberCurrentPage()使用
  if (file === 'index.html') return; // 檢查 (file === 'index.html') return;；成立時才執行此分支
  const target = `${file}${window.location.search}`; // 宣告不可重新指定的 target，供rememberCurrentPage()使用
  if (safeReturnTarget(target)) sessionStorage.setItem(RETURN_TO_KEY, target); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
} // 結束 rememberCurrentPage() 的目前區塊、參數或資料結構

export function consumeReturnTarget() { // 定義 consumeReturnTarget()：處理 Google 登入、登入狀態與姓名確認 的 consumeReturnTarget 邏輯
  const target = safeReturnTarget(sessionStorage.getItem(RETURN_TO_KEY)); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  sessionStorage.removeItem(RETURN_TO_KEY); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  return target; // 回傳 target，交給 consumeReturnTarget() 的呼叫端
} // 結束 consumeReturnTarget() 的目前區塊、參數或資料結構
