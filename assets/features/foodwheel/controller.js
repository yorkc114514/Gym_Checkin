import { uniqueItems, parseCustomItems, secureRandomIndex } from './model.js'; // 從 ./model.js 載入相依介面，供餐廳分類與美食轉盤使用
import { drawWheel as paintWheel } from './renderer.js'; // 從 ./renderer.js 載入相依介面，供餐廳分類與美食轉盤使用
import { FOOD_CATEGORIES } from './catalog.js'; // 從 ./catalog.js 載入相依介面，供餐廳分類與美食轉盤使用
import { readCustomItems, writeCustomItems, removeCustomItems } from './repository.js'; // 從 ./repository.js 載入相依介面，供餐廳分類與美食轉盤使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供餐廳分類與美食轉盤使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供餐廳分類與美食轉盤使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const app = await appInit(); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支

  const categoryCheckboxes = [...document.querySelectorAll('.food-category-checkbox')]; // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const categorySummary = document.getElementById('food-category-summary'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const presetButton = document.getElementById('food-preset-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customToggleButton = document.getElementById('food-custom-toggle-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customPanel = document.getElementById('food-custom-panel'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customCloseButton = document.getElementById('food-custom-close-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customInput = document.getElementById('food-custom-input'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customClearButton = document.getElementById('food-custom-clear-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const customApplyButton = document.getElementById('food-custom-apply-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const wheelStage = document.getElementById('food-wheel-stage'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const modeLabel = document.getElementById('food-wheel-mode-label'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const countLabel = document.getElementById('food-wheel-count-label'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const resetButton = document.getElementById('food-wheel-reset-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const canvas = document.getElementById('food-wheel-canvas'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const centerButton = document.getElementById('food-wheel-center-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const result = document.getElementById('food-wheel-result'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const celebrationLayer = document.getElementById('food-celebration-layer'); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  const drawWheel = () => paintWheel(canvas, wheelItems, wheelAngle); // 宣告不可重新指定的 drawWheel，供drawWheel()使用
  let wheelItems = []; // 宣告可更新的 wheelItems，供mount()使用
  let wheelAngle = 0; // 宣告可更新的 wheelAngle，供mount()使用
  let isSpinning = false; // 宣告可更新的 isSpinning，供mount()使用
  let animationFrame = null; // 宣告可更新的 animationFrame，供mount()使用

  function selectedCategories() { // 定義 selectedCategories()：處理 餐廳分類與美食轉盤 的 selectedCategories 邏輯
    return categoryCheckboxes // 回傳 categoryCheckboxes，交給 selectedCategories() 的呼叫端
      .filter((checkbox) => checkbox.checked) // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
      .map((checkbox) => checkbox.value); // 將資料逐筆轉換、篩選、排序或彙總，供本模組後續使用
  } // 結束 selectedCategories() 的目前區塊、參數或資料結構

  function updateCategorySummary() { // 定義 updateCategorySummary()：處理 餐廳分類與美食轉盤 的 updateCategorySummary 邏輯
    const categories = selectedCategories(); // 宣告不可重新指定的 categories，供updateCategorySummary()使用
    const items = uniqueItems(categories.flatMap((category) => FOOD_CATEGORIES[category] || [])); // 宣告不可重新指定的 items，供事件回呼()使用

    categorySummary.textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      categories.length === 0 // 續接 updateCategorySummary() 的運算、回呼或參數：categories.length === 0
        ? '尚未選擇分類' // 續接 updateCategorySummary() 的運算、回呼或參數：? '尚未選擇分類'
        : `已選 ${categories.length} 個分類，共 ${items.length} 間不重複店家`; // 續接 updateCategorySummary() 的運算、回呼或參數：: `已選 ${categories.length} 個分類，共 ${items.length} 間不重複店家`;
  } // 結束 updateCategorySummary() 的目前區塊、參數或資料結構

  function toggleCustomPanel(forceOpen) { // 定義 toggleCustomPanel()：處理 餐廳分類與美食轉盤 的 toggleCustomPanel 邏輯
    const shouldOpen = // 宣告不可重新指定的 shouldOpen，供toggleCustomPanel()使用
      typeof forceOpen === 'boolean' ? forceOpen : customPanel.classList.contains('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態

    customPanel.classList.toggle('hidden', !shouldOpen); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    customToggleButton.setAttribute('aria-expanded', String(shouldOpen)); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    if (shouldOpen) customInput.focus(); // 檢查 (shouldOpen) customInput.focus();；成立時才執行此分支
  } // 結束 toggleCustomPanel() 的目前區塊、參數或資料結構

  function restoreCustomItems() { // 定義 restoreCustomItems()：處理 餐廳分類與美食轉盤 的 restoreCustomItems 邏輯
    try { // 開始可捕捉例外的操作範圍
      customInput.value = readCustomItems() || ''; // 續接 restoreCustomItems() 的運算、回呼或參數：customInput.value = readCustomItems() || '';
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.warn('Custom restaurants could not be restored', error); // 呼叫 console.warn()，處理 餐廳分類與美食轉盤 的 warn 邏輯
    } // 結束 restoreCustomItems() 的目前區塊、參數或資料結構
  } // 結束 restoreCustomItems() 的目前區塊、參數或資料結構

  function saveCustomItems(value) { // 定義 saveCustomItems()：處理 餐廳分類與美食轉盤 的 saveCustomItems 邏輯
    try { // 開始可捕捉例外的操作範圍
      writeCustomItems(value.trim()); // 呼叫 writeCustomItems()，處理 餐廳分類與美食轉盤 的 writeCustomItems 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.warn('Custom restaurants could not be saved', error); // 呼叫 console.warn()，處理 餐廳分類與美食轉盤 的 warn 邏輯
    } // 結束 saveCustomItems() 的目前區塊、參數或資料結構
  } // 結束 saveCustomItems() 的目前區塊、參數或資料結構

  function clearCustomItems() { // 定義 clearCustomItems()：處理 餐廳分類與美食轉盤 的 clearCustomItems 邏輯
    customInput.value = ''; // 續接 clearCustomItems() 的運算、回呼或參數：customInput.value = '';
    try { // 開始可捕捉例外的操作範圍
      removeCustomItems(); // 呼叫 removeCustomItems()，處理 餐廳分類與美食轉盤 的 removeCustomItems 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.warn('Custom restaurants could not be cleared', error); // 呼叫 console.warn()，處理 餐廳分類與美食轉盤 的 warn 邏輯
    } // 結束 clearCustomItems() 的目前區塊、參數或資料結構
    customInput.focus(); // 呼叫 customInput.focus()，處理 餐廳分類與美食轉盤 的 focus 邏輯
  } // 結束 clearCustomItems() 的目前區塊、參數或資料結構

  function setResultIdle() { // 定義 setResultIdle()：處理 餐廳分類與美食轉盤 的 setResultIdle 邏輯
    result.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const icon = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    const message = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    icon.className = 'food-result-icon'; // 續接 setResultIdle() 的運算、回呼或參數：icon.className = 'food-result-icon';
    icon.setAttribute('aria-hidden', 'true'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    icon.textContent = '🍽️'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    message.textContent = '按下轉盤中央開始抽選'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    result.append(icon, message); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 setResultIdle() 的目前區塊、參數或資料結構

  function setResultLoading() { // 定義 setResultLoading()：處理 餐廳分類與美食轉盤 的 setResultLoading 邏輯
    result.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const spinner = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    const message = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    spinner.className = 'food-spinner'; // 續接 setResultLoading() 的運算、回呼或參數：spinner.className = 'food-spinner';
    spinner.setAttribute('aria-hidden', 'true'); // 設定元素屬性或 ARIA 狀態，保持操作與無障礙資訊一致
    message.textContent = '命運正在幫你選餐廳……'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    result.append(spinner, message); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 setResultLoading() 的目前區塊、參數或資料結構

  function setResultWinner(winner) { // 定義 setResultWinner()：處理 餐廳分類與美食轉盤 的 setResultWinner 邏輯
    result.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const eyebrow = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    const name = document.createElement('strong'); // 建立 strong DOM 元素，供後續填值與插入
    const note = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
    eyebrow.className = 'food-result-eyebrow'; // 續接 setResultWinner() 的運算、回呼或參數：eyebrow.className = 'food-result-eyebrow';
    name.className = 'food-result-name'; // 續接 setResultWinner() 的運算、回呼或參數：name.className = 'food-result-name';
    note.className = 'food-result-note'; // 續接 setResultWinner() 的運算、回呼或參數：note.className = 'food-result-note';
    eyebrow.textContent = '今天就吃'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    name.textContent = winner; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    note.textContent = '不准重抽……除非大家都同意 😎'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    result.append(eyebrow, name, note); // 將建立的節點加入父容器，形成畫面內容
  } // 結束 setResultWinner() 的目前區塊、參數或資料結構

  function launchCelebration() { // 定義 launchCelebration()：處理 餐廳分類與美食轉盤 的 launchCelebration 邏輯
    celebrationLayer.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const colors = [ // 宣告不可重新指定的 colors，供launchCelebration()使用
      '#f43f5e', // 提供 '#f43f5e', 文字、路徑或資料欄位值
      '#f97316', // 提供 '#f97316', 文字、路徑或資料欄位值
      '#facc15', // 提供 '#facc15', 文字、路徑或資料欄位值
      '#22c55e', // 提供 '#22c55e', 文字、路徑或資料欄位值
      '#06b6d4', // 提供 '#06b6d4', 文字、路徑或資料欄位值
      '#3b82f6', // 提供 '#3b82f6', 文字、路徑或資料欄位值
      '#a855f7', // 提供 '#a855f7', 文字、路徑或資料欄位值
      '#ec4899', // 提供 '#ec4899', 文字、路徑或資料欄位值
    ]; // 結束 launchCelebration() 的目前區塊、參數或資料結構
    const fragment = document.createDocumentFragment(); // 宣告不可重新指定的 fragment，供launchCelebration()使用

    for (let index = 0; index < 70; index += 1) { // 依 for (let index = 0; index < 70; index += 1) 逐項處理或重複等待
      const piece = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
      piece.className = 'food-confetti'; // 續接 launchCelebration() 的運算、回呼或參數：piece.className = 'food-confetti';
      piece.style.left = `${Math.random() * 100}vw`; // 續接 launchCelebration() 的運算、回呼或參數：piece.style.left = `${Math.random() * 100}vw`;
      piece.style.backgroundColor = colors[index % colors.length]; // 續接 launchCelebration() 的運算、回呼或參數：piece.style.backgroundColor = colors[index % colors.length];
      piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 240)}px`); // 呼叫 piece.style.setProperty()，處理 餐廳分類與美食轉盤 的 setProperty 邏輯
      piece.style.setProperty('--rotation', `${Math.round(540 + Math.random() * 900)}deg`); // 呼叫 piece.style.setProperty()，處理 餐廳分類與美食轉盤 的 setProperty 邏輯
      piece.style.setProperty('--delay', `${(Math.random() * 0.6).toFixed(2)}s`); // 呼叫 piece.style.setProperty()，處理 餐廳分類與美食轉盤 的 setProperty 邏輯
      piece.style.setProperty('--duration', `${(2.8 + Math.random() * 1.7).toFixed(2)}s`); // 呼叫 piece.style.setProperty()，處理 餐廳分類與美食轉盤 的 setProperty 邏輯
      fragment.appendChild(piece); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 launchCelebration() 的目前區塊、參數或資料結構

    celebrationLayer.appendChild(fragment); // 將建立的節點加入父容器，形成畫面內容
    window.setTimeout(() => celebrationLayer.replaceChildren(), 5200); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
  } // 結束 launchCelebration() 的目前區塊、參數或資料結構

  function setWheelItems(items, description) { // 定義 setWheelItems()：處理 餐廳分類與美食轉盤 的 setWheelItems 邏輯
    wheelItems = uniqueItems(items); // 更新 wheelItems，保存本步處理結果
    wheelAngle = 0; // 更新 wheelAngle，保存本步處理結果
    wheelStage.classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    modeLabel.textContent = description; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    countLabel.textContent = `共 ${wheelItems.length} 間店家`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    centerButton.disabled = false; // 續接 setWheelItems() 的運算、回呼或參數：centerButton.disabled = false;
    centerButton.lastElementChild.textContent = '開轉'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    setResultIdle(); // 呼叫 setResultIdle()，處理 餐廳分類與美食轉盤 的 setResultIdle 邏輯
    drawWheel(); // 呼叫 drawWheel()，處理 餐廳分類與美食轉盤 的 drawWheel 邏輯
    appSetMessage('轉盤已建立，按下中央按鈕開始抽選。', 'success'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
    wheelStage.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 呼叫 wheelStage.scrollIntoView()，處理 餐廳分類與美食轉盤 的 scrollIntoView 邏輯
  } // 結束 setWheelItems() 的目前區塊、參數或資料結構

  function buildPresetWheel() { // 定義 buildPresetWheel()：處理 餐廳分類與美食轉盤 的 buildPresetWheel 邏輯
    if (isSpinning) return; // 檢查 (isSpinning) return;；成立時才執行此分支
    const categories = selectedCategories(); // 宣告不可重新指定的 categories，供buildPresetWheel()使用
    if (categories.length === 0) { // 檢查 (categories.length === 0)；成立時才執行此分支
      appSetMessage('請至少勾選一個飲食分類。', 'error'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
      return; // 提前結束 buildPresetWheel()，不再執行後續操作
    } // 結束 buildPresetWheel() 的目前區塊、參數或資料結構

    const items = uniqueItems(categories.flatMap((category) => FOOD_CATEGORIES[category] || [])); // 宣告不可重新指定的 items，供事件回呼()使用
    setWheelItems(items, categories.join('＋')); // 呼叫 setWheelItems()，處理 餐廳分類與美食轉盤 的 setWheelItems 邏輯
  } // 結束 buildPresetWheel() 的目前區塊、參數或資料結構

  function buildCustomWheel() { // 定義 buildCustomWheel()：處理 餐廳分類與美食轉盤 的 buildCustomWheel 邏輯
    if (isSpinning) return; // 檢查 (isSpinning) return;；成立時才執行此分支
    const items = parseCustomItems(customInput.value); // 宣告不可重新指定的 items，供buildCustomWheel()使用
    if (items.length < 2) { // 檢查 (items.length < 2)；成立時才執行此分支
      appSetMessage('請至少輸入兩間不同的店家。', 'error'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
      customInput.focus(); // 呼叫 customInput.focus()，處理 餐廳分類與美食轉盤 的 focus 邏輯
      return; // 提前結束 buildCustomWheel()，不再執行後續操作
    } // 結束 buildCustomWheel() 的目前區塊、參數或資料結構

    saveCustomItems(customInput.value); // 呼叫 saveCustomItems()，處理 餐廳分類與美食轉盤 的 saveCustomItems 邏輯
    setWheelItems(items, '自訂轉盤'); // 呼叫 setWheelItems()，處理 餐廳分類與美食轉盤 的 setWheelItems 邏輯
    toggleCustomPanel(false); // 呼叫 toggleCustomPanel()，處理 餐廳分類與美食轉盤 的 toggleCustomPanel 邏輯
  } // 結束 buildCustomWheel() 的目前區塊、參數或資料結構

  function resetWheel() { // 定義 resetWheel()：處理 餐廳分類與美食轉盤 的 resetWheel 邏輯
    if (isSpinning) return; // 檢查 (isSpinning) return;；成立時才執行此分支
    wheelItems = []; // 更新 wheelItems，保存本步處理結果
    wheelAngle = 0; // 更新 wheelAngle，保存本步處理結果
    wheelStage.classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    appSetMessage('請重新選擇分類或自訂店家。'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
    document // 續接 resetWheel() 的運算、回呼或參數：document
      .getElementById('food-selection-card') // 呼叫 .getElementById()，處理 餐廳分類與美食轉盤 的 getElementById 邏輯
      .scrollIntoView({ behavior: 'smooth', block: 'start' }); // 呼叫 .scrollIntoView()，處理 餐廳分類與美食轉盤 的 scrollIntoView 邏輯
  } // 結束 resetWheel() 的目前區塊、參數或資料結構

  function finishSpin(winnerIndex, targetAngle) { // 定義 finishSpin()：處理 餐廳分類與美食轉盤 的 finishSpin 邏輯
    wheelAngle = targetAngle % (Math.PI * 2); // 更新 wheelAngle，保存本步處理結果
    drawWheel(); // 呼叫 drawWheel()，處理 餐廳分類與美食轉盤 的 drawWheel 邏輯
    isSpinning = false; // 更新 isSpinning，保存本步處理結果
    centerButton.disabled = false; // 續接 finishSpin() 的運算、回呼或參數：centerButton.disabled = false;
    centerButton.lastElementChild.textContent = '再轉'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    const winner = wheelItems[winnerIndex]; // 宣告不可重新指定的 winner，供finishSpin()使用
    setResultWinner(winner); // 呼叫 setResultWinner()，處理 餐廳分類與美食轉盤 的 setResultWinner 邏輯
    appSetMessage(`抽選完成：${winner}`, 'success'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
    launchCelebration(); // 呼叫 launchCelebration()，處理 餐廳分類與美食轉盤 的 launchCelebration 邏輯
  } // 結束 finishSpin() 的目前區塊、參數或資料結構

  function spinWheel() { // 定義 spinWheel()：處理 餐廳分類與美食轉盤 的 spinWheel 邏輯
    if (isSpinning || wheelItems.length < 2) return; // 檢查 (isSpinning || wheelItems.length < 2) return;；成立時才執行此分支

    isSpinning = true; // 更新 isSpinning，保存本步處理結果
    centerButton.disabled = true; // 續接 spinWheel() 的運算、回呼或參數：centerButton.disabled = true;
    centerButton.lastElementChild.textContent = '轉動中'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    setResultLoading(); // 呼叫 setResultLoading()，處理 餐廳分類與美食轉盤 的 setResultLoading 邏輯

    const winnerIndex = secureRandomIndex(wheelItems.length); // 宣告不可重新指定的 winnerIndex，供spinWheel()使用
    const fullCircle = Math.PI * 2; // 宣告不可重新指定的 fullCircle，供spinWheel()使用
    const arc = fullCircle / wheelItems.length; // 宣告不可重新指定的 arc，供spinWheel()使用
    const normalizedCurrent = ((wheelAngle % fullCircle) + fullCircle) % fullCircle; // 宣告不可重新指定的 normalizedCurrent，供spinWheel()使用
    const desired = (((-(winnerIndex + 0.5) * arc) % fullCircle) + fullCircle) % fullCircle; // 宣告不可重新指定的 desired，供spinWheel()使用
    let forwardDelta = desired - normalizedCurrent; // 宣告可更新的 forwardDelta，供spinWheel()使用
    if (forwardDelta < 0) forwardDelta += fullCircle; // 檢查 (forwardDelta < 0) forwardDelta += fullCircle;；成立時才執行此分支

    const startAngle = wheelAngle; // 宣告不可重新指定的 startAngle，供spinWheel()使用
    const targetAngle = wheelAngle + (6 + secureRandomIndex(3)) * fullCircle + forwardDelta; // 宣告不可重新指定的 targetAngle，供spinWheel()使用
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // 宣告不可重新指定的 reducedMotion，供spinWheel()使用
    const duration = reducedMotion ? 450 : 4700; // 宣告不可重新指定的 duration，供spinWheel()使用
    const startTime = performance.now(); // 宣告不可重新指定的 startTime，供spinWheel()使用

    if (animationFrame) cancelAnimationFrame(animationFrame); // 檢查 (animationFrame) cancelAnimationFrame(animationFrame);；成立時才執行此分支

    function animate(now) { // 定義 animate()：處理 餐廳分類與美食轉盤 的 animate 邏輯
      const progress = Math.min(1, (now - startTime) / duration); // 宣告不可重新指定的 progress，供animate()使用
      const eased = 1 - Math.pow(1 - progress, 5); // 宣告不可重新指定的 eased，供animate()使用
      wheelAngle = startAngle + (targetAngle - startAngle) * eased; // 更新 wheelAngle，保存本步處理結果
      drawWheel(); // 呼叫 drawWheel()，處理 餐廳分類與美食轉盤 的 drawWheel 邏輯

      if (progress < 1) { // 檢查 (progress < 1)；成立時才執行此分支
        animationFrame = requestAnimationFrame(animate); // 更新 animationFrame，保存本步處理結果
      } else { // 前一條件未成立時，執行 animate() 的另一分支
        finishSpin(winnerIndex, targetAngle); // 呼叫 finishSpin()，處理 餐廳分類與美食轉盤 的 finishSpin 邏輯
      } // 結束 animate() 的目前區塊、參數或資料結構
    } // 結束 animate() 的目前區塊、參數或資料結構

    animationFrame = requestAnimationFrame(animate); // 更新 animationFrame，保存本步處理結果
  } // 結束 spinWheel() 的目前區塊、參數或資料結構

  categoryCheckboxes.forEach((checkbox) => { // 呼叫 categoryCheckboxes.forEach()，處理 餐廳分類與美食轉盤 的 forEach 邏輯
    checkbox.addEventListener('change', updateCategorySummary); // 綁定 change 事件，交由回呼處理使用者操作
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  presetButton.addEventListener('click', buildPresetWheel); // 綁定 click 事件，交由回呼處理使用者操作
  customToggleButton.addEventListener('click', () => toggleCustomPanel()); // 綁定 click 事件，交由回呼處理使用者操作
  customCloseButton.addEventListener('click', () => toggleCustomPanel(false)); // 綁定 click 事件，交由回呼處理使用者操作
  customClearButton.addEventListener('click', clearCustomItems); // 綁定 click 事件，交由回呼處理使用者操作
  customApplyButton.addEventListener('click', buildCustomWheel); // 綁定 click 事件，交由回呼處理使用者操作
  resetButton.addEventListener('click', resetWheel); // 綁定 click 事件，交由回呼處理使用者操作
  centerButton.addEventListener('click', spinWheel); // 綁定 click 事件，交由回呼處理使用者操作
  window.addEventListener('resize', () => { // 綁定 resize 事件，交由回呼處理使用者操作
    if (!wheelStage.classList.contains('hidden') && wheelItems.length > 0) { // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      requestAnimationFrame(drawWheel); // 呼叫 requestAnimationFrame()，處理 餐廳分類與美食轉盤 的 requestAnimationFrame 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  restoreCustomItems(); // 呼叫 restoreCustomItems()，處理 餐廳分類與美食轉盤 的 restoreCustomItems 邏輯
  updateCategorySummary(); // 呼叫 updateCategorySummary()，處理 餐廳分類與美食轉盤 的 updateCategorySummary 邏輯
  appSetMessage('請選擇飲食分類，或開啟自訂轉盤。'); // 呼叫 appSetMessage()，處理 餐廳分類與美食轉盤 的 appSetMessage 邏輯
} // 結束 mount() 的目前區塊、參數或資料結構
