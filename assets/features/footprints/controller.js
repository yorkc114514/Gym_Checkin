import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供個人集章與簽退成果卡使用
import { hideMessage as appHideMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供個人集章與簽退成果卡使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供個人集章與簽退成果卡使用
import { profileName as appProfileName } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供個人集章與簽退成果卡使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供個人集章與簽退成果卡使用
import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供個人集章與簽退成果卡使用
import { FootprintsStore } from './repository.js'; // 從 ./repository.js 載入相依介面，供個人集章與簽退成果卡使用
import { FootprintsUI } from './view.js'; // 從 ./view.js 載入相依介面，供個人集章與簽退成果卡使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const $ = (id) => document.getElementById(id), // 依元素 ID 或 CSS 選擇器取得頁面控制項
    store = FootprintsStore; // 更新 store，保存本步處理結果
  const params = new URLSearchParams(location.search), // 宣告不可重新指定的 params，供mount()使用
    kind = params.get('view') === 'out' ? 'out' : 'in'; // 更新 kind，保存本步處理結果
  document.body.dataset.page = kind === 'in' ? 'stampbook' : 'checkoutcards'; // 續接 mount() 的運算、回呼或參數：document.body.dataset.page = kind === 'in' ? 'stampbook' : 'checkoutcards';
  const app = await appInit(); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支
  const userId = app.session.user.id, // 宣告不可重新指定的 userId，供mount()使用
    name = appProfileName(app.profile, app.session); // 更新 name，保存本步處理結果
  let rows = [], // 宣告可更新的 顯示用資料列，供mount()使用
    limit = 12, // 更新 顯示筆數上限，保存本步處理結果
    busy = false; // 更新 處理中狀態，保存本步處理結果
  $('footprints-owner').textContent = `${name} · 每天一個到訪章，一張簽退成果卡。`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  $('tab-' + kind).setAttribute('aria-current', 'page'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
  $('footprints-month').value = // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    /^\d{4}-(0[1-9]|1[0-2])$/.test(params.get('month') || '') && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
    Number(params.get('month').slice(0, 4)) >= 1970 && // 呼叫 Number()，處理 個人集章與簽退成果卡 的 Number 邏輯
    Number(params.get('month').slice(0, 4)) <= 9998 // 呼叫 Number()，處理 個人集章與簽退成果卡 的 Number 邏輯
      ? params.get('month') // 續接 mount() 的運算、回呼或參數：? params.get('month')
      : appTaipeiDateString().slice(0, 7); // 續接 mount() 的運算、回呼或參數：: appTaipeiDateString().slice(0, 7);
  $('stamp-calendar-section').classList.toggle('hidden', kind !== 'in'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  $('checkout-cards-section').classList.toggle('hidden', kind !== 'out'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  const el = (tag, text, cls) => { // 宣告不可重新指定的 el，供el()使用
    const node = document.createElement(tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
    if (text !== undefined) node.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    if (cls) node.className = cls; // 檢查 (cls) node.className = cls;；成立時才執行此分支
    return node; // 回傳 node，交給 el() 的呼叫端
  }; // 結束 el() 的目前區塊、參數或資料結構
  function render() { // 定義 render()：依目前狀態重繪畫面
    const month = $('footprints-month').value, // 宣告不可重新指定的 month，供render()使用
      selected = rows // 更新 目前選項，保存本步處理結果
        .filter((r) => r.kind === kind && r.date.startsWith(month)) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
        .sort((a, b) => b.date.localeCompare(a.date)); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
    $('month-count').textContent = selected.length; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('total-count').textContent = rows.filter((r) => r.kind === kind).length; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('month-count-label').textContent = kind === 'in' ? '本月到訪天數' : '本月完成簽退天數'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('total-count-label').textContent = kind === 'in' ? '累積到訪天數' : '累積完成簽退天數'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    $('footprints-rule').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      kind === 'in' // 更新 kind，保存本步處理結果
        ? '每天只蓋一次，點選有印章的日期即可回顧。' // 續接 render() 的運算、回呼或參數：? '每天只蓋一次，點選有印章的日期即可回顧。'
        : '每天最多一張成果卡，保留當天第一次本人簽退的內容。'; // 續接 render() 的運算、回呼或參數：: '每天最多一張成果卡，保留當天第一次本人簽退的內容。';
    for (const k of ['in', 'out']) // 依 for (const k of ['in', 'out']) 逐項處理或重複等待
      $('tab-' + k).href = `./footprints.html?view=${k}&month=${month}`; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    if (kind === 'in') { // 檢查 (kind === 'in')；成立時才執行此分支
      const calendar = $('stamp-calendar'); // 宣告不可重新指定的 calendar，供render()使用
      calendar.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      const [year, m] = month.split('-').map(Number), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
        start = new Date(Date.UTC(year, m - 1, 1)); // 更新 start，保存本步處理結果
      const offset = (start.getUTCDay() + 6) % 7, // 宣告不可重新指定的 offset，供render()使用
        count = new Date(Date.UTC(year, m, 0)).getUTCDate(); // 更新 count，保存本步處理結果
      for (let i = 0; i < offset; i++) { // 依 for (let i = 0; i < offset; i++) 逐項處理或重複等待
        const blank = el('div'); // 宣告不可重新指定的 blank，供render()使用
        blank.setAttribute('aria-hidden', 'true'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
        calendar.append(blank); // 將建立的節點加入父容器，形成畫面內容
      } // 結束 render() 的目前區塊、參數或資料結構
      for (let n = 1; n <= count; n++) { // 依 for (let n = 1; n <= count; n++) 逐項處理或重複等待
        const date = `${month}-${String(n).padStart(2, '0')}`, // 宣告不可重新指定的 查詢日期，供render()使用
          entry = selected.find((r) => r.date === date); // 更新 entry，保存本步處理結果
        const cell = el( // 宣告不可重新指定的 cell，供render()使用
          entry ? 'button' : 'div', // 續接 render() 的運算、回呼或參數：entry ? 'button' : 'div',
          undefined, // 續接 render() 的運算、回呼或參數：undefined,
          `stamp-day${entry ? ' stamped' : ''}${date === appTaipeiDateString() ? ' is-today' : ''}`, // 續接 render() 的運算、回呼或參數：`stamp-day${entry ? ' stamped' : ''}${date === appTaipeiDateString() ? ' is-…
        ); // 結束 render() 的目前區塊、參數或資料結構
        cell.append(el('span', String(n)), el('strong', entry ? '✓' : '·')); // 將建立的節點加入父容器，形成畫面內容
        if (entry) { // 檢查 (entry)；成立時才執行此分支
          cell.type = 'button'; // 續接 render() 的運算、回呼或參數：cell.type = 'button';
          cell.setAttribute('aria-label', `${date} 到訪章，查看紀錄`); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
          cell.onclick = () => FootprintsUI.review(entry, rows, name); // 續接 事件回呼() 的運算、回呼或參數：cell.onclick = () => FootprintsUI.review(entry, rows, name);
        } else cell.setAttribute('aria-label', `${date} 未集章`); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
        calendar.append(cell); // 將建立的節點加入父容器，形成畫面內容
      } // 結束 render() 的目前區塊、參數或資料結構
      $('stamp-empty').classList.toggle('hidden', selected.length > 0); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    } else { // 前一條件未成立時，執行 render() 的另一分支
      const list = $('checkout-cards'); // 宣告不可重新指定的 list，供render()使用
      list.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      if (!selected.length) // 檢查 (!selected.length)；成立時才執行此分支
        list.append( // 將建立的節點加入父容器，形成畫面內容
          el( // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
            'p', // 提供 'p', 文字、路徑或資料欄位值
            '本月還沒有成果卡。下次本人簽退成功，就會在這裡留下紀錄。', // 提供 '本月還沒有成果卡。下次本人簽退成功，就會在這裡留下紀錄。', 文字、路徑或資料欄位值
            'card training-empty', // 提供 'card training-empty', 文字、路徑或資料欄位值
          ), // 結束 render() 的目前區塊、參數或資料結構
        ); // 結束 render() 的目前區塊、參數或資料結構
      selected.slice(0, limit).forEach((entry) => { // 呼叫 selected.slice()，處理 個人集章與簽退成果卡 的 slice 邏輯
        const item = el('article', undefined, 'card checkout-mini-card'); // 宣告不可重新指定的 item，供事件回呼()使用
        const top = el('div', undefined, 'training-heading'); // 宣告不可重新指定的 top，供事件回呼()使用
        top.append(el('h3', entry.date), el('span', '✓ 已完成', 'checkout-label')); // 將建立的節點加入父容器，形成畫面內容
        item.append(top); // 將建立的節點加入父容器，形成畫面內容
        const stats = store.stats(rows, 'out', entry.date); // 宣告不可重新指定的 stats，供事件回呼()使用
        item.append( // 將建立的節點加入父容器，形成畫面內容
          el('p', `截至這天，本月已完成 ${stats.month} 天`, 'checkout-mini-title'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
          el( // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
            'p', // 提供 'p', 文字、路徑或資料欄位值
            `首次簽退 ${appFormatTime(entry.at)} · 停留 ${FootprintsUI.duration(entry)}`, // 續接 事件回呼() 的運算、回呼或參數：`首次簽退 ${appFormatTime(entry.at)} · 停留 ${FootprintsUI.duration(entry)}`,
            'hint', // 提供 'hint', 文字、路徑或資料欄位值
          ), // 結束 事件回呼() 的目前區塊、參數或資料結構
        ); // 結束 事件回呼() 的目前區塊、參數或資料結構
        const button = el('button', '查看這天的成果', 'secondary-button'); // 宣告不可重新指定的 操作按鈕，供事件回呼()使用
        button.type = 'button'; // 續接 事件回呼() 的運算、回呼或參數：button.type = 'button';
        button.onclick = () => FootprintsUI.review(entry, rows, name); // 續接 事件回呼() 的運算、回呼或參數：button.onclick = () => FootprintsUI.review(entry, rows, name);
        item.append(button); // 將建立的節點加入父容器，形成畫面內容
        list.append(item); // 將建立的節點加入父容器，形成畫面內容
      }); // 結束 事件回呼() 的目前區塊、參數或資料結構
      $('checkout-more').classList.toggle('hidden', limit >= selected.length); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    } // 結束 render() 的目前區塊、參數或資料結構
  } // 結束 render() 的目前區塊、參數或資料結構
  async function refresh() { // 定義 refresh()：處理 個人集章與簽退成果卡 的 refresh 邏輯
    rows = await store.all(userId); // 更新 顯示用資料列，保存本步處理結果
    render(); // 呼叫 render()，依目前狀態重繪畫面
  } // 結束 refresh() 的目前區塊、參數或資料結構
  function selectMonth(value) { // 定義 selectMonth()：處理 個人集章與簽退成果卡 的 selectMonth 邏輯
    if ( // 檢查 (；成立時才執行此分支
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(value) || // 建立測試案例，將下方操作與預期結果放在同一測試範圍
      Number(value.slice(0, 4)) < 1970 || // 呼叫 Number()，處理 個人集章與簽退成果卡 的 Number 邏輯
      Number(value.slice(0, 4)) > 9998 // 呼叫 Number()，處理 個人集章與簽退成果卡 的 Number 邏輯
    ) { // 續接 selectMonth() 的運算、回呼或參數：) {
      $('footprints-month').value = appTaipeiDateString().slice(0, 7); // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
      appSetMessage('請選擇有效月份。', 'error'); // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
    } // 結束 selectMonth() 的目前區塊、參數或資料結構
    limit = 12; // 更新 顯示筆數上限，保存本步處理結果
    render(); // 呼叫 render()，依目前狀態重繪畫面
    history.replaceState( // 呼叫 history.replaceState()，處理 個人集章與簽退成果卡 的 replaceState 邏輯
      null, // 續接 selectMonth() 的運算、回呼或參數：null,
      '', // 提供 '', 文字、路徑或資料欄位值
      `./footprints.html?view=${kind}&month=${$('footprints-month').value}`, // 續接 selectMonth() 的運算、回呼或參數：`./footprints.html?view=${kind}&month=${$('footprints-month').value}`,
    ); // 結束 selectMonth() 的目前區塊、參數或資料結構
  } // 結束 selectMonth() 的目前區塊、參數或資料結構
  $('footprints-month').addEventListener('change', () => selectMonth($('footprints-month').value)); // 綁定 change 事件，交由回呼處理使用者操作
  for (const [id, delta] of [ // 依 for (const [id, delta] of [ 逐項處理或重複等待
    ['month-prev', -1], // 續接 mount() 的運算、回呼或參數：['month-prev', -1],
    ['month-next', 1], // 續接 mount() 的運算、回呼或參數：['month-next', 1],
  ]) // 結束 mount() 的目前區塊、參數或資料結構
    $(id).onclick = () => { // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
      const [y, m] = $('footprints-month').value.split('-').map(Number), // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
        date = new Date(Date.UTC(y, m - 1 + delta, 1)); // 更新 查詢日期，保存本步處理結果
      const year = date.getUTCFullYear(); // 宣告不可重新指定的 year，供事件回呼()使用
      if (year < 1970 || year > 9998) return; // 檢查 (year < 1970 || year > 9998) return;；成立時才執行此分支
      $('footprints-month').value = `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
      selectMonth($('footprints-month').value); // 呼叫 selectMonth()，處理 個人集章與簽退成果卡 的 selectMonth 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('checkout-more').onclick = () => { // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    limit += 12; // 續接 事件回呼() 的運算、回呼或參數：limit += 12;
    render(); // 呼叫 render()，依目前狀態重繪畫面
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('footprints-export').onclick = async () => { // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    if (busy) return; // 檢查 (busy) return;；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      const stamps = await store.all(userId), // 宣告不可重新指定的 stamps，供事件回呼()使用
        data = { // 更新 查詢或回應資料，保存本步處理結果
          format: 'gym-footprints-backup', // 設定 format 欄位的值或型別
          version: 1, // 設定 version 欄位的值或型別
          userId, // 續接 事件回呼() 的運算、回呼或參數：userId,
          exportedAt: new Date().toISOString(), // 設定 exportedAt 欄位的值或型別
          stamps, // 續接 事件回呼() 的運算、回呼或參數：stamps,
        }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      const url = URL.createObjectURL( // 宣告不可重新指定的 url，供事件回呼()使用
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), // 把資料轉成 JSON 字串以傳送或保存
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
      const a = el('a'); // 宣告不可重新指定的 a，供事件回呼()使用
      a.href = url; // 續接 事件回呼() 的運算、回呼或參數：a.href = url;
      a.download = `健身足跡_${appTaipeiDateString()}_${Date.now()}.json`; // 續接 事件回呼() 的運算、回呼或參數：a.download = `健身足跡_${appTaipeiDateString()}_${Date.now()}.json`;
      document.body.append(a); // 將建立的節點加入父容器，形成畫面內容
      a.click(); // 呼叫 a.click()，處理 個人集章與簽退成果卡 的 click 邏輯
      a.remove(); // 呼叫 a.remove()，處理 個人集章與簽退成果卡 的 remove 邏輯
      setTimeout(() => URL.revokeObjectURL(url), 60000); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
      appSetMessage(`已產生 ${stamps.length} 個印章的備份，請確認手機下載完成。`, 'success'); // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      appSetMessage(`無法備份：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  $('footprints-import').onclick = () => $('footprints-file').click(); // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
  $('footprints-file').onchange = async (event) => { // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    const file = event.target.files[0]; // 宣告不可重新指定的 file，供事件回呼()使用
    event.target.value = ''; // 續接 事件回呼() 的運算、回呼或參數：event.target.value = '';
    if (!file || busy) return; // 檢查 (!file || busy) return;；成立時才執行此分支
    busy = true; // 更新 處理中狀態，保存本步處理結果
    $('footprints-import').disabled = true; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    $('footprints-export').disabled = true; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    try { // 開始可捕捉例外的操作範圍
      if (file.size > 20 * 1024 * 1024) throw new Error('檔案超過 20 MB。'); // 檢查 (file.size > 20 * 1024 * 1024) throw new Error('檔案超過 20 MB。');；成立時才執行此分支
      const parsed = store.parseBackup(JSON.parse(await file.text()), userId); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
      if (!confirm(`合併 ${parsed.length} 個本帳號印章？相同日期及類型會保留手機原有紀錄。`)) // 檢查 (!confirm(`合併 ${parsed.length} 個本帳號印章？相同日期及類型會保留手機原有紀錄。`))；成立時才執行此分支
        return; // 提前結束 事件回呼()，不再執行後續操作
      const result = await store.merge(userId, parsed); // 宣告不可重新指定的 處理結果，供事件回呼()使用
      await refresh(); // 等待非同步操作完成後，才繼續同一流程
      appSetMessage( // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
        `已新增 ${result.added} 個印章，保留 ${result.skipped} 個現有印章。`, // 續接 事件回呼() 的運算、回呼或參數：`已新增 ${result.added} 個印章，保留 ${result.skipped} 個現有印章。`,
        'success', // 提供 'success', 文字、路徑或資料欄位值
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      appSetMessage(`匯入未完成：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      busy = false; // 更新 處理中狀態，保存本步處理結果
      $('footprints-import').disabled = false; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
      $('footprints-export').disabled = false; // 呼叫 $()，處理 個人集章與簽退成果卡 的 $ 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  try { // 開始可捕捉例外的操作範圍
    await refresh(); // 等待非同步操作完成後，才繼續同一流程
    $('footprints-content').classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    appHideMessage(); // 呼叫 appHideMessage()，處理 個人集章與簽退成果卡 的 appHideMessage 邏輯
  } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
    appSetMessage( // 呼叫 appSetMessage()，處理 個人集章與簽退成果卡 的 appSetMessage 邏輯
      `讀取本機足跡失敗：${error.message}。請確認瀏覽器允許儲存資料後重新整理。`, // 續接 mount() 的運算、回呼或參數：`讀取本機足跡失敗：${error.message}。請確認瀏覽器允許儲存資料後重新整理。`,
      'error', // 提供 'error', 文字、路徑或資料欄位值
    ); // 結束 mount() 的目前區塊、參數或資料結構
  } // 結束 mount() 的目前區塊、參數或資料結構
  // Do not keep a previous user's cards visible after an account change in another tab.
  app.client.auth.onAuthStateChange((_event, session) => { // 呼叫 app.client.auth.onAuthStateChange()，處理 個人集章與簽退成果卡 的 onAuthStateChange 邏輯
    if (session?.user?.id !== userId) { // 檢查 (session?.user?.id !== userId)；成立時才執行此分支
      $('footprints-content').classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      document.getElementById('stamp-dialog')?.close(); // 依元素 ID 或 CSS 選擇器取得頁面控制項
      if (session) window.location.replace('./index.html'); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  document.addEventListener('visibilitychange', () => { // 綁定 visibilitychange 事件，交由回呼處理使用者操作
    if (!document.hidden && !busy) // 檢查 (!document.hidden && !busy)；成立時才執行此分支
      refresh().catch(() => appSetMessage('無法更新本機足跡，請重新整理。', 'error')); // 呼叫 refresh()，處理 個人集章與簽退成果卡 的 refresh 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 mount() 的目前區塊、參數或資料結構
