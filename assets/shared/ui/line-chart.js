const NS = 'http://www.w3.org/2000/svg'; // 宣告不可重新指定的 NS，供共用日期、表單與介面使用
const number = (n) => n.toLocaleString('zh-TW', { maximumFractionDigits: 2 }); // 宣告不可重新指定的 number，供number()使用
function node(tag, attrs = {}, text) { // 定義 node()：處理 共用日期、表單與介面 的 node 邏輯
  const e = document.createElementNS(NS, tag); // 建立 指定標籤 DOM 元素，供後續填值與插入
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
  if (text !== undefined) e.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  return e; // 回傳 e，交給 node() 的呼叫端
} // 結束 node() 的目前區塊、參數或資料結構
function render( // 定義 render()：依目前狀態重繪畫面
  container, // 續接 render() 的運算、回呼或參數：container,
  points, // 續接 render() 的運算、回呼或參數：points,
  { title, color = '#5eead4', zero = true, start, end, categorical = false } = {}, // 續接 render() 的運算、回呼或參數：{ title, color = '#5eead4', zero = true, start, end, categorical = false } =…
) { // 續接 render() 的運算、回呼或參數：) {
  container.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
  if (!points.length) { // 檢查 (!points.length)；成立時才執行此分支
    const p = document.createElement('p'); // 建立 p DOM 元素，供後續填值與插入
    p.className = 'chart-empty'; // 續接 render() 的運算、回呼或參數：p.className = 'chart-empty';
    p.textContent = '這段期間尚無紀錄，記下第一筆後就會出現折線圖。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    container.append(p); // 將建立的節點加入父容器，形成畫面內容
    return; // 提前結束 render()，不再執行後續操作
  } // 結束 render() 的目前區塊、參數或資料結構
  const w = Math.max(340, container.clientWidth), // 宣告不可重新指定的 w，供render()使用
    h = 300, // 更新 h，保存本步處理結果
    left = 64, // 更新 left，保存本步處理結果
    right = 20, // 更新 right，保存本步處理結果
    top = 28, // 更新 top，保存本步處理結果
    bottom = 72; // 更新 bottom，保存本步處理結果
  const svg = node('svg', { // 宣告不可重新指定的 svg，供render()使用
    viewBox: `0 0 ${w} ${h}`, // 設定 viewBox 欄位的值或型別
    role: 'img', // 設定 role 欄位的值或型別
    'aria-label': title, // 提供 'aria-label': title, 文字、路徑或資料欄位值
    class: 'fitness-chart', // 設定 class 欄位的值或型別
  }); // 結束 render() 的目前區塊、參數或資料結構
  svg.append(node('title', {}, title)); // 將建立的節點加入父容器，形成畫面內容
  const values = points.map((p) => p.value), // 宣告不可重新指定的 values，供事件回呼()使用
    min = Math.min(...values), // 更新 min，保存本步處理結果
    max = Math.max(...values); // 更新 max，保存本步處理結果
  let lo = zero ? 0 : Math.max(0, Math.floor((min - Math.max(0.5, (max - min) * 0.15)) * 10) / 10), // 宣告可更新的 lo，供render()使用
    hi = zero ? Math.max(1, max * 1.12) : max + Math.max(0.5, (max - min) * 0.15); // 更新 hi，保存本步處理結果
  const dateNum = (s) => Date.parse(s + 'T00:00:00Z'), // 宣告不可重新指定的 dateNum，供dateNum()使用
    first = dateNum(start || points[0].date), // 更新 first，保存本步處理結果
    last = dateNum(end || points.at(-1).date); // 更新 last，保存本步處理結果
  const x = (p) => // 宣告不可重新指定的 x，供x()使用
      categorical && points.length > 1 // 續接 x() 的運算、回呼或參數：categorical && points.length > 1
        ? left + (points.indexOf(p) / (points.length - 1)) * (w - left - right) // 續接 x() 的運算、回呼或參數：? left + (points.indexOf(p) / (points.length - 1)) * (w - left - right)
        : first === last // 續接 x() 的運算、回呼或參數：: first === last
          ? (left + w - right) / 2 // 續接 x() 的運算、回呼或參數：? (left + w - right) / 2
          : left + ((dateNum(p.date) - first) / (last - first)) * (w - left - right), // 續接 x() 的運算、回呼或參數：: left + ((dateNum(p.date) - first) / (last - first)) * (w - left - right),
    y = (v) => top + ((hi - v) / (hi - lo)) * (h - top - bottom); // 更新 y，保存本步處理結果
  for (let i = 0; i <= 4; i++) { // 依 for (let i = 0; i <= 4; i++) 逐項處理或重複等待
    const val = lo + ((hi - lo) * i) / 4, // 宣告不可重新指定的 val，供render()使用
      yy = y(val); // 更新 yy，保存本步處理結果
    svg.append( // 將建立的節點加入父容器，形成畫面內容
      node('line', { // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
        x1: left, // 設定 x1 欄位的值或型別
        y1: yy, // 設定 y1 欄位的值或型別
        x2: w - right, // 設定 x2 欄位的值或型別
        y2: yy, // 設定 y2 欄位的值或型別
        stroke: '#334155', // 設定 stroke 欄位的值或型別
        'stroke-dasharray': '4 5', // 提供 'stroke-dasharray': '4 5', 文字、路徑或資料欄位值
      }), // 結束 render() 的目前區塊、參數或資料結構
      node( // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
        'text', // 提供 'text', 文字、路徑或資料欄位值
        { x: left - 12, y: yy + 4, 'text-anchor': 'end', fill: '#94a3b8', 'font-size': 12 }, // 續接 render() 的運算、回呼或參數：{ x: left - 12, y: yy + 4, 'text-anchor': 'end', fill: '#94a3b8', 'font-size…
        Math.abs(val) >= 10000 ? number(val / 1000) + 'k' : number(val), // 呼叫 Math.abs()，處理 共用日期、表單與介面 的 abs 邏輯
      ), // 結束 render() 的目前區塊、參數或資料結構
    ); // 結束 render() 的目前區塊、參數或資料結構
  } // 結束 render() 的目前區塊、參數或資料結構
  svg.append(node('text', { x: 15, y: 16, fill: '#94a3b8', 'font-size': 12 }, 'kg')); // 將建立的節點加入父容器，形成畫面內容
  svg.append( // 將建立的節點加入父容器，形成畫面內容
    node('path', { // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
      d: points.map((p, i) => `${i ? 'L' : 'M'} ${x(p)} ${y(p.value)}`).join(' '), // 設定 d 欄位的值或型別
      fill: 'none', // 設定 fill 欄位的值或型別
      stroke: color, // 設定 stroke 欄位的值或型別
      'stroke-width': 3, // 提供 'stroke-width': 3, 文字、路徑或資料欄位值
      'stroke-linejoin': 'round', // 提供 'stroke-linejoin': 'round', 文字、路徑或資料欄位值
    }), // 結束 render() 的目前區塊、參數或資料結構
  ); // 結束 render() 的目前區塊、參數或資料結構
  const labels = new Set( // 宣告不可重新指定的 labels，供render()使用
    points.length <= 10 // 續接 render() 的運算、回呼或參數：points.length <= 10
      ? points.map((_, i) => i) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      : Array.from({ length: 7 }, (_, i) => Math.round((i * (points.length - 1)) / 6)), // 選取 Supabase 的 指定 資料表，後續串接查詢或寫入
  ); // 結束 render() 的目前區塊、參數或資料結構
  points.forEach((p, i) => { // 呼叫 points.forEach()，處理 共用日期、表單與介面 的 forEach 邏輯
    const group = node('g', { // 宣告不可重新指定的 group，供事件回呼()使用
      tabindex: 0, // 設定 tabindex 欄位的值或型別
      role: 'img', // 設定 role 欄位的值或型別
      'aria-label': `${p.date}：${number(p.value)} kg`, // 提供 'aria-label': `${p.date}：${number(p.value)} kg`, 文字、路徑或資料欄位值
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    group.append( // 將建立的節點加入父容器，形成畫面內容
      node('title', {}, `${p.date} · ${number(p.value)} kg`), // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
      node('circle', { // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
        cx: x(p), // 設定 cx 欄位的值或型別
        cy: y(p.value), // 設定 cy 欄位的值或型別
        r: 5, // 設定 r 欄位的值或型別
        fill: color, // 設定 fill 欄位的值或型別
        stroke: '#0f172a', // 設定 stroke 欄位的值或型別
        'stroke-width': 2, // 提供 'stroke-width': 2, 文字、路徑或資料欄位值
      }), // 結束 事件回呼() 的目前區塊、參數或資料結構
    ); // 結束 事件回呼() 的目前區塊、參數或資料結構
    svg.append(group); // 將建立的節點加入父容器，形成畫面內容
    if (labels.has(i)) // 檢查 (labels.has(i))；成立時才執行此分支
      svg.append( // 將建立的節點加入父容器，形成畫面內容
        node( // 呼叫 node()，處理 共用日期、表單與介面 的 node 邏輯
          'text', // 提供 'text', 文字、路徑或資料欄位值
          { // 續接 事件回呼() 的運算、回呼或參數：{
            x: x(p), // 設定 x 欄位的值或型別
            y: h - bottom + 22, // 設定 y 欄位的值或型別
            transform: `rotate(-40 ${x(p)} ${h - bottom + 22})`, // 設定 transform 欄位的值或型別
            'text-anchor': 'end', // 提供 'text-anchor': 'end', 文字、路徑或資料欄位值
            fill: '#94a3b8', // 設定 fill 欄位的值或型別
            'font-size': 11, // 提供 'font-size': 11, 文字、路徑或資料欄位值
          }, // 結束 事件回呼() 的目前區塊、參數或資料結構
          p.date.slice(5), // 呼叫 p.date.slice()，處理 共用日期、表單與介面 的 slice 邏輯
        ), // 結束 事件回呼() 的目前區塊、參數或資料結構
      ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  const scroll = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
  scroll.className = 'chart-scroll'; // 續接 render() 的運算、回呼或參數：scroll.className = 'chart-scroll';
  scroll.append(svg); // 將建立的節點加入父容器，形成畫面內容
  container.append(scroll); // 將建立的節點加入父容器，形成畫面內容
  const hint = document.createElement('p'); // 建立 p DOM 元素，供後續填值與插入
  hint.className = 'hint'; // 續接 render() 的運算、回呼或參數：hint.className = 'hint';
  hint.textContent = zero // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    ? '日期由左至右；同日合併，未訓練日不補零。' // 續接 render() 的運算、回呼或參數：? '日期由左至右；同日合併，未訓練日不補零。'
    : '未量測日期不補零；縱軸依體重範圍縮放。'; // 續接 render() 的運算、回呼或參數：: '未量測日期不補零；縱軸依體重範圍縮放。';
  container.append(hint); // 將建立的節點加入父容器，形成畫面內容
  const details = document.createElement('details'), // 建立 details DOM 元素，供後續填值與插入
    summary = document.createElement('summary'); // 建立 summary DOM 元素，供後續填值與插入
  summary.textContent = '查看精確數值'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  details.append(summary); // 將建立的節點加入父容器，形成畫面內容
  const table = document.createElement('table'); // 建立 table DOM 元素，供後續填值與插入
  table.className = 'fitness-table'; // 續接 render() 的運算、回呼或參數：table.className = 'fitness-table';
  const head = table.createTHead().insertRow(); // 宣告不可重新指定的 head，供render()使用
  for (const t of ['日期', '公斤數（kg）']) { // 依 for (const t of ['日期', '公斤數（kg）']) 逐項處理或重複等待
    const th = document.createElement('th'); // 建立 th DOM 元素，供後續填值與插入
    th.scope = 'col'; // 續接 render() 的運算、回呼或參數：th.scope = 'col';
    th.textContent = t; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    head.append(th); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 render() 的目前區塊、參數或資料結構
  const body = table.createTBody(); // 宣告不可重新指定的 body，供render()使用
  points.forEach((p) => { // 呼叫 points.forEach()，處理 共用日期、表單與介面 的 forEach 邏輯
    const r = body.insertRow(); // 宣告不可重新指定的 r，供事件回呼()使用
    r.insertCell().textContent = p.date; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    r.insertCell().textContent = number(p.value); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  details.append(table); // 將建立的節點加入父容器，形成畫面內容
  container.append(details); // 將建立的節點加入父容器，形成畫面內容
} // 結束 render() 的目前區塊、參數或資料結構
export const LocalCharts = { render, number }; // 宣告不可重新指定的 LocalCharts，供共用日期、表單與介面使用
