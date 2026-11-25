import { pathToFileURL } from 'node:url'; // 從 node:url 載入相依介面，供簽到網站共用流程使用
import assert from 'node:assert/strict'; // 從 node:assert/strict 載入相依介面，供簽到網站共用流程使用
import fs from 'node:fs/promises'; // 從 node:fs/promises 載入相依介面，供簽到網站共用流程使用
const { JSDOM } = await import( // 續接 簽到網站共用流程 的運算、回呼或參數：const { JSDOM } = await import(
  process.env.QA_NODE_MODULES // 續接 簽到網站共用流程 的運算、回呼或參數：process.env.QA_NODE_MODULES
    ? pathToFileURL(process.env.QA_NODE_MODULES + '/jsdom/lib/api.js') // 續接 簽到網站共用流程 的運算、回呼或參數：? pathToFileURL(process.env.QA_NODE_MODULES + '/jsdom/lib/api.js')
    : 'jsdom' // 續接 簽到網站共用流程 的運算、回呼或參數：: 'jsdom'
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
const dom = new JSDOM(await fs.readFile(new URL('../environment.html', import.meta.url), 'utf8'), { // 宣告不可重新指定的 dom，供簽到網站共用流程使用
  url: 'https://example.test/environment.html', // 設定 url 欄位的值或型別
  pretendToBeVisual: true, // 設定 pretendToBeVisual 欄位的值或型別
}); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
Object.assign(globalThis, { // 呼叫 Object.assign()，處理 簽到網站共用流程 的 assign 邏輯
  window: dom.window, // 設定 window 欄位的值或型別
  document: dom.window.document, // 設定 document 欄位的值或型別
  localStorage: dom.window.localStorage, // 設定 localStorage 欄位的值或型別
  sessionStorage: dom.window.sessionStorage, // 設定 sessionStorage 欄位的值或型別
}); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
const timers = new Map(); // 宣告不可重新指定的 timers，供簽到網站共用流程使用
let timerId = 0; // 宣告可更新的 timerId，供簽到網站共用流程使用
const oldInterval = globalThis.setInterval, // 宣告不可重新指定的 oldInterval，供簽到網站共用流程使用
  oldClear = globalThis.clearInterval; // 更新 oldClear，保存本步處理結果
globalThis.setInterval = (fn, ms) => { // 續接 事件回呼() 的運算、回呼或參數：globalThis.setInterval = (fn, ms) => {
  timers.set(++timerId, { fn, ms }); // 呼叫 timers.set()，處理 簽到網站共用流程 的 set 邏輯
  return timerId; // 回傳 timerId，交給 事件回呼() 的呼叫端
}; // 結束 事件回呼() 的目前區塊、參數或資料結構
globalThis.clearInterval = (id) => timers.delete(id); // 續接 事件回呼() 的運算、回呼或參數：globalThis.clearInterval = (id) => timers.delete(id);
let error = null, // 宣告可更新的 錯誤資訊，供簽到網站共用流程使用
  fetches = 0, // 更新 fetches，保存本步處理結果
  pending = null, // 更新 pending，保存本步處理結果
  rows = []; // 更新 顯示用資料列，保存本步處理結果
window.supabase = { // 續接 簽到網站共用流程 的運算、回呼或參數：window.supabase = {
  createClient: () => ({ // 設定 createClient 欄位的值或型別
    auth: { // 設定 auth 欄位的值或型別
      getSession: async () => ({ // 設定 getSession 欄位的值或型別
        data: { session: { user: { id: 'user', user_metadata: {} } } }, // 設定 查詢或回應資料 欄位的值或型別
        error: null, // 設定 錯誤資訊 欄位的值或型別
      }), // 結束 getSession() 的目前區塊、參數或資料結構
      onAuthStateChange: () => ({ data: { subscription: {} } }), // 設定 onAuthStateChange 欄位的值或型別
    }, // 結束 createClient() 的目前區塊、參數或資料結構
    from: (table) => ({ // 設定 from 欄位的值或型別
      select() { // 呼叫 select()，處理 簽到網站共用流程 的 select 邏輯
        return this; // 回傳 this，交給 select() 的呼叫端
      }, // 結束 select() 的目前區塊、參數或資料結構
      eq() { // 呼叫 eq()，處理 簽到網站共用流程 的 eq 邏輯
        return this; // 回傳 this，交給 eq() 的呼叫端
      }, // 結束 eq() 的目前區塊、參數或資料結構
      order() { // 呼叫 order()，處理 簽到網站共用流程 的 order 邏輯
        return this; // 回傳 this，交給 order() 的呼叫端
      }, // 結束 order() 的目前區塊、參數或資料結構
      single: async () => ({ // 設定 single 欄位的值或型別
        data: { // 設定 查詢或回應資料 欄位的值或型別
          display_name: 'Tester', // 設定 顯示名稱 欄位的值或型別
          name_confirmed: true, // 設定 name_confirmed 欄位的值或型別
          status: 'active', // 設定 status 欄位的值或型別
          app_role: 'member', // 設定 app_role 欄位的值或型別
        }, // 結束 single() 的目前區塊、參數或資料結構
        error: null, // 設定 錯誤資訊 欄位的值或型別
      }), // 結束 single() 的目前區塊、參數或資料結構
      async abortSignal() { // 續接 abortSignal() 的運算、回呼或參數：async abortSignal() {
        assert.equal(table, 'environment_latest'); // 測試斷言：檢查 assert.equal(table, 'environment_latest'); 所要求的行為
        fetches++; // 續接 abortSignal() 的運算、回呼或參數：fetches++;
        if (pending) await pending; // 檢查 (pending) await pending;；成立時才執行此分支
        return { data: rows, error }; // 回傳 { data: rows, error }，交給 abortSignal() 的呼叫端
      }, // 結束 abortSignal() 的目前區塊、參數或資料結構
    }), // 結束 from() 的目前區塊、參數或資料結構
  }), // 結束 createClient() 的目前區塊、參數或資料結構
}; // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
const { mount } = await import('../assets/features/environment/controller.js'); // 續接 簽到網站共用流程 的運算、回呼或參數：const { mount } = await import('../assets/features/environment/controller.js…
const el = (id) => document.getElementById('environment-' + id); // 依元素 ID 或 CSS 選擇器取得頁面控制項
const settle = () => new Promise((resolve) => setTimeout(resolve, 0)); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
const row = { // 宣告不可重新指定的 目前資料列，供簽到網站共用流程使用
  device_id: 'a', // 設定 裝置資料列識別碼 欄位的值或型別
  display_name: 'Room A', // 設定 顯示名稱 欄位的值或型別
  temperature_c: 19.5, // 設定 攝氏溫度 欄位的值或型別
  humidity_pct: 48.7, // 設定 相對濕度百分比 欄位的值或型別
  illuminance_lux: 160.9, // 設定 照度 lx 欄位的值或型別
  light_status: 'ok', // 設定 光感測器狀態 欄位的值或型別
  wifi_rssi: -53, // 設定 Wi-Fi 訊號強度 欄位的值或型別
  sampled_at: new Date().toISOString(), // 設定 估算感測時間 欄位的值或型別
  received_at: new Date().toISOString(), // 設定 伺服器接收時間 欄位的值或型別
}; // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
await mount(); // 等待非同步操作完成後，才繼續同一流程
assert(!el('empty').classList.contains('hidden')); // 測試斷言：檢查 assert(!el('empty').classList.contains('hidden')); 所要求的行為
assert(el('content').classList.contains('hidden')); // 測試斷言：檢查 assert(el('content').classList.contains('hidden')); 所要求的行為
assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
  document.querySelector('[data-nav-key="environment"]').getAttribute('aria-current'), // 依元素 ID 或 CSS 選擇器取得頁面控制項
  'page', // 提供 'page', 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
rows = [row]; // 更新 顯示用資料列，保存本步處理結果
el('refresh').click(); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
assert.equal(el('temperature').textContent, '19.5'); // 測試斷言：檢查 assert.equal(el('temperature').textContent, '19.5'); 所要求的行為
assert.equal(el('status').dataset.state, 'fresh'); // 測試斷言：檢查 assert.equal(el('status').dataset.state, 'fresh'); 所要求的行為
error = { message: 'simulated disconnect' }; // 更新 錯誤資訊，保存本步處理結果
el('refresh').click(); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
assert.equal(el('status').dataset.state, 'error'); // 測試斷言：檢查 assert.equal(el('status').dataset.state, 'error'); 所要求的行為
assert.equal(el('temperature').textContent, '19.5'); // 測試斷言：檢查 assert.equal(el('temperature').textContent, '19.5'); 所要求的行為
assert.match(el('freshness-note').textContent, /上次讀取結果/); // 測試斷言：檢查 assert.match(el('freshness-note').textContent, /上次讀取結果/); 所要求的行為
error = null; // 更新 錯誤資訊，保存本步處理結果
rows = [{ ...row, temperature_c: null, illuminance_lux: null, light_status: 'error' }]; // 更新 顯示用資料列，保存本步處理結果
el('refresh').click(); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
assert.equal(el('temperature').textContent, '—'); // 測試斷言：檢查 assert.equal(el('temperature').textContent, '—'); 所要求的行為
assert.equal(el('light').textContent, '—'); // 測試斷言：檢查 assert.equal(el('light').textContent, '—'); 所要求的行為
assert.equal(el('status').dataset.state, 'partial'); // 測試斷言：檢查 assert.equal(el('status').dataset.state, 'partial'); 所要求的行為
rows = [ // 更新 顯示用資料列，保存本步處理結果
  row, // 續接 簽到網站共用流程 的運算、回呼或參數：row,
  { ...row, device_id: 'b', display_name: '<img src=x onerror=alert(1)>', illuminance_lux: 0 }, // 續接 簽到網站共用流程 的運算、回呼或參數：{ ...row, device_id: 'b', display_name: '<img src=x onerror=alert(1)>', illu…
]; // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
el('refresh').click(); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
assert(!el('device-control').classList.contains('hidden')); // 測試斷言：檢查 assert(!el('device-control').classList.contains('hidden')); 所要求的行為
el('device').value = 'b'; // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
el('device').dispatchEvent(new window.Event('change')); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
assert.equal(el('light').textContent, '0.0'); // 測試斷言：檢查 assert.equal(el('light').textContent, '0.0'); 所要求的行為
assert.equal(el('device-name').querySelector('img'), null); // 測試斷言：檢查 assert.equal(el('device-name').querySelector('img'), null); 所要求的行為
el('refresh').click(); // 呼叫 el()，處理 簽到網站共用流程 的 el 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
assert.equal(el('device').value, 'b'); // 測試斷言：檢查 assert.equal(el('device').value, 'b'); 所要求的行為
let release; // 宣告可更新的 release，供簽到網站共用流程使用
pending = new Promise((resolve) => { // 更新 pending，保存本步處理結果
  release = resolve; // 更新 release，保存本步處理結果
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
const before = fetches; // 宣告不可重新指定的 before，供簽到網站共用流程使用
const poll = [...timers.values()].find((t) => t.ms === 60000); // 宣告不可重新指定的 定時查詢控制代碼，供事件回呼()使用
assert(poll); // 測試斷言：檢查 assert(poll); 所要求的行為
poll.fn(); // 呼叫 poll.fn()，處理 簽到網站共用流程 的 fn 邏輯
poll.fn(); // 呼叫 poll.fn()，處理 簽到網站共用流程 的 fn 邏輯
assert.equal(fetches, before + 1); // 測試斷言：檢查 assert.equal(fetches, before + 1); 所要求的行為
assert(el('refresh').disabled); // 測試斷言：檢查 assert(el('refresh').disabled); 所要求的行為
release(); // 呼叫 release()，處理 簽到網站共用流程 的 release 邏輯
await settle(); // 等待非同步操作完成後，才繼續同一流程
pending = null; // 更新 pending，保存本步處理結果
assert(!el('refresh').disabled); // 測試斷言：檢查 assert(!el('refresh').disabled); 所要求的行為
window.dispatchEvent(new window.Event('pagehide')); // 呼叫 window.dispatchEvent()，處理 簽到網站共用流程 的 dispatchEvent 邏輯
assert.equal(timers.size, 0); // 測試斷言：檢查 assert.equal(timers.size, 0); 所要求的行為
globalThis.setInterval = oldInterval; // 續接 簽到網站共用流程 的運算、回呼或參數：globalThis.setInterval = oldInterval;
globalThis.clearInterval = oldClear; // 續接 簽到網站共用流程 的運算、回呼或參數：globalThis.clearInterval = oldClear;
dom.window.close(); // 呼叫 dom.window.close()，處理 簽到網站共用流程 的 close 邏輯
console.log( // 把偵錯或測試資訊寫到開發者主控台
  'PASS DOM: sidebar, empty state, values, disconnect, sensor faults, zero light, multiple devices, XSS, 60s polling, overlap prevention', // 提供 'PASS DOM: sidebar, empty state, values, disconnect, sensor faults, zero light, … 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
