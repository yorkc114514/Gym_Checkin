export function renderMini(timer) { // 定義 renderMini()：處理 組間休息計時器 的 renderMini 邏輯
  const data = timer.snapshot(); // 宣告不可重新指定的 查詢或回應資料，供renderMini()使用
  const { pause, reset, start } = timer; // 續接 renderMini() 的運算、回呼或參數：const { pause, reset, start } = timer;
  if (document.body?.dataset.page === 'training') return; // 檢查 (document.body?.dataset.page === 'training') return;；成立時才執行此分支
  let mini = document.getElementById('rest-mini'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  if (!mini) { // 檢查 (!mini)；成立時才執行此分支
    mini = document.createElement('aside'); // 建立 aside DOM 元素，供後續填值與插入
    mini.id = 'rest-mini'; // 續接 renderMini() 的運算、回呼或參數：mini.id = 'rest-mini';
    mini.className = 'rest-mini'; // 續接 renderMini() 的運算、回呼或參數：mini.className = 'rest-mini';
    mini.setAttribute('aria-label', '組間休息計時器'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    const link = document.createElement('a'); // 建立 a DOM 元素，供後續填值與插入
    link.href = './training.html'; // 續接 renderMini() 的運算、回呼或參數：link.href = './training.html';
    const button = document.createElement('button'); // 建立 button DOM 元素，供後續填值與插入
    button.type = 'button'; // 續接 renderMini() 的運算、回呼或參數：button.type = 'button';
    button.className = 'secondary-button'; // 續接 renderMini() 的運算、回呼或參數：button.className = 'secondary-button';
    button.addEventListener('click', () => // 綁定 click 事件，交由回呼處理使用者操作
      data.state === 'running' ? pause() : data.state === 'done' ? reset() : start(), // 續接 事件回呼() 的運算、回呼或參數：data.state === 'running' ? pause() : data.state === 'done' ? reset() : start…
    ); // 結束 renderMini() 的目前區塊、參數或資料結構
    mini.append(link, button); // 將建立的節點加入父容器，形成畫面內容
    document.body.append(mini); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 renderMini() 的目前區塊、參數或資料結構
  const active = data.state !== 'idle'; // 宣告不可重新指定的 active，供renderMini()使用
  mini.hidden = !active; // 續接 renderMini() 的運算、回呼或參數：mini.hidden = !active;
  document.body.classList.toggle('has-rest-mini', active); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  mini.querySelector('a').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    data.state === 'done' // 續接 renderMini() 的運算、回呼或參數：data.state === 'done'
      ? '✓ 休息結束' // 續接 renderMini() 的運算、回呼或參數：? '✓ 休息結束'
      : `休息 ${data.formatted}${data.state === 'paused' ? ' · 已暫停' : ''}`; // 續接 renderMini() 的運算、回呼或參數：: `休息 ${data.formatted}${data.state === 'paused' ? ' · 已暫停' : ''}`;
  mini.querySelector('button').textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    data.state === 'running' ? '暫停' : data.state === 'done' ? '收起' : '繼續'; // 續接 renderMini() 的運算、回呼或參數：data.state === 'running' ? '暫停' : data.state === 'done' ? '收起' : '繼續';
} // 結束 renderMini() 的目前區塊、參數或資料結構
