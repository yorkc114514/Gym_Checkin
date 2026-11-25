import { init } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供溫度、濕度與照度使用
import { setMessage, hideMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供溫度、濕度與照度使用
import { loadEnvironment } from './repository.js'; // 從 ./repository.js 載入相依介面，供溫度、濕度與照度使用
import { REFRESH_INTERVAL_MS, metric, readingState, ageText } from './model.js'; // 從 ./model.js 載入相依介面，供溫度、濕度與照度使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  if (!(await init())) return; // 檢查 (!(await init())) return;；成立時才執行此分支
  const byId = (id) => document.getElementById(`environment-${id}`); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const refresh = byId('refresh'), // 宣告不可重新指定的 重新整理按鈕，供mount()使用
    select = byId('device'); // 更新 裝置選單，保存本步處理結果
  let rows = [], // 宣告可更新的 顯示用資料列，供mount()使用
    busy = false, // 更新 處理中狀態，保存本步處理結果
    fetchFailed = false, // 更新 查詢失敗狀態，保存本步處理結果
    stopped = false, // 更新 stopped，保存本步處理結果
    abort = null; // 更新 請求取消控制器，保存本步處理結果
  function render() { // 定義 render()：依目前狀態重繪畫面
    const row = rows.find((item) => item.device_id === select.value) || rows[0]; // 宣告不可重新指定的 目前資料列，供事件回呼()使用
    byId('content').classList.toggle('hidden', !row); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    byId('empty').classList.toggle('hidden', !!row || fetchFailed); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    if (!row) return; // 檢查 (!row) return;；成立時才執行此分支
    byId('device-name').textContent = row.display_name; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('temperature').textContent = metric(row.temperature_c); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('humidity').textContent = metric(row.humidity_pct); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('light').textContent = row.light_status === 'ok' ? metric(row.illuminance_lux) : '—'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('temperature-note').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      metric(row.temperature_c) === '—' ? '感測器未回傳有效溫度' : '室內空氣溫度'; // 呼叫 metric()，將有效數字格式化，缺值顯示破折號
    byId('humidity-note').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      metric(row.humidity_pct) === '—' ? '感測器未回傳有效濕度' : '室內相對濕度'; // 呼叫 metric()，將有效數字格式化，缺值顯示破折號
    byId('light-note').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      row.light_status === 'saturated' // 續接 render() 的運算、回呼或參數：row.light_status === 'saturated'
        ? '光線超出目前感測範圍' // 續接 render() 的運算、回呼或參數：? '光線超出目前感測範圍'
        : row.light_status !== 'ok' || metric(row.illuminance_lux) === '—' // 續接 render() 的運算、回呼或參數：: row.light_status !== 'ok' || metric(row.illuminance_lux) === '—'
          ? '感測器未回傳有效照度' // 續接 render() 的運算、回呼或參數：? '感測器未回傳有效照度'
          : '感測器位置的照度'; // 續接 render() 的運算、回呼或參數：: '感測器位置的照度';
    const received = Date.parse(row.received_at); // 宣告不可重新指定的 伺服器接收時間，供render()使用
    byId('received').textContent = Number.isFinite(received) // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      ? new Date(received).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }) // 續接 render() 的運算、回呼或參數：? new Date(received).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour…
      : '時間不明'; // 續接 render() 的運算、回呼或參數：: '時間不明';
    byId('age').textContent = ageText(row.sampled_at); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('rssi').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      typeof row.wifi_rssi === 'number' && Number.isFinite(row.wifi_rssi) // 續接 render() 的運算、回呼或參數：typeof row.wifi_rssi === 'number' && Number.isFinite(row.wifi_rssi)
        ? `${row.wifi_rssi} dBm` // 續接 render() 的運算、回呼或參數：? `${row.wifi_rssi} dBm`
        : '—'; // 續接 render() 的運算、回呼或參數：: '—';
    const state = fetchFailed ? 'error' : readingState(row); // 宣告不可重新指定的 畫面狀態，供render()使用
    const labels = { // 宣告不可重新指定的 labels，供render()使用
      fresh: '持續更新中', // 設定 fresh 欄位的值或型別
      partial: '部分感測異常', // 設定 partial 欄位的值或型別
      stale: '暫未更新', // 設定 stale 欄位的值或型別
      error: '讀取失敗', // 設定 錯誤資訊 欄位的值或型別
    }; // 結束 render() 的目前區塊、參數或資料結構
    byId('status').dataset.state = state; // 呼叫 byId()，處理 溫度、濕度與照度 的 byId 邏輯
    byId('status').textContent = labels[state]; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    byId('freshness-note').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      state === 'stale' // 更新 畫面狀態，保存本步處理結果
        ? '超過 2 分 30 秒沒有新的數據；目前顯示上次結果，請確認裝置電源與網路。' // 續接 render() 的運算、回呼或參數：? '超過 2 分 30 秒沒有新的數據；目前顯示上次結果，請確認裝置電源與網路。'
        : state === 'error' // 續接 render() 的運算、回呼或參數：: state === 'error'
          ? '目前無法確認最新數據；以上保留上次讀取結果，連線恢復後會自動重試。' // 續接 render() 的運算、回呼或參數：? '目前無法確認最新數據；以上保留上次讀取結果，連線恢復後會自動重試。'
          : state === 'partial' // 續接 render() 的運算、回呼或參數：: state === 'partial'
            ? '裝置仍有回傳數據；異常項目顯示「—」，其餘項目可正常查看。' // 續接 render() 的運算、回呼或參數：? '裝置仍有回傳數據；異常項目顯示「—」，其餘項目可正常查看。'
            : '顯示最近一次收到的感測結果。時間以台灣時間顯示。'; // 續接 render() 的運算、回呼或參數：: '顯示最近一次收到的感測結果。時間以台灣時間顯示。';
  } // 結束 render() 的目前區塊、參數或資料結構
  async function reload() { // 定義 reload()：重新查詢資料並更新畫面
    if (busy || stopped) return; // 檢查 (busy || stopped) return;；成立時才執行此分支
    busy = true; // 更新 處理中狀態，保存本步處理結果
    refresh.disabled = true; // 續接 reload() 的運算、回呼或參數：refresh.disabled = true;
    abort = new AbortController(); // 更新 請求取消控制器，保存本步處理結果
    const timeout = setTimeout(() => abort?.abort(), 12_000); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
    try { // 開始可捕捉例外的操作範圍
      const next = await loadEnvironment(abort.signal); // 宣告不可重新指定的 next，供reload()使用
      if (stopped) return; // 檢查 (stopped) return;；成立時才執行此分支
      const selected = select.value; // 宣告不可重新指定的 目前選項，供reload()使用
      rows = next; // 更新 顯示用資料列，保存本步處理結果
      fetchFailed = false; // 更新 查詢失敗狀態，保存本步處理結果
      select.replaceChildren( // 替換容器內的子節點，清除舊畫面再放入新結果
        ...rows.map((row) => { // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
          const option = document.createElement('option'); // 建立 option DOM 元素，供後續填值與插入
          option.value = row.device_id; // 續接 事件回呼() 的運算、回呼或參數：option.value = row.device_id;
          option.textContent = row.display_name; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
          return option; // 回傳 option，交給 事件回呼() 的呼叫端
        }), // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 reload() 的目前區塊、參數或資料結構
      if (rows.some((row) => row.device_id === selected)) select.value = selected; // 檢查 (rows.some((row) => row.device_id === selected)) select.value = selected;；成立時才執行此分支
      byId('device-control').classList.toggle('hidden', rows.length < 2); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      hideMessage(); // 呼叫 hideMessage()，處理 溫度、濕度與照度 的 hideMessage 邏輯
      render(); // 呼叫 render()，依目前狀態重繪畫面
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      if (stopped) return; // 檢查 (stopped) return;；成立時才執行此分支
      console.error('Environment loading failed', error); // 把偵錯或測試資訊寫到開發者主控台
      fetchFailed = true; // 更新 查詢失敗狀態，保存本步處理結果
      setMessage('環境數據讀取失敗，請確認網路或稍後重新整理。', 'error'); // 呼叫 setMessage()，處理 溫度、濕度與照度 的 setMessage 邏輯
      render(); // 呼叫 render()，依目前狀態重繪畫面
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      clearTimeout(timeout); // 清除計時排程，避免離開頁面後仍執行
      abort = null; // 更新 請求取消控制器，保存本步處理結果
      busy = false; // 更新 處理中狀態，保存本步處理結果
      refresh.disabled = false; // 續接 reload() 的運算、回呼或參數：refresh.disabled = false;
    } // 結束 reload() 的目前區塊、參數或資料結構
  } // 結束 reload() 的目前區塊、參數或資料結構
  refresh.addEventListener('click', reload); // 綁定 click 事件，交由回呼處理使用者操作
  select.addEventListener('change', render); // 綁定 change 事件，交由回呼處理使用者操作
  const poll = setInterval(() => { // 註冊重複執行的介面更新排程
    if (!document.hidden) reload(); // 檢查 (!document.hidden) reload();；成立時才執行此分支
  }, REFRESH_INTERVAL_MS); // 續接 事件回呼() 的運算、回呼或參數：}, REFRESH_INTERVAL_MS);
  const clock = setInterval(() => { // 註冊重複執行的介面更新排程
    if (!document.hidden) render(); // 檢查 (!document.hidden) render();；成立時才執行此分支
  }, 1000); // 續接 事件回呼() 的運算、回呼或參數：}, 1000);
  document.addEventListener('visibilitychange', () => { // 綁定 visibilitychange 事件，交由回呼處理使用者操作
    if (!document.hidden) reload(); // 檢查 (!document.hidden) reload();；成立時才執行此分支
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  window.addEventListener('pagehide', () => { // 綁定 pagehide 事件，交由回呼處理使用者操作
    stopped = true; // 更新 stopped，保存本步處理結果
    clearInterval(poll); // 清除計時排程，避免離開頁面後仍執行
    clearInterval(clock); // 清除計時排程，避免離開頁面後仍執行
    abort?.abort(); // 續接 事件回呼() 的運算、回呼或參數：abort?.abort();
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  window.addEventListener('pageshow', (event) => { // 綁定 pageshow 事件，交由回呼處理使用者操作
    if (event.persisted) window.location.reload(); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  await reload(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
