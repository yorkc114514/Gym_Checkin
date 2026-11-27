import { WHEEL_COLORS } from './catalog.js'; // 從 ./catalog.js 載入相依介面，供餐廳分類與美食轉盤使用
function fitLabel(label, itemCount) { // 定義 fitLabel()：處理 餐廳分類與美食轉盤 的 fitLabel 邏輯
  const maxChars = itemCount > 42 ? 7 : itemCount > 28 ? 9 : itemCount > 18 ? 12 : 18; // 宣告不可重新指定的 maxChars，供fitLabel()使用
  return label.length > maxChars ? `${label.slice(0, Math.max(1, maxChars - 1))}…` : label; // 回傳 label.length > maxChars ? `${label.slice(0, Math.max(1, maxChars - 1))}…` : labe…，交給 fitLabel() 的呼叫端
} // 結束 fitLabel() 的目前區塊、參數或資料結構

function prepareCanvas(canvas) { // 定義 prepareCanvas()：處理 餐廳分類與美食轉盤 的 prepareCanvas 邏輯
  const parentWidth = canvas.parentElement?.clientWidth || 320; // 宣告不可重新指定的 parentWidth，供prepareCanvas()使用
  const cssSize = Math.max(220, Math.min(parentWidth, 420)); // 宣告不可重新指定的 cssSize，供prepareCanvas()使用
  const density = Math.min(window.devicePixelRatio || 1, 2); // 宣告不可重新指定的 density，供prepareCanvas()使用
  const pixelSize = Math.round(cssSize * density); // 宣告不可重新指定的 pixelSize，供prepareCanvas()使用

  if (canvas.width !== pixelSize || canvas.height !== pixelSize) { // 檢查 (canvas.width !== pixelSize || canvas.height !== pixelSize)；成立時才執行此分支
    canvas.width = pixelSize; // 續接 prepareCanvas() 的運算、回呼或參數：canvas.width = pixelSize;
    canvas.height = pixelSize; // 續接 prepareCanvas() 的運算、回呼或參數：canvas.height = pixelSize;
    canvas.style.width = `${cssSize}px`; // 續接 prepareCanvas() 的運算、回呼或參數：canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`; // 續接 prepareCanvas() 的運算、回呼或參數：canvas.style.height = `${cssSize}px`;
  } // 結束 prepareCanvas() 的目前區塊、參數或資料結構

  const context = canvas.getContext('2d'); // 宣告不可重新指定的 context，供prepareCanvas()使用
  if (!context) return null; // 檢查 (!context) return null;；成立時才執行此分支
  context.setTransform(density, 0, 0, density, 0, 0); // 呼叫 context.setTransform()，處理 餐廳分類與美食轉盤 的 setTransform 邏輯
  return { context, size: cssSize, center: cssSize / 2 }; // 回傳 { context, size: cssSize, center: cssSize / 2 }，交給 prepareCanvas() 的呼叫端
} // 結束 prepareCanvas() 的目前區塊、參數或資料結構

function drawWheel(canvas, wheelItems, wheelAngle) { // 定義 drawWheel()：處理 餐廳分類與美食轉盤 的 drawWheel 邏輯
  const prepared = prepareCanvas(canvas); // 宣告不可重新指定的 prepared，供drawWheel()使用
  if (!prepared || wheelItems.length === 0) return; // 檢查 (!prepared || wheelItems.length === 0) return;；成立時才執行此分支

  const { context, size, center } = prepared; // 續接 drawWheel() 的運算、回呼或參數：const { context, size, center } = prepared;
  const radius = center - 7; // 宣告不可重新指定的 radius，供drawWheel()使用
  const itemCount = wheelItems.length; // 宣告不可重新指定的 itemCount，供drawWheel()使用
  const arc = (Math.PI * 2) / itemCount; // 宣告不可重新指定的 arc，供drawWheel()使用
  const fontSize = // 宣告不可重新指定的 fontSize，供drawWheel()使用
    itemCount > 42 ? 7 : itemCount > 30 ? 8 : itemCount > 20 ? 9 : itemCount > 12 ? 10 : 12; // 續接 drawWheel() 的運算、回呼或參數：itemCount > 42 ? 7 : itemCount > 30 ? 8 : itemCount > 20 ? 9 : itemCount > 1…

  context.clearRect(0, 0, size, size); // 呼叫 context.clearRect()，處理 餐廳分類與美食轉盤 的 clearRect 邏輯
  context.save(); // 呼叫 context.save()，處理 餐廳分類與美食轉盤 的 save 邏輯
  context.translate(center, center); // 呼叫 context.translate()，處理 餐廳分類與美食轉盤 的 translate 邏輯

  wheelItems.forEach((restaurant, index) => { // 呼叫 wheelItems.forEach()，處理 餐廳分類與美食轉盤 的 forEach 邏輯
    const startAngle = wheelAngle + index * arc - Math.PI / 2; // 宣告不可重新指定的 startAngle，供事件回呼()使用
    const endAngle = startAngle + arc; // 宣告不可重新指定的 endAngle，供事件回呼()使用
    const middleAngle = startAngle + arc / 2; // 宣告不可重新指定的 middleAngle，供事件回呼()使用

    context.beginPath(); // 呼叫 context.beginPath()，處理 餐廳分類與美食轉盤 的 beginPath 邏輯
    context.moveTo(0, 0); // 呼叫 context.moveTo()，處理 餐廳分類與美食轉盤 的 moveTo 邏輯
    context.arc(0, 0, radius, startAngle, endAngle); // 呼叫 context.arc()，處理 餐廳分類與美食轉盤 的 arc 邏輯
    context.closePath(); // 呼叫 context.closePath()，處理 餐廳分類與美食轉盤 的 closePath 邏輯
    context.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length]; // 續接 事件回呼() 的運算、回呼或參數：context.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
    context.fill(); // 呼叫 context.fill()，將選取紀錄帶入表單
    context.strokeStyle = 'rgba(17, 24, 39, 0.88)'; // 續接 事件回呼() 的運算、回呼或參數：context.strokeStyle = 'rgba(17, 24, 39, 0.88)';
    context.lineWidth = itemCount > 30 ? 1 : 2; // 續接 事件回呼() 的運算、回呼或參數：context.lineWidth = itemCount > 30 ? 1 : 2;
    context.stroke(); // 呼叫 context.stroke()，處理 餐廳分類與美食轉盤 的 stroke 邏輯

    context.save(); // 呼叫 context.save()，處理 餐廳分類與美食轉盤 的 save 邏輯
    const normalizedMiddle = ((middleAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); // 宣告不可重新指定的 normalizedMiddle，供事件回呼()使用
    const onLeft = normalizedMiddle > Math.PI / 2 && normalizedMiddle < Math.PI * 1.5; // 宣告不可重新指定的 onLeft，供事件回呼()使用
    context.rotate(onLeft ? middleAngle + Math.PI : middleAngle); // 呼叫 context.rotate()，處理 餐廳分類與美食轉盤 的 rotate 邏輯
    context.textAlign = onLeft ? 'left' : 'right'; // 續接 事件回呼() 的運算、回呼或參數：context.textAlign = onLeft ? 'left' : 'right';
    context.textBaseline = 'middle'; // 續接 事件回呼() 的運算、回呼或參數：context.textBaseline = 'middle';
    context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`; // 續接 事件回呼() 的運算、回呼或參數：context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFo…
    context.fillStyle = '#fff'; // 續接 事件回呼() 的運算、回呼或參數：context.fillStyle = '#fff';
    context.shadowColor = 'rgba(0, 0, 0, 0.7)'; // 續接 事件回呼() 的運算、回呼或參數：context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 2; // 續接 事件回呼() 的運算、回呼或參數：context.shadowBlur = 2;
    context.fillText(fitLabel(restaurant, itemCount), onLeft ? -(radius - 14) : radius - 14, 0); // 呼叫 context.fillText()，處理 餐廳分類與美食轉盤 的 fillText 邏輯
    context.restore(); // 呼叫 context.restore()，處理 餐廳分類與美食轉盤 的 restore 邏輯
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  context.beginPath(); // 呼叫 context.beginPath()，處理 餐廳分類與美食轉盤 的 beginPath 邏輯
  context.arc(0, 0, radius, 0, Math.PI * 2); // 呼叫 context.arc()，處理 餐廳分類與美食轉盤 的 arc 邏輯
  context.strokeStyle = '#facc15'; // 續接 drawWheel() 的運算、回呼或參數：context.strokeStyle = '#facc15';
  context.lineWidth = 5; // 續接 drawWheel() 的運算、回呼或參數：context.lineWidth = 5;
  context.stroke(); // 呼叫 context.stroke()，處理 餐廳分類與美食轉盤 的 stroke 邏輯

  context.beginPath(); // 呼叫 context.beginPath()，處理 餐廳分類與美食轉盤 的 beginPath 邏輯
  context.arc(0, 0, Math.max(48, size * 0.145), 0, Math.PI * 2); // 呼叫 context.arc()，處理 餐廳分類與美食轉盤 的 arc 邏輯
  context.fillStyle = '#030712'; // 續接 drawWheel() 的運算、回呼或參數：context.fillStyle = '#030712';
  context.fill(); // 呼叫 context.fill()，將選取紀錄帶入表單
  context.strokeStyle = '#facc15'; // 續接 drawWheel() 的運算、回呼或參數：context.strokeStyle = '#facc15';
  context.lineWidth = 4; // 續接 drawWheel() 的運算、回呼或參數：context.lineWidth = 4;
  context.stroke(); // 呼叫 context.stroke()，處理 餐廳分類與美食轉盤 的 stroke 邏輯
  context.restore(); // 呼叫 context.restore()，處理 餐廳分類與美食轉盤 的 restore 邏輯
} // 結束 drawWheel() 的目前區塊、參數或資料結構
export { drawWheel }; // 匯出本模組的公開介面，供其他頁面引用
