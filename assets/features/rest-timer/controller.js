import { RestTimer as timer } from './service.js'; // 從 ./service.js 載入相依介面，供組間休息計時器使用
import { setMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供組間休息計時器使用
export function mountTimerControls() { // 定義 mountTimerControls()：處理 組間休息計時器 的 mountTimerControls 邏輯
  const $ = (id) => document.getElementById(id), // 依元素 ID 或 CSS 選擇器取得頁面控制項
    notice = (text, error = false) => setMessage(text, error ? 'error' : 'success'); // 更新 notice，保存本步處理結果
  function renderTimer() { // 定義 renderTimer()：處理 組間休息計時器 的 renderTimer 邏輯
    const t = timer.snapshot(); // 宣告不可重新指定的 t，供renderTimer()使用
    $('rest-clock').textContent = t.formatted; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('rest-status').textContent = { // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      idle: '準備開始', // 設定 idle 欄位的值或型別
      running: '休息中', // 設定 running 欄位的值或型別
      paused: '已暫停', // 設定 paused 欄位的值或型別
      done: '休息結束 ✓', // 設定 done 欄位的值或型別
    }[t.state]; // 續接 renderTimer() 的運算、回呼或參數：}[t.state];
    $('rest-start').textContent = { // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      idle: '開始休息', // 設定 idle 欄位的值或型別
      running: '暫停', // 設定 running 欄位的值或型別
      paused: '繼續倒數', // 設定 paused 欄位的值或型別
      done: '再休息一輪', // 設定 done 欄位的值或型別
    }[t.state]; // 續接 renderTimer() 的運算、回呼或參數：}[t.state];
    $('rest-clock').classList.toggle('rest-done', t.state === 'done'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    $('rest-sound').checked = t.sound; // 呼叫 $()，處理 組間休息計時器 的 $ 邏輯
    $('rest-storage-error').textContent = t.storageError; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    document.querySelectorAll('[data-rest-seconds]').forEach((button) => { // 依元素 ID 或 CSS 選擇器取得頁面控制項
      button.setAttribute( // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
        'aria-pressed', // 提供 'aria-pressed', 文字、路徑或資料欄位值
        String(Number(button.dataset.restSeconds) === t.duration), // 呼叫 String()，處理 組間休息計時器 的 String 邏輯
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 renderTimer() 的目前區塊、參數或資料結構
  function chooseDuration(seconds) { // 定義 chooseDuration()：處理 組間休息計時器 的 chooseDuration 邏輯
    const t = timer.snapshot(); // 宣告不可重新指定的 t，供chooseDuration()使用
    if (['running', 'paused'].includes(t.state) && !confirm('套用新秒數會重設目前倒數，是否繼續？')) // 檢查 (['running', 'paused'].includes(t.state) && !confirm('套用新秒數會重設目前倒數，是否繼續？'))；成立時才執行此分支
      return; // 提前結束 chooseDuration()，不再執行後續操作
    try { // 開始可捕捉例外的操作範圍
      timer.setDuration(seconds); // 呼叫 timer.setDuration()，處理 組間休息計時器 的 setDuration 邏輯
      $('rest-seconds').value = seconds; // 呼叫 $()，處理 組間休息計時器 的 $ 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      notice(error.message, true); // 呼叫 notice()，處理 組間休息計時器 的 notice 邏輯
    } // 結束 chooseDuration() 的目前區塊、參數或資料結構
  } // 結束 chooseDuration() 的目前區塊、參數或資料結構

  $('rest-seconds').value = timer.snapshot().duration; // 呼叫 $()，處理 組間休息計時器 的 $ 邏輯
  document.addEventListener('rest-timer-change', renderTimer); // 綁定 rest-timer-change 事件，交由回呼處理使用者操作
  renderTimer(); // 呼叫 renderTimer()，處理 組間休息計時器 的 renderTimer 邏輯
  document // 續接 mountTimerControls() 的運算、回呼或參數：document
    .querySelectorAll('[data-rest-seconds]') // 依元素 ID 或 CSS 選擇器取得頁面控制項
    .forEach((button) => // 呼叫 .forEach()，處理 組間休息計時器 的 forEach 邏輯
      button.addEventListener('click', () => chooseDuration(Number(button.dataset.restSeconds))), // 綁定 click 事件，交由回呼處理使用者操作
    ); // 結束 mountTimerControls() 的目前區塊、參數或資料結構
  $('rest-apply').addEventListener('click', () => chooseDuration(Number($('rest-seconds').value))); // 綁定 click 事件，交由回呼處理使用者操作
  $('rest-start').addEventListener('click', () => // 綁定 click 事件，交由回呼處理使用者操作
    timer.snapshot().state === 'running' ? timer.pause() : timer.start(), // 呼叫 timer.snapshot()，處理 組間休息計時器 的 snapshot 邏輯
  ); // 結束 mountTimerControls() 的目前區塊、參數或資料結構
  $('rest-add').addEventListener('click', timer.add); // 綁定 click 事件，交由回呼處理使用者操作
  $('rest-reset').addEventListener('click', timer.reset); // 綁定 click 事件，交由回呼處理使用者操作
  $('rest-sound').addEventListener('change', () => timer.sound($('rest-sound').checked)); // 綁定 change 事件，交由回呼處理使用者操作
} // 結束 mountTimerControls() 的目前區塊、參數或資料結構
