import { formatDateTime as appFormatDateTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供個人集章與簽退成果卡使用
import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供個人集章與簽退成果卡使用
import { profileName as appProfileName } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供個人集章與簽退成果卡使用
import { FootprintsStore } from './repository.js'; // 從 ./repository.js 載入相依介面，供個人集章與簽退成果卡使用
const store = FootprintsStore; // 宣告不可重新指定的 store，供個人集章與簽退成果卡使用
const el = (tag, text, cls) => { // 宣告不可重新指定的 el，供el()使用
  const e = document.createElement(tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
  if (text !== undefined) e.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  if (cls) e.className = cls; // 檢查 (cls) e.className = cls;；成立時才執行此分支
  return e; // 回傳 e，交給 el() 的呼叫端
}; // 結束 el() 的目前區塊、參數或資料結構
function duration(entry) { // 定義 duration()：處理 個人集章與簽退成果卡 的 duration 邏輯
  const minutes = Math.floor( // 宣告不可重新指定的 minutes，供duration()使用
    (Date.parse(entry.checkedOutAt) - Date.parse(entry.checkedInAt)) / 60000, // 續接 duration() 的運算、回呼或參數：(Date.parse(entry.checkedOutAt) - Date.parse(entry.checkedInAt)) / 60000,
  ); // 結束 duration() 的目前區塊、參數或資料結構
  if (minutes < 1) return '不到 1 分鐘'; // 檢查 (minutes < 1) return '不到 1 分鐘';；成立時才執行此分支
  return minutes >= 60 // 回傳 minutes >= 60，交給 duration() 的呼叫端
    ? `${Math.floor(minutes / 60)} 小時 ${minutes % 60} 分鐘` // 續接 duration() 的運算、回呼或參數：? `${Math.floor(minutes / 60)} 小時 ${minutes % 60} 分鐘`
    : `${minutes} 分鐘`; // 續接 duration() 的運算、回呼或參數：: `${minutes} 分鐘`;
} // 結束 duration() 的目前區塊、參數或資料結構
function card(entry, rows, { name = '', duplicate = false, review = false } = {}) { // 定義 card()：處理 個人集章與簽退成果卡 的 card 邏輯
  const isIn = entry.kind === 'in', // 宣告不可重新指定的 isIn，供card()使用
    section = el('section', undefined, `stamp-card stamp-${entry.kind}`); // 更新 section，保存本步處理結果
  section.append( // 將建立的節點加入父容器，形成畫面內容
    el( // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
      'p', // 提供 'p', 文字、路徑或資料欄位值
      review // 續接 card() 的運算、回呼或參數：review
        ? 'MY FITNESS JOURNAL · 回顧' // 續接 card() 的運算、回呼或參數：? 'MY FITNESS JOURNAL · 回顧'
        : isIn // 續接 card() 的運算、回呼或參數：: isIn
          ? 'CHECK IN · 每天一個到訪章' // 續接 card() 的運算、回呼或參數：? 'CHECK IN · 每天一個到訪章'
          : 'CHECK OUT · 每天一張成果卡', // 續接 card() 的運算、回呼或參數：: 'CHECK OUT · 每天一張成果卡',
      'stamp-eyebrow', // 提供 'stamp-eyebrow', 文字、路徑或資料欄位值
    ), // 結束 card() 的目前區塊、參數或資料結構
  ); // 結束 card() 的目前區塊、參數或資料結構
  section.append( // 將建立的節點加入父容器，形成畫面內容
    el( // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
      'h1', // 提供 'h1', 文字、路徑或資料欄位值
      review // 續接 card() 的運算、回呼或參數：review
        ? isIn // 續接 card() 的運算、回呼或參數：? isIn
          ? '這天，我來了' // 續接 card() 的運算、回呼或參數：? '這天，我來了'
          : '這天的簽退成果' // 續接 card() 的運算、回呼或參數：: '這天的簽退成果'
        : duplicate // 續接 card() 的運算、回呼或參數：: duplicate
          ? '今天已蓋過章囉' // 續接 card() 的運算、回呼或參數：? '今天已蓋過章囉'
          : isIn // 續接 card() 的運算、回呼或參數：: isIn
            ? '今天的努力，從到場開始' // 續接 card() 的運算、回呼或參數：? '今天的努力，從到場開始'
            : '今天完成，收下你的成果', // 續接 card() 的運算、回呼或參數：: '今天完成，收下你的成果',
    ), // 結束 card() 的目前區塊、參數或資料結構
  ); // 結束 card() 的目前區塊、參數或資料結構
  section.append(el('p', `${name ? name + ' · ' : ''}${entry.date}`, 'stamp-owner')); // 將建立的節點加入父容器，形成畫面內容
  const seal = el('div', undefined, `stamp-seal${!review && !duplicate ? ' stamp-land' : ''}`); // 宣告不可重新指定的 seal，供card()使用
  seal.append( // 將建立的節點加入父容器，形成畫面內容
    el('span', isIn ? '✓' : '★', 'stamp-symbol'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
    el('strong', isIn ? '到訪認證' : '簽退完成'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
    el('small', entry.date), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
  ); // 結束 card() 的目前區塊、參數或資料結構
  section.append(seal); // 將建立的節點加入父容器，形成畫面內容
  const stats = store.stats(rows, entry.kind, entry.date), // 宣告不可重新指定的 stats，供card()使用
    grid = el('dl', undefined, 'stamp-stats'); // 更新 grid，保存本步處理結果
  for (const [label, value] of [ // 依 for (const [label, value] of [ 逐項處理或重複等待
    ['本週', stats.week], // 續接 card() 的運算、回呼或參數：['本週', stats.week],
    ['本月', stats.month], // 續接 card() 的運算、回呼或參數：['本月', stats.month],
    ['累積', stats.total], // 續接 card() 的運算、回呼或參數：['累積', stats.total],
  ]) { // 續接 card() 的運算、回呼或參數：]) {
    const item = el('div'); // 宣告不可重新指定的 item，供card()使用
    item.append(el('dt', `${label}${isIn ? '到訪' : '完成簽退'}`), el('dd', `${value} 天`)); // 將建立的節點加入父容器，形成畫面內容
    grid.append(item); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 card() 的目前區塊、參數或資料結構
  section.append(grid); // 將建立的節點加入父容器，形成畫面內容
  if (!isIn) { // 檢查 (!isIn)；成立時才執行此分支
    const detail = el('div', undefined, 'stamp-session-detail'); // 宣告不可重新指定的 detail，供card()使用
    detail.append(el('strong', `本日首次簽退 · 停留 ${duration(entry)}`)); // 將建立的節點加入父容器，形成畫面內容
    detail.append( // 將建立的節點加入父容器，形成畫面內容
      el('p', `${appFormatDateTime(entry.checkedInAt)} → ${appFormatDateTime(entry.checkedOutAt)}`), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
    ); // 結束 card() 的目前區塊、參數或資料結構
    detail.append(el('p', '停留時間不代表實際運動時間。')); // 將建立的節點加入父容器，形成畫面內容
    section.append(detail); // 將建立的節點加入父容器，形成畫面內容
  } else // 前一條件未成立時，執行 card() 的另一分支
    section.append( // 將建立的節點加入父容器，形成畫面內容
      el('p', `本日首次簽到 ${appFormatTime(entry.at)}，已留下今天的到訪章。`, 'stamp-caption'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
    ); // 結束 card() 的目前區塊、參數或資料結構
  section.append( // 將建立的節點加入父容器，形成畫面內容
    el( // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
      'p', // 提供 'p', 文字、路徑或資料欄位值
      duplicate // 續接 card() 的運算、回呼或參數：duplicate
        ? '這次簽到／簽退仍已成功；今日印章與天數不重複增加，保留首次紀錄。' // 續接 card() 的運算、回呼或參數：? '這次簽到／簽退仍已成功；今日印章與天數不重複增加，保留首次紀錄。'
        : review // 續接 card() 的運算、回呼或參數：: review
          ? '本週、本月與累積天數計算至卡片日期。' // 續接 card() 的運算、回呼或參數：? '本週、本月與累積天數計算至卡片日期。'
          : '同一台灣日期只計一次。休息與恢復，也是一部分。', // 續接 card() 的運算、回呼或參數：: '同一台灣日期只計一次。休息與恢復，也是一部分。',
      'stamp-caption', // 提供 'stamp-caption', 文字、路徑或資料欄位值
    ), // 結束 card() 的目前區塊、參數或資料結構
  ); // 結束 card() 的目前區塊、參數或資料結構
  return section; // 回傳 section，交給 card() 的呼叫端
} // 結束 card() 的目前區塊、參數或資料結構
function dialog(kind) { // 定義 dialog()：處理 個人集章與簽退成果卡 的 dialog 邏輯
  document.getElementById('stamp-dialog')?.remove(); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const dlg = el('dialog', undefined, `stamp-dialog stamp-${kind}`); // 宣告不可重新指定的 dlg，供dialog()使用
  dlg.id = 'stamp-dialog'; // 續接 dialog() 的運算、回呼或參數：dlg.id = 'stamp-dialog';
  dlg.setAttribute('aria-label', kind === 'in' ? '簽到蓋章頁面' : '簽退成果蓋章頁面'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
  document.body.append(dlg); // 將建立的節點加入父容器，形成畫面內容
  const close = () => { // 宣告不可重新指定的 close，供close()使用
    document.body.classList.remove('stamp-page-open'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    dlg.remove(); // 呼叫 dlg.remove()，處理 個人集章與簽退成果卡 的 remove 邏輯
  }; // 結束 close() 的目前區塊、參數或資料結構
  dlg.addEventListener('close', close, { once: true }); // 綁定 close 事件，交由回呼處理使用者操作
  dlg.showModal(); // 呼叫 dlg.showModal()，處理 個人集章與簽退成果卡 的 showModal 邏輯
  document.body.classList.add('stamp-page-open'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  return dlg; // 回傳 dlg，交給 dialog() 的呼叫端
} // 結束 dialog() 的目前區塊、參數或資料結構
function links(dlg, kind, review = false, date = '') { // 定義 links()：處理 個人集章與簽退成果卡 的 links 邏輯
  const actions = el('div', undefined, 'stamp-actions'); // 宣告不可重新指定的 actions，供links()使用
  const close = el('button', review ? '關閉回顧' : '回到簽到／簽退', 'secondary-button'); // 宣告不可重新指定的 close，供links()使用
  close.type = 'button'; // 續接 links() 的運算、回呼或參數：close.type = 'button';
  close.onclick = () => dlg.close(); // 續接 事件回呼() 的運算、回呼或參數：close.onclick = () => dlg.close();
  const link = el( // 宣告不可重新指定的 link，供links()使用
    'a', // 提供 'a', 文字、路徑或資料欄位值
    review ? '開啟訓練助手' : kind === 'in' ? '開始使用訓練助手' : '回顧我的健身足跡', // 續接 links() 的運算、回呼或參數：review ? '開啟訓練助手' : kind === 'in' ? '開始使用訓練助手' : '回顧我的健身足跡',
    'primary-button button-link', // 提供 'primary-button button-link', 文字、路徑或資料欄位值
  ); // 結束 links() 的目前區塊、參數或資料結構
  link.href = // 續接 links() 的運算、回呼或參數：link.href =
    review || kind === 'in' // 續接 links() 的運算、回呼或參數：review || kind === 'in'
      ? './training.html' // 續接 links() 的運算、回呼或參數：? './training.html'
      : `./footprints.html?view=out&month=${date.slice(0, 7)}`; // 續接 links() 的運算、回呼或參數：: `./footprints.html?view=out&month=${date.slice(0, 7)}`;
  actions.append(link, close); // 將建立的節點加入父容器，形成畫面內容
  dlg.append(actions); // 將建立的節點加入父容器，形成畫面內容
  if (!review && kind === 'in') { // 檢查 (!review && kind === 'in')；成立時才執行此分支
    const a = el('a', '回顧我的集章卡', 'stamp-review-link'); // 宣告不可重新指定的 a，供links()使用
    a.href = `./footprints.html?view=in&month=${date.slice(0, 7)}`; // 續接 links() 的運算、回呼或參數：a.href = `./footprints.html?view=in&month=${date.slice(0, 7)}`;
    dlg.append(a); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 links() 的目前區塊、參數或資料結構
} // 結束 links() 的目前區塊、參數或資料結構
async function present(kind, app, payload) { // 定義 present()：處理 個人集章與簽退成果卡 的 present 邏輯
  const dlg = dialog(kind); // 宣告不可重新指定的 dlg，供present()使用
  const render = async () => { // 宣告不可重新指定的 render，供render()使用
    dlg.replaceChildren(el('p', '正在把今日印章存入手機……', 'stamp-caption')); // 替換容器內的子節點，清除舊畫面再放入新結果
    try { // 開始可捕捉例外的操作範圍
      const result = await store.record(app.session.user.id, kind, payload); // 宣告不可重新指定的 處理結果，供render()使用
      let rows, // 宣告可更新的 顯示用資料列，供render()使用
        reviewError = ''; // 更新 reviewError，保存本步處理結果
      try { // 開始可捕捉例外的操作範圍
        rows = await store.all(app.session.user.id); // 更新 顯示用資料列，保存本步處理結果
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        rows = null; // 更新 顯示用資料列，保存本步處理結果
        reviewError = '印章已存入手機，目前無法讀取累積統計，稍後可至「我的健身足跡」查看。'; // 更新 reviewError，保存本步處理結果
      } // 結束 render() 的目前區塊、參數或資料結構
      dlg.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      if (rows) // 檢查 (rows)；成立時才執行此分支
        dlg.append( // 將建立的節點加入父容器，形成畫面內容
          card(result.entry, rows, { // 呼叫 card()，處理 個人集章與簽退成果卡 的 card 邏輯
            name: appProfileName(app.profile, app.session), // 設定 name 欄位的值或型別
            duplicate: result.duplicate, // 設定 duplicate 欄位的值或型別
          }), // 結束 render() 的目前區塊、參數或資料結構
        ); // 結束 render() 的目前區塊、參數或資料結構
      else { // 前一條件未成立時，執行 render() 的另一分支
        dlg.append(el('h1', kind === 'in' ? '簽到成功，今日已蓋章' : '簽退成功，成果卡已儲存')); // 將建立的節點加入父容器，形成畫面內容
        dlg.append(el('p', reviewError)); // 將建立的節點加入父容器，形成畫面內容
      } // 結束 render() 的目前區塊、參數或資料結構
      links(dlg, kind, false, result.entry.date); // 呼叫 links()，處理 個人集章與簽退成果卡 的 links 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      dlg.replaceChildren( // 替換容器內的子節點，清除舊畫面再放入新結果
        el('h1', `${kind === 'in' ? '簽到' : '簽退'}已成功`), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
        el('p', '但今日印章尚未儲存，請勿為了集章再次簽到／簽退。', 'stamp-caption'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
        el('p', error.message || '手機儲存空間無法使用。', 'message error'), // 呼叫 el()，處理 個人集章與簽退成果卡 的 el 邏輯
      ); // 結束 render() 的目前區塊、參數或資料結構
      const retry = el('button', '重試儲存印章', 'primary-button'); // 宣告不可重新指定的 retry，供render()使用
      retry.type = 'button'; // 續接 render() 的運算、回呼或參數：retry.type = 'button';
      retry.onclick = render; // 續接 render() 的運算、回呼或參數：retry.onclick = render;
      dlg.append(retry); // 將建立的節點加入父容器，形成畫面內容
      links(dlg, kind); // 呼叫 links()，處理 個人集章與簽退成果卡 的 links 邏輯
    } // 結束 render() 的目前區塊、參數或資料結構
  }; // 結束 render() 的目前區塊、參數或資料結構
  await render(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 present() 的目前區塊、參數或資料結構
function review(entry, rows, name) { // 定義 review()：處理 個人集章與簽退成果卡 的 review 邏輯
  const dlg = dialog(entry.kind); // 宣告不可重新指定的 dlg，供review()使用
  dlg.append(card(entry, rows, { name, review: true })); // 將建立的節點加入父容器，形成畫面內容
  links(dlg, entry.kind, true, entry.date); // 呼叫 links()，處理 個人集章與簽退成果卡 的 links 邏輯
} // 結束 review() 的目前區塊、參數或資料結構
export const FootprintsUI = { present, review, card, duration }; // 宣告不可重新指定的 FootprintsUI，供個人集章與簽退成果卡使用
