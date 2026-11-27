import { hideMessage as appHideMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供訓練進步圖表使用
import { mountShell as appMountShell } from '../../shared/ui/shell.js'; // 從 ../../shared/ui/shell.js 載入相依介面，供訓練進步圖表使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供訓練進步圖表使用
import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供訓練進步圖表使用
import { TrainingStore } from '../training/index.js'; // 從 ../training/index.js 載入相依介面，供訓練進步圖表使用
import { LocalCharts } from '../../shared/ui/line-chart.js'; // 從 ../../shared/ui/line-chart.js 載入相依介面，供訓練進步圖表使用
import { ProgressMetrics } from './metrics.js'; // 從 ./metrics.js 載入相依介面，供訓練進步圖表使用
const $ = (id) => document.getElementById(id), // 依元素 ID 或 CSS 選擇器取得頁面控制項
  el = (tag, text, cls) => { // 更新 el，保存本步處理結果
    const e = document.createElement(tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
    if (text !== undefined) e.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    if (cls) e.className = cls; // 檢查 (cls) e.className = cls;；成立時才執行此分支
    return e; // 回傳 e，交給 el() 的呼叫端
  }; // 結束 el() 的目前區塊、參數或資料結構
const notice = (s, error = false) => appSetMessage(s, error ? 'error' : 'success'); // 宣告不可重新指定的 notice，供notice()使用

export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  appMountShell(); // 呼叫 appMountShell()，處理 訓練進步圖表 的 appMountShell 邏輯
  let records = []; // 宣告可更新的 紀錄清單，供mount()使用
  function draw() { // 定義 draw()：處理 訓練進步圖表 的 draw 邏輯
    const name = $('progress-exercise').value, // 宣告不可重新指定的 name，供draw()使用
      days = ProgressMetrics.progress(records, name); // 更新 days，保存本步處理結果
    $('progress-count').textContent = days.length // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      ? `${name} · 最近 ${days.length} 個訓練日（${days[0].date} ～ ${days.at(-1).date}）` // 續接 draw() 的運算、回呼或參數：? `${name} · 最近 ${days.length} 個訓練日（${days[0].date} ～ ${days.at(-1).date}）`
      : '先在訓練助手記錄動作'; // 續接 draw() 的運算、回呼或參數：: '先在訓練助手記錄動作';
    LocalCharts.render( // 呼叫 LocalCharts.render()，依目前狀態重繪畫面
      $('max-chart'), // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
      days.map((d) => ({ date: d.date, value: d.max })), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      { title: '每日最大重量', categorical: true }, // 續接 draw() 的運算、回呼或參數：{ title: '每日最大重量', categorical: true },
    ); // 結束 draw() 的目前區塊、參數或資料結構
    LocalCharts.render( // 呼叫 LocalCharts.render()，依目前狀態重繪畫面
      $('volume-chart'), // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
      days.map((d) => ({ date: d.date, value: d.volume })), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      { title: '每日總訓練量', color: '#fbbf24', categorical: true }, // 續接 draw() 的運算、回呼或參數：{ title: '每日總訓練量', color: '#fbbf24', categorical: true },
    ); // 結束 draw() 的目前區塊、參數或資料結構
  } // 結束 draw() 的目前區塊、參數或資料結構
  async function load() { // 定義 load()：處理 訓練進步圖表 的 load 邏輯
    $('progress-refresh').disabled = true; // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
    try { // 開始可捕捉例外的操作範圍
      const previous = $('progress-exercise').value; // 宣告不可重新指定的 previous，供load()使用
      records = await TrainingStore.all(); // 更新 紀錄清單，保存本步處理結果
      const names = new Map(); // 宣告不可重新指定的 names，供load()使用
      records // 續接 load() 的運算、回呼或參數：records
        .filter((r) => r.date <= appTaipeiDateString()) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
        .forEach((r) => names.set(ProgressMetrics.normalized(r.exercise), r.exercise.trim())); // 呼叫 .forEach()，處理 訓練進步圖表 的 forEach 邏輯
      $('progress-exercise').replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      [...names.values()] // 續接 load() 的運算、回呼或參數：[...names.values()]
        .sort((a, b) => a.localeCompare(b, 'zh-TW')) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
        .forEach((name) => { // 呼叫 .forEach()，處理 訓練進步圖表 的 forEach 邏輯
          const o = el('option', name); // 宣告不可重新指定的 o，供事件回呼()使用
          o.value = name; // 續接 事件回呼() 的運算、回呼或參數：o.value = name;
          $('progress-exercise').append(o); // 將建立的節點加入父容器，形成畫面內容
        }); // 結束 事件回呼() 的目前區塊、參數或資料結構
      if ([...names.values()].includes(previous)) $('progress-exercise').value = previous; // 檢查 ([...names.values()].includes(previous)) $('progress-exercise').value = previous;；成立時才執行此分支
      $('progress-exercise').disabled = !names.size; // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
      draw(); // 呼叫 draw()，處理 訓練進步圖表 的 draw 邏輯
      appHideMessage(); // 呼叫 appHideMessage()，處理 訓練進步圖表 的 appHideMessage 邏輯
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      $('max-chart').replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      $('volume-chart').replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      notice('無法讀取訓練紀錄：' + e.message, true); // 呼叫 notice()，處理 訓練進步圖表 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      $('progress-refresh').disabled = false; // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
    } // 結束 load() 的目前區塊、參數或資料結構
  } // 結束 load() 的目前區塊、參數或資料結構
  $('progress-exercise').onchange = draw; // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
  $('progress-refresh').onclick = load; // 呼叫 $()，處理 訓練進步圖表 的 $ 邏輯
  load(); // 呼叫 load()，處理 訓練進步圖表 的 load 邏輯
} // 結束 mount() 的目前區塊、參數或資料結構
