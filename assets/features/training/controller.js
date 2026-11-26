import { mountTimerControls } from '../rest-timer/index.js'; // 從 ../rest-timer/index.js 載入相依介面，供本機訓練紀錄使用
import { mountShell as appMountShell } from '../../shared/ui/shell.js'; // 從 ../../shared/ui/shell.js 載入相依介面，供本機訓練紀錄使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供本機訓練紀錄使用
import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供本機訓練紀錄使用
import { TrainingStore } from './repository.js'; // 從 ./repository.js 載入相依介面，供本機訓練紀錄使用
import { RestTimer } from '../rest-timer/index.js'; // 從 ../rest-timer/index.js 載入相依介面，供本機訓練紀錄使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const $ = (id) => document.getElementById(id); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const store = TrainingStore, // 宣告不可重新指定的 store，供mount()使用
    timer = RestTimer; // 更新 休息計時器，保存本步處理結果
  let records = [], // 宣告可更新的 紀錄清單，供mount()使用
    editing = null, // 更新 目前編輯的紀錄，保存本步處理結果
    busy = false, // 更新 處理中狀態，保存本步處理結果
    limit = 30, // 更新 顯示筆數上限，保存本步處理結果
    importPending = null; // 更新 importPending，保存本步處理結果
  const today = () => appTaipeiDateString(); // 宣告不可重新指定的 今天日期，供today()使用
  const normalized = (name) => name.trim().toLocaleLowerCase(); // 宣告不可重新指定的 normalized，供normalized()使用
  const order = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt; // 宣告不可重新指定的 order，供order()使用
  const notice = (text, error = false) => appSetMessage(text, error ? 'error' : 'success'); // 宣告不可重新指定的 notice，供notice()使用
  function element(tag, text, className) { // 定義 element()：處理 本機訓練紀錄 的 element 邏輯
    const node = document.createElement(tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
    if (text !== undefined) node.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    if (className) node.className = className; // 檢查 (className) node.className = className;；成立時才執行此分支
    return node; // 回傳 node，交給 element() 的呼叫端
  } // 結束 element() 的目前區塊、參數或資料結構
  function control(label, action) { // 定義 control()：處理 本機訓練紀錄 的 control 邏輯
    const node = element('button', label, 'secondary-button'); // 宣告不可重新指定的 新建 DOM 元素，供control()使用
    node.type = 'button'; // 續接 control() 的運算、回呼或參數：node.type = 'button';
    node.disabled = busy; // 續接 control() 的運算、回呼或參數：node.disabled = busy;
    node.addEventListener('click', action); // 綁定 click 事件，交由回呼處理使用者操作
    return node; // 回傳 node，交給 control() 的呼叫端
  } // 結束 control() 的目前區塊、參數或資料結構
  function setBusy(value) { // 定義 setBusy()：切換處理狀態並避免重複操作
    busy = value; // 更新 處理中狀態，保存本步處理結果
    $('training-fields').disabled = value; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-export').disabled = value; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-import').disabled = value; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    document.querySelectorAll('#training-history button').forEach((b) => { // 依元素 ID 或 CSS 選擇器取得頁面控制項
      b.disabled = value; // 續接 事件回呼() 的運算、回呼或參數：b.disabled = value;
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 setBusy() 的目前區塊、參數或資料結構
  function resetForm() { // 定義 resetForm()：清除編輯狀態並還原表單
    editing = null; // 更新 目前編輯的紀錄，保存本步處理結果
    $('training-save').textContent = '儲存紀錄'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('training-cancel').classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    $('record-title').textContent = '記下這次訓練'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    previous(); // 呼叫 previous()，尋找相同動作的上一筆訓練紀錄
  } // 結束 resetForm() 的目前區塊、參數或資料結構
  function fill(record, edit = false) { // 定義 fill()：將選取紀錄帶入表單
    editing = edit ? { ...record } : null; // 更新 目前編輯的紀錄，保存本步處理結果
    $('training-date').value = edit ? record.date : today(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-exercise').value = record.exercise; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-weight').value = record.weight; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-reps').value = record.reps; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-sets').value = record.sets; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-note').value = record.note; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-save').textContent = edit ? '儲存修改' : '儲存紀錄'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('training-cancel').classList.toggle('hidden', !edit); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    $('record-title').textContent = edit ? '編輯訓練紀錄' : '記下這次訓練'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    previous(); // 呼叫 previous()，尋找相同動作的上一筆訓練紀錄
    $('training-exercise').focus(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('training-form').scrollIntoView({ behavior: 'smooth', block: 'center' }); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
  } // 結束 fill() 的目前區塊、參數或資料結構
  function previous() { // 定義 previous()：尋找相同動作的上一筆訓練紀錄
    const box = $('last-training'); // 宣告不可重新指定的 box，供previous()使用
    box.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const exercise = normalized($('training-exercise').value), // 宣告不可重新指定的 exercise，供previous()使用
      date = $('training-date').value; // 更新 查詢日期，保存本步處理結果
    if (!exercise) { // 檢查 (!exercise)；成立時才執行此分支
      box.textContent = '輸入動作名稱，即可查看之前的紀錄。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      return; // 提前結束 previous()，不再執行後續操作
    } // 結束 previous() 的目前區塊、參數或資料結構
    const matches = records // 宣告不可重新指定的 matches，供previous()使用
      .filter((r) => normalized(r.exercise) === exercise && r.date <= date && r.id !== editing?.id) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      .sort(order); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    if (!matches.length) { // 檢查 (!matches.length)；成立時才執行此分支
      box.textContent = '這個動作還沒有之前的紀錄，從今天開始累積。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      return; // 提前結束 previous()，不再執行後續操作
    } // 結束 previous() 的目前區塊、參數或資料結構
    const last = matches[0]; // 宣告不可重新指定的 last，供previous()使用
    box.append( // 將建立的節點加入父容器，形成畫面內容
      element( // 呼叫 element()，處理 本機訓練紀錄 的 element 邏輯
        'span', // 提供 'span', 文字、路徑或資料欄位值
        `最近一筆 · ${last.date}　${last.weight} kg × ${last.reps} 次 × ${last.sets} 組`, // 續接 previous() 的運算、回呼或參數：`最近一筆 · ${last.date} ${last.weight} kg × ${last.reps} 次 × ${last.sets} 組`,
      ), // 結束 previous() 的目前區塊、參數或資料結構
    ); // 結束 previous() 的目前區塊、參數或資料結構
    box.append( // 將建立的節點加入父容器，形成畫面內容
      control('帶入數值', () => { // 呼叫 control()，處理 本機訓練紀錄 的 control 邏輯
        $('training-weight').value = last.weight; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
        $('training-reps').value = last.reps; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
        $('training-sets').value = last.sets; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      }), // 結束 事件回呼() 的目前區塊、參數或資料結構
    ); // 結束 previous() 的目前區塊、參數或資料結構
  } // 結束 previous() 的目前區塊、參數或資料結構
  function render() { // 定義 render()：依目前狀態重繪畫面
    const options = $('exercise-options'); // 宣告不可重新指定的 選項清單，供render()使用
    options.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const names = [...new Set(records.map((r) => r.exercise))].sort((a, b) => // 宣告不可重新指定的 names，供事件回呼()使用
      a.localeCompare(b, 'zh-TW'), // 呼叫 a.localeCompare()，處理 本機訓練紀錄 的 localeCompare 邏輯
    ); // 結束 render() 的目前區塊、參數或資料結構
    names.forEach((name) => { // 呼叫 names.forEach()，處理 本機訓練紀錄 的 forEach 邏輯
      const opt = element('option'); // 宣告不可重新指定的 opt，供事件回呼()使用
      opt.value = name; // 續接 事件回呼() 的運算、回呼或參數：opt.value = name;
      options.append(opt); // 將建立的節點加入父容器，形成畫面內容
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('training-total').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      `${records.length} 筆 · ${new Set(records.map((r) => r.date)).size} 天`; // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    const date = $('history-date').value, // 宣告不可重新指定的 查詢日期，供render()使用
      term = normalized($('history-exercise').value); // 更新 term，保存本步處理結果
    const filtered = records // 宣告不可重新指定的 filtered，供render()使用
      .filter((r) => (!date || r.date === date) && normalized(r.exercise).includes(term)) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      .sort(order); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    const groups = filtered.reduce((sum, r) => sum + r.sets, 0); // 宣告不可重新指定的 groups，供事件回呼()使用
    $('history-summary').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      `${date || '全部日期'} · ${filtered.length} 筆 · ${groups} 組`; // 續接 render() 的運算、回呼或參數：`${date || '全部日期'} · ${filtered.length} 筆 · ${groups} 組`;
    const history = $('training-history'); // 宣告不可重新指定的 history，供render()使用
    history.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    if (!filtered.length) // 檢查 (!filtered.length)；成立時才執行此分支
      history.append( // 將建立的節點加入父容器，形成畫面內容
        element( // 呼叫 element()，處理 本機訓練紀錄 的 element 邏輯
          'p', // 提供 'p', 文字、路徑或資料欄位值
          records.length ? '沒有符合條件的紀錄。' : '還沒有紀錄。完成一組後，把成果記下來吧。', // 續接 render() 的運算、回呼或參數：records.length ? '沒有符合條件的紀錄。' : '還沒有紀錄。完成一組後，把成果記下來吧。',
          'training-empty', // 提供 'training-empty', 文字、路徑或資料欄位值
        ), // 結束 render() 的目前區塊、參數或資料結構
      ); // 結束 render() 的目前區塊、參數或資料結構
    filtered.slice(0, limit).forEach((record) => { // 呼叫 filtered.slice()，處理 本機訓練紀錄 的 slice 邏輯
      const article = element('article', undefined, 'training-record'); // 宣告不可重新指定的 article，供事件回呼()使用
      const heading = element('div', undefined, 'training-heading'); // 宣告不可重新指定的 heading，供事件回呼()使用
      heading.append(element('h3', record.exercise), element('time', record.date)); // 將建立的節點加入父容器，形成畫面內容
      heading.lastChild.dateTime = record.date; // 續接 事件回呼() 的運算、回呼或參數：heading.lastChild.dateTime = record.date;
      article.append( // 將建立的節點加入父容器，形成畫面內容
        heading, // 續接 事件回呼() 的運算、回呼或參數：heading,
        element( // 呼叫 element()，處理 本機訓練紀錄 的 element 邏輯
          'p', // 提供 'p', 文字、路徑或資料欄位值
          `${record.weight} kg × ${record.reps} 次 × ${record.sets} 組`, // 續接 事件回呼() 的運算、回呼或參數：`${record.weight} kg × ${record.reps} 次 × ${record.sets} 組`,
          'training-record-numbers', // 提供 'training-record-numbers', 文字、路徑或資料欄位值
        ), // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      if (record.note) article.append(element('p', record.note, 'hint')); // 將建立的節點加入父容器，形成畫面內容
      const actions = element('div', undefined, 'training-row'); // 宣告不可重新指定的 actions，供事件回呼()使用
      actions.append( // 將建立的節點加入父容器，形成畫面內容
        control('再記一次', () => fill(record)), // 呼叫 control()，處理 本機訓練紀錄 的 control 邏輯
        control('編輯', () => fill(record, true)), // 呼叫 control()，處理 本機訓練紀錄 的 control 邏輯
        control('刪除', async () => { // 呼叫 control()，處理 本機訓練紀錄 的 control 邏輯
          if (busy || !confirm(`刪除 ${record.date} 的「${record.exercise}」這筆紀錄？`)) return; // 檢查 (busy || !confirm(`刪除 ${record.date} 的「${record.exercise}」這筆紀錄？`)) return;；成立時才執行此分支
          await mutate(async () => { // 等待非同步操作完成後，才繼續同一流程
            await store.remove(record.id, record.updatedAt); // 等待非同步操作完成後，才繼續同一流程
            if (editing?.id === record.id) resetForm(); // 檢查 (editing?.id === record.id) resetForm();；成立時才執行此分支
          }, '紀錄已刪除。'); // 續接 事件回呼() 的運算、回呼或參數：}, '紀錄已刪除。');
        }), // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      article.append(actions); // 將建立的節點加入父容器，形成畫面內容
      history.append(article); // 將建立的節點加入父容器，形成畫面內容
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('history-more').classList.toggle('hidden', filtered.length <= limit); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    previous(); // 呼叫 previous()，尋找相同動作的上一筆訓練紀錄
  } // 結束 render() 的目前區塊、參數或資料結構
  async function refresh() { // 定義 refresh()：處理 本機訓練紀錄 的 refresh 邏輯
    records = await store.all(); // 更新 紀錄清單，保存本步處理結果
    render(); // 呼叫 render()，依目前狀態重繪畫面
  } // 結束 refresh() 的目前區塊、參數或資料結構
  async function mutate(action, success) { // 定義 mutate()：處理 本機訓練紀錄 的 mutate 邏輯
    if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    try { // 開始可捕捉例外的操作範圍
      await action(); // 等待非同步操作完成後，才繼續同一流程
      await refresh(); // 等待非同步操作完成後，才繼續同一流程
      notice(typeof success === 'function' ? success() : success); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      notice(`操作未完成：${error.message || '請確認瀏覽器允許儲存資料，並保留足夠空間。'}`, true); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    } // 結束 mutate() 的目前區塊、參數或資料結構
  } // 結束 mutate() 的目前區塊、參數或資料結構
  await (async () => { // 等待非同步操作完成後，才繼續同一流程
    // Mount navigation only. Deliberately do not initialize auth, Supabase or profiles.
    appMountShell(); // 呼叫 appMountShell()，處理 本機訓練紀錄 的 appMountShell 邏輯
    $('training-date').value = today(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    $('history-date').value = today(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
    mountTimerControls(); // 呼叫 mountTimerControls()，處理 本機訓練紀錄 的 mountTimerControls 邏輯
    $('training-exercise').addEventListener('input', previous); // 綁定 input 事件，交由回呼處理使用者操作
    $('training-date').addEventListener('change', previous); // 綁定 change 事件，交由回呼處理使用者操作
    $('training-cancel').addEventListener('click', () => { // 綁定 click 事件，交由回呼處理使用者操作
      $('training-form').reset(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      $('training-date').value = today(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      resetForm(); // 呼叫 resetForm()，清除編輯狀態並還原表單
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    for (const id of ['history-date', 'history-exercise']) // 依 for (const id of ['history-date', 'history-exercise']) 逐項處理或重複等待
      $(id).addEventListener('input', () => { // 綁定 input 事件，交由回呼處理使用者操作
        limit = 30; // 更新 顯示筆數上限，保存本步處理結果
        render(); // 呼叫 render()，依目前狀態重繪畫面
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('history-today').addEventListener('click', () => { // 綁定 click 事件，交由回呼處理使用者操作
      $('history-date').value = today(); // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      limit = 30; // 更新 顯示筆數上限，保存本步處理結果
      render(); // 呼叫 render()，依目前狀態重繪畫面
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('history-all').addEventListener('click', () => { // 綁定 click 事件，交由回呼處理使用者操作
      $('history-date').value = ''; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      $('history-exercise').value = ''; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
      limit = 30; // 更新 顯示筆數上限，保存本步處理結果
      render(); // 呼叫 render()，依目前狀態重繪畫面
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('history-more').addEventListener('click', () => { // 綁定 click 事件，交由回呼處理使用者操作
      limit += 30; // 續接 事件回呼() 的運算、回呼或參數：limit += 30;
      render(); // 呼叫 render()，依目前狀態重繪畫面
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('training-form').addEventListener('submit', async (event) => { // 綁定 submit 事件，交由回呼處理使用者操作
      event.preventDefault(); // 呼叫 event.preventDefault()，處理 本機訓練紀錄 的 preventDefault 邏輯
      if (busy || !$('training-form').reportValidity()) return; // 檢查 (busy || !$('training-form').reportValidity()) return;；成立時才執行此分支
      const exercise = $('training-exercise').value.trim(); // 宣告不可重新指定的 exercise，供事件回呼()使用
      if (!exercise) { // 檢查 (!exercise)；成立時才執行此分支
        notice('請填寫動作名稱。', true); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      const old = editing; // 宣告不可重新指定的 old，供事件回呼()使用
      const now = Math.max(Date.now(), (old?.updatedAt || 0) + 1); // 宣告不可重新指定的 目前時間，供事件回呼()使用
      const record = { // 宣告不可重新指定的 單筆紀錄，供事件回呼()使用
        id: old?.id || crypto.randomUUID(), // 設定 id 欄位的值或型別
        date: $('training-date').value, // 設定 查詢日期 欄位的值或型別
        exercise, // 續接 事件回呼() 的運算、回呼或參數：exercise,
        weight: Number($('training-weight').value), // 設定 weight 欄位的值或型別
        reps: Number($('training-reps').value), // 設定 reps 欄位的值或型別
        sets: Number($('training-sets').value), // 設定 sets 欄位的值或型別
        note: $('training-note').value, // 設定 note 欄位的值或型別
        createdAt: old?.createdAt || now, // 設定 createdAt 欄位的值或型別
        updatedAt: now, // 設定 updatedAt 欄位的值或型別
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      const startRest = $('save-and-rest').checked; // 宣告不可重新指定的 startRest，供事件回呼()使用
      if (startRest) timer.unlockAudio(); // 檢查 (startRest) timer.unlockAudio();；成立時才執行此分支
      await mutate( // 等待非同步操作完成後，才繼續同一流程
        async () => { // 續接 事件回呼() 的運算、回呼或參數：async () => {
          await store.save(record, old?.updatedAt ?? null); // 等待非同步操作完成後，才繼續同一流程
          resetForm(); // 呼叫 resetForm()，清除編輯狀態並還原表單
          $('history-date').value = record.date; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
          $('history-exercise').value = ''; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
          limit = 30; // 更新 顯示筆數上限，保存本步處理結果
          if (startRest) timer.start(true); // 檢查 (startRest) timer.start(true);；成立時才執行此分支
        }, // 結束 事件回呼() 的目前區塊、參數或資料結構
        old ? '修改已存入本機。' : '已存入本機，可繼續記錄下一組。', // 續接 事件回呼() 的運算、回呼或參數：old ? '修改已存入本機。' : '已存入本機，可繼續記錄下一組。',
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('training-export').addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
      if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
      try { // 開始可捕捉例外的操作範圍
        const current = await store.all(); // 宣告不可重新指定的 current，供事件回呼()使用
        const data = JSON.stringify( // 把資料轉成 JSON 字串以傳送或保存
          { // 續接 事件回呼() 的運算、回呼或參數：{
            format: 'gym-training-backup', // 設定 format 欄位的值或型別
            version: 1, // 設定 version 欄位的值或型別
            exportedAt: new Date().toISOString(), // 設定 exportedAt 欄位的值或型別
            records: current, // 設定 紀錄清單 欄位的值或型別
          }, // 結束 事件回呼() 的目前區塊、參數或資料結構
          null, // 續接 事件回呼() 的運算、回呼或參數：null,
          2, // 續接 事件回呼() 的運算、回呼或參數：2,
        ); // 結束 事件回呼() 的目前區塊、參數或資料結構
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' })); // 宣告不可重新指定的 url，供事件回呼()使用
        const a = element('a'); // 宣告不可重新指定的 a，供事件回呼()使用
        a.href = url; // 續接 事件回呼() 的運算、回呼或參數：a.href = url;
        a.download = `訓練紀錄_${today()}_${Date.now()}.json`; // 續接 事件回呼() 的運算、回呼或參數：a.download = `訓練紀錄_${today()}_${Date.now()}.json`;
        document.body.append(a); // 將建立的節點加入父容器，形成畫面內容
        a.click(); // 呼叫 a.click()，處理 本機訓練紀錄 的 click 邏輯
        a.remove(); // 呼叫 a.remove()，處理 本機訓練紀錄 的 remove 邏輯
        setTimeout(() => URL.revokeObjectURL(url), 60000); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
        notice(`已產生 ${current.length} 筆紀錄的備份，請確認手機已下載檔案。`); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
      } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
        notice(`備份失敗：${error.message}`, true); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('training-import').addEventListener('click', () => $('training-import-file').click()); // 綁定 click 事件，交由回呼處理使用者操作
    $('training-import-file').addEventListener('change', async (event) => { // 綁定 change 事件，交由回呼處理使用者操作
      const file = event.target.files[0]; // 宣告不可重新指定的 file，供事件回呼()使用
      event.target.value = ''; // 續接 事件回呼() 的運算、回呼或參數：event.target.value = '';
      if (!file || busy || importPending) return; // 檢查 (!file || busy || importPending) return;；成立時才執行此分支
      importPending = file; // 更新 importPending，保存本步處理結果
      try { // 開始可捕捉例外的操作範圍
        if (file.size > 20 * 1024 * 1024) throw new Error('檔案超過 20 MB，未匯入。'); // 檢查 (file.size > 20 * 1024 * 1024) throw new Error('檔案超過 20 MB，未匯入。');；成立時才執行此分支
        const imported = store.parseBackup(JSON.parse(await file.text())); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
        if (!confirm(`將合併 ${imported.length} 筆備份紀錄；相同編號保留手機現有資料，是否繼續？`)) // 檢查 (!confirm(`將合併 ${imported.length} 筆備份紀錄；相同編號保留手機現有資料，是否繼續？`))；成立時才執行此分支
          return; // 提前結束 事件回呼()，不再執行後續操作
        let result; // 宣告可更新的 處理結果，供事件回呼()使用
        await mutate( // 等待非同步操作完成後，才繼續同一流程
          async () => { // 續接 事件回呼() 的運算、回呼或參數：async () => {
            result = await store.merge(imported); // 更新 處理結果，保存本步處理結果
            $('history-date').value = ''; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
            $('history-exercise').value = ''; // 呼叫 $()，處理 本機訓練紀錄 的 $ 邏輯
            limit = 30; // 更新 顯示筆數上限，保存本步處理結果
          }, // 結束 事件回呼() 的目前區塊、參數或資料結構
          () => `匯入完成：新增 ${result.added} 筆，保留 ${result.skipped} 筆現有紀錄。`, // 續接 事件回呼() 的運算、回呼或參數：() => `匯入完成：新增 ${result.added} 筆，保留 ${result.skipped} 筆現有紀錄。`,
        ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
        notice(`匯入失敗：${error.message}`, true); // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
      } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
        importPending = null; // 更新 importPending，保存本步處理結果
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    $('training-persist').addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
      try { // 開始可捕捉例外的操作範圍
        const allowed = await navigator.storage?.persist?.(); // 宣告不可重新指定的 allowed，供事件回呼()使用
        $('persist-status').textContent = allowed // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
          ? '瀏覽器已同意持續保留資料；手動清除網站資料仍會刪除紀錄，請繼續定期備份。' // 續接 事件回呼() 的運算、回呼或參數：? '瀏覽器已同意持續保留資料；手動清除網站資料仍會刪除紀錄，請繼續定期備份。'
          : '瀏覽器未同意或不支援保留請求；紀錄仍可使用，請定期備份。'; // 續接 事件回呼() 的運算、回呼或參數：: '瀏覽器未同意或不支援保留請求；紀錄仍可使用，請定期備份。';
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        $('persist-status').textContent = '目前無法申請保留，請使用下載備份。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    try { // 開始可捕捉例外的操作範圍
      await refresh(); // 等待非同步操作完成後，才繼續同一流程
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      $('training-total').textContent = '儲存空間無法開啟'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      notice( // 呼叫 notice()，處理 本機訓練紀錄 的 notice 邏輯
        '無法開啟手機儲存空間，訓練紀錄暫時無法使用。請確認瀏覽器允許網站儲存資料後重新整理；計時器仍可使用。', // 提供 '無法開啟手機儲存空間，訓練紀錄暫時無法使用。請確認瀏覽器允許網站儲存資料後重新整理；計時器仍可使用。', 文字、路徑或資料欄位值
        true, // 續接 事件回呼() 的運算、回呼或參數：true,
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
    document.addEventListener('visibilitychange', () => { // 綁定 visibilitychange 事件，交由回呼處理使用者操作
      if (!document.hidden && !busy) // 檢查 (!document.hidden && !busy)；成立時才執行此分支
        refresh().catch(() => notice('無法重新讀取本機紀錄，請重新整理。', true)); // 呼叫 refresh()，處理 本機訓練紀錄 的 refresh 邏輯
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  })(); // 續接 事件回呼() 的運算、回呼或參數：})();
} // 結束 mount() 的目前區塊、參數或資料結構
