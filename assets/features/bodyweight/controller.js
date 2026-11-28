import { hideMessage as appHideMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供體重紀錄使用
import { mountShell as appMountShell } from '../../shared/ui/shell.js'; // 從 ../../shared/ui/shell.js 載入相依介面，供體重紀錄使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供體重紀錄使用
import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供體重紀錄使用
import { LocalCharts } from '../../shared/ui/line-chart.js'; // 從 ../../shared/ui/line-chart.js 載入相依介面，供體重紀錄使用
import { FitnessFiles } from '../../shared/files.js'; // 從 ../../shared/files.js 載入相依介面，供體重紀錄使用
import { BodyweightStore } from './repository.js'; // 從 ./repository.js 載入相依介面，供體重紀錄使用
import { validDate } from '../../shared/validation.js'; // 從 ../../shared/validation.js 載入相依介面，供體重紀錄使用
const $ = (id) => document.getElementById(id), // 依元素 ID 或 CSS 選擇器取得頁面控制項
  el = (tag, text, cls) => { // 更新 el，保存本步處理結果
    const e = document.createElement(tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
    if (text !== undefined) e.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    if (cls) e.className = cls; // 檢查 (cls) e.className = cls;；成立時才執行此分支
    return e; // 回傳 e，交給 el() 的呼叫端
  }; // 結束 el() 的目前區塊、參數或資料結構
const notice = (s, error = false) => appSetMessage(s, error ? 'error' : 'success'); // 宣告不可重新指定的 notice，供notice()使用

export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  appMountShell(); // 呼叫 appMountShell()，處理 體重紀錄 的 appMountShell 邏輯
  let rows = [], // 宣告可更新的 顯示用資料列，供mount()使用
    busy = false, // 更新 處理中狀態，保存本步處理結果
    editing = null, // 更新 目前編輯的紀錄，保存本步處理結果
    limit = 30; // 更新 顯示筆數上限，保存本步處理結果
  const today = appTaipeiDateString(), // 宣告不可重新指定的 今天日期，供mount()使用
    start = new Date(today + 'T00:00:00Z'); // 更新 start，保存本步處理結果
  start.setUTCDate(start.getUTCDate() - 6); // 呼叫 start.setUTCDate()，處理 體重紀錄 的 setUTCDate 邏輯
  $('weight-date').value = today; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-date').max = today; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-start').value = start.toISOString().slice(0, 10); // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-end').value = today; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  function lock(v) { // 定義 lock()：處理 體重紀錄 的 lock 邏輯
    busy = v; // 更新 處理中狀態，保存本步處理結果
    $('weight-fields').disabled = v; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    document.querySelectorAll('[data-weight-action]').forEach((b) => (b.disabled = v)); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  } // 結束 lock() 的目前區塊、參數或資料結構
  function reset() { // 定義 reset()：處理 體重紀錄 的 reset 邏輯
    editing = null; // 更新 目前編輯的紀錄，保存本步處理結果
    $('weight-date').disabled = false; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    $('weight-save').textContent = '儲存體重'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('weight-cancel').classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  } // 結束 reset() 的目前區塊、參數或資料結構
  function draw() { // 定義 draw()：處理 體重紀錄 的 draw 邏輯
    const a = $('weight-start').value, // 宣告不可重新指定的 a，供draw()使用
      b = $('weight-end').value; // 更新 b，保存本步處理結果
    if (!validDate(a) || !validDate(b) || a > b) { // 檢查 (!validDate(a) || !validDate(b) || a > b)；成立時才執行此分支
      $('weight-chart').replaceChildren( // 替換容器內的子節點，清除舊畫面再放入新結果
        el('p', '請選擇有效日期，開始日不可晚於結束日。', 'message error'), // 呼叫 el()，處理 體重紀錄 的 el 邏輯
      ); // 結束 draw() 的目前區塊、參數或資料結構
      return; // 提前結束 draw()，不再執行後續操作
    } // 結束 draw() 的目前區塊、參數或資料結構
    const points = rows // 宣告不可重新指定的 points，供draw()使用
      .filter((r) => r.date >= a && r.date <= b) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      .sort((x, y) => x.date.localeCompare(y.date)) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      .map((r) => ({ date: r.date, value: r.kg })); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    LocalCharts.render($('weight-chart'), points, { // 呼叫 LocalCharts.render()，依目前狀態重繪畫面
      title: '體重變化', // 設定 title 欄位的值或型別
      color: '#c4b5fd', // 設定 color 欄位的值或型別
      zero: false, // 設定 zero 欄位的值或型別
      start: a, // 設定 start 欄位的值或型別
      end: b, // 設定 end 欄位的值或型別
    }); // 結束 draw() 的目前區塊、參數或資料結構
    $('weight-range-count').textContent = `${a} ～ ${b} · ${points.length} 天紀錄`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  } // 結束 draw() 的目前區塊、參數或資料結構
  function render() { // 定義 render()：依目前狀態重繪畫面
    draw(); // 呼叫 draw()，處理 體重紀錄 的 draw 邏輯
    const list = $('weight-list'); // 宣告不可重新指定的 list，供render()使用
    list.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    $('weight-count').textContent = `${rows.length} 天紀錄`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    if (!rows.length) list.append(el('p', '還沒有體重紀錄，從今天開始。', 'hint')); // 將建立的節點加入父容器，形成畫面內容
    for (const r of rows.slice(0, limit)) { // 依 for (const r of rows.slice(0, limit)) 逐項處理或重複等待
      const item = el('article', undefined, 'weight-row'), // 宣告不可重新指定的 item，供render()使用
        text = el('div'); // 更新 顯示文字，保存本步處理結果
      text.append(el('strong', r.date), el('p', `${r.kg} kg`)); // 將建立的節點加入父容器，形成畫面內容
      const actions = el('div', undefined, 'training-actions'); // 宣告不可重新指定的 actions，供render()使用
      const edit = el('button', '修改', 'secondary-button'); // 宣告不可重新指定的 edit，供render()使用
      edit.type = 'button'; // 續接 render() 的運算、回呼或參數：edit.type = 'button';
      edit.dataset.weightAction = ''; // 續接 render() 的運算、回呼或參數：edit.dataset.weightAction = '';
      edit.onclick = () => { // 續接 事件回呼() 的運算、回呼或參數：edit.onclick = () => {
        editing = r; // 更新 目前編輯的紀錄，保存本步處理結果
        $('weight-date').value = r.date; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
        $('weight-date').disabled = true; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
        $('weight-kg').value = r.kg; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
        $('weight-save').textContent = '儲存修改'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        $('weight-cancel').classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
        $('weight-kg').focus(); // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      const del = el('button', '刪除', 'secondary-button'); // 宣告不可重新指定的 del，供render()使用
      del.type = 'button'; // 續接 render() 的運算、回呼或參數：del.type = 'button';
      del.dataset.weightAction = ''; // 續接 render() 的運算、回呼或參數：del.dataset.weightAction = '';
      del.onclick = async () => { // 續接 事件回呼() 的運算、回呼或參數：del.onclick = async () => {
        if (busy || !confirm(`刪除 ${r.date} 的體重紀錄？已產生的月度卡不會更改。`)) return; // 檢查 (busy || !confirm(`刪除 ${r.date} 的體重紀錄？已產生的月度卡不會更改。`)) return;；成立時才執行此分支
        lock(true); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
        try { // 開始可捕捉例外的操作範圍
          await BodyweightStore.removeWeight(r.date, r.updatedAt); // 等待非同步操作完成後，才繼續同一流程
          if (editing?.date === r.date) reset(); // 檢查 (editing?.date === r.date) reset();；成立時才執行此分支
          await reload(); // 等待非同步操作完成後，才繼續同一流程
          notice('已刪除紀錄。'); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
        } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
          notice(e.message, true); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
        } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
          lock(false); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
        } // 結束 事件回呼() 的目前區塊、參數或資料結構
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      actions.append(edit, del); // 將建立的節點加入父容器，形成畫面內容
      item.append(text, actions); // 將建立的節點加入父容器，形成畫面內容
      list.append(item); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 render() 的目前區塊、參數或資料結構
    $('weight-more').classList.toggle('hidden', rows.length <= limit); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  } // 結束 render() 的目前區塊、參數或資料結構
  async function reload() { // 定義 reload()：重新查詢資料並更新畫面
    rows = (await BodyweightStore.weights()).sort((a, b) => b.date.localeCompare(a.date)); // 更新 顯示用資料列，保存本步處理結果
    render(); // 呼叫 render()，依目前狀態重繪畫面
  } // 結束 reload() 的目前區塊、參數或資料結構
  async function load() { // 定義 load()：處理 體重紀錄 的 load 邏輯
    if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
    lock(true); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    try { // 開始可捕捉例外的操作範圍
      await reload(); // 等待非同步操作完成後，才繼續同一流程
      appHideMessage(); // 呼叫 appHideMessage()，處理 體重紀錄 的 appHideMessage 邏輯
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      $('weight-chart').replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      $('weight-list').replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      notice('讀取失敗：' + e.message, true); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      lock(false); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    } // 結束 load() 的目前區塊、參數或資料結構
  } // 結束 load() 的目前區塊、參數或資料結構
  $('weight-form').onsubmit = async (e) => { // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    e.preventDefault(); // 呼叫 e.preventDefault()，處理 體重紀錄 的 preventDefault 邏輯
    if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
    const date = $('weight-date').value, // 宣告不可重新指定的 查詢日期，供事件回呼()使用
      kg = Number($('weight-kg').value), // 更新 kg，保存本步處理結果
      old = editing || rows.find((r) => r.date === date); // 更新 old，保存本步處理結果
    if (!editing && old && !confirm(`${date} 已記錄 ${old.kg} kg，要改為 ${kg} kg 嗎？`)) return; // 檢查 (!editing && old && !confirm(`${date} 已記錄 ${old.kg} kg，要改為 ${kg} kg 嗎？`)) return;；成立時才執行此分支
    lock(true); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    try { // 開始可捕捉例外的操作範圍
      await BodyweightStore.saveWeight( // 等待非同步操作完成後，才繼續同一流程
        { date, kg, updatedAt: Math.max(Date.now(), (old?.updatedAt || 0) + 1) }, // 續接 事件回呼() 的運算、回呼或參數：{ date, kg, updatedAt: Math.max(Date.now(), (old?.updatedAt || 0) + 1) },
        old?.updatedAt ?? null, // 續接 事件回呼() 的運算、回呼或參數：old?.updatedAt ?? null,
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      reset(); // 呼叫 reset()，處理 體重紀錄 的 reset 邏輯
      await reload(); // 等待非同步操作完成後，才繼續同一流程
      notice('體重已儲存在本機。'); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      notice(e.message, true); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      lock(false); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('weight-cancel').onclick = reset; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-refresh').onclick = load; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-more').onclick = () => { // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    limit += 30; // 續接 事件回呼() 的運算、回呼或參數：limit += 30;
    render(); // 呼叫 render()，依目前狀態重繪畫面
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('weight-start').onchange = draw; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-end').onchange = draw; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-seven').onclick = () => { // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    $('weight-start').value = start.toISOString().slice(0, 10); // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    $('weight-end').value = today; // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    draw(); // 呼叫 draw()，處理 體重紀錄 的 draw 邏輯
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('weight-export').onclick = async () => { // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
    lock(true); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    try { // 開始可捕捉例外的操作範圍
      FitnessFiles.download( // 呼叫 FitnessFiles.download()，處理 體重紀錄 的 download 邏輯
        { format: 'gym-bodyweight-backup', version: 1, records: await BodyweightStore.weights() }, // 續接 事件回呼() 的運算、回呼或參數：{ format: 'gym-bodyweight-backup', version: 1, records: await BodyweightStor…
        'gym-bodyweight-' + today + '.json', // 提供 'gym-bodyweight-' + today + '.json', 文字、路徑或資料欄位值
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      notice(e.message, true); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      lock(false); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('weight-import').onclick = () => $('weight-file').click(); // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
  $('weight-file').onchange = async (e) => { // 呼叫 $()，處理 體重紀錄 的 $ 邏輯
    const f = e.target.files[0]; // 宣告不可重新指定的 f，供事件回呼()使用
    if (!f || busy) return; // 檢查 (!f || busy) return;；成立時才執行此分支
    lock(true); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    try { // 開始可捕捉例外的操作範圍
      const result = await BodyweightStore.merge(await FitnessFiles.readFile(f)); // 宣告不可重新指定的 處理結果，供事件回呼()使用
      await reload(); // 等待非同步操作完成後，才繼續同一流程
      notice(`已匯入 ${result.added} 筆，略過 ${result.skipped} 個已有日期。`); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } catch (e) { // 捕捉上方操作的錯誤，進入失敗處理
      notice('匯入失敗：' + e.message, true); // 呼叫 notice()，處理 體重紀錄 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      e.target.value = ''; // 續接 事件回呼() 的運算、回呼或參數：e.target.value = '';
      lock(false); // 呼叫 lock()，處理 體重紀錄 的 lock 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  load(); // 呼叫 load()，處理 體重紀錄 的 load 邏輯
} // 結束 mount() 的目前區塊、參數或資料結構
