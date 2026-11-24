import { confirmName } from '../profiles/index.js'; // 從 ../profiles/index.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { profileName } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
export function mountNameForm() { // 定義 mountNameForm()：處理 Google 登入、登入狀態與姓名確認 的 mountNameForm 邏輯
  if (!document.getElementById('name-onboarding-overlay')) // 依元素 ID 或 CSS 選擇器取得頁面控制項
    document.body.insertAdjacentHTML( // 以 HTML 樣板建立介面結構；插入動態文字時需留意跳脫
      'beforeend', // 提供 'beforeend', 文字、路徑或資料欄位值
      `      <div id="name-onboarding-overlay" class="name-onboarding-overlay hidden"
        role="dialog" aria-modal="true" aria-labelledby="name-onboarding-title"
        aria-describedby="name-onboarding-description">
        <form id="name-onboarding-form" class="name-onboarding-card" novalidate>
          <div class="name-onboarding-icon" aria-hidden="true">👤</div>
          <h2 id="name-onboarding-title">首次登入姓名設定</h2>
          <p id="name-onboarding-description">
            請輸入方便辨識的真實姓名。今後的簽到、簽退、借用紀錄與問題回報都會顯示這個姓名。
          </p>
          <label for="name-onboarding-input">姓名</label>
          <input id="name-onboarding-input" type="text" minlength="2" maxlength="80"
            autocomplete="name" placeholder="例如：王小明" required>
          <p id="name-onboarding-status" class="name-onboarding-status"
            aria-live="polite">每個 Google 帳號只需設定一次。</p>
          <div class="name-onboarding-actions">
            <button id="name-onboarding-save" class="primary-button" type="submit">
              儲存姓名並繼續
            </button>
            <button id="name-onboarding-signout" class="secondary-button" type="button">
              登出並切換帳號
            </button>
          </div>
        </form>
      </div>
`, // 續接 mountNameForm() 的運算、回呼或參數：`,
    ); // 結束 mountNameForm() 的目前區塊、參數或資料結構
} // 結束 mountNameForm() 的目前區塊、參數或資料結構
export function ensureConfirmedName(session, profile, signOut) { // 定義 ensureConfirmedName()：要求首次登入使用者確認姓名
  if (!session || profile?.name_confirmed) return Promise.resolve(profile); // 檢查 (!session || profile?.name_confirmed) return Promise.resolve(profile);；成立時才執行此分支

  const overlay = document.getElementById('name-onboarding-overlay'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const form = document.getElementById('name-onboarding-form'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const input = document.getElementById('name-onboarding-input'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const status = document.getElementById('name-onboarding-status'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const saveButton = document.getElementById('name-onboarding-save'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const signoutButton = document.getElementById('name-onboarding-signout'); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  if (!overlay || !form || !input || !status || !saveButton || !signoutButton) { // 檢查 (!overlay || !form || !input || !status || !saveButton || !signoutButton)；成立時才執行此分支
    return Promise.reject(new Error('姓名設定視窗初始化失敗')); // 回傳 Promise.reject(new Error('姓名設定視窗初始化失敗'))，交給 ensureConfirmedName() 的呼叫端
  } // 結束 ensureConfirmedName() 的目前區塊、參數或資料結構

  const suggestedName = profile?.display_name || profileName(profile, session); // 宣告不可重新指定的 suggestedName，供ensureConfirmedName()使用
  input.value = suggestedName === '未命名使用者' ? '' : suggestedName; // 續接 ensureConfirmedName() 的運算、回呼或參數：input.value = suggestedName === '未命名使用者' ? '' : suggestedName;
  status.textContent = '每個 Google 帳號只需設定一次。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  status.className = 'name-onboarding-status'; // 續接 ensureConfirmedName() 的運算、回呼或參數：status.className = 'name-onboarding-status';
  overlay.classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  document.body.classList.add('name-onboarding-open'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態

  function setBusy(isBusy) { // 定義 setBusy()：切換處理狀態並避免重複操作
    input.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：input.disabled = isBusy;
    saveButton.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：saveButton.disabled = isBusy;
    signoutButton.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：signoutButton.disabled = isBusy;
    saveButton.textContent = isBusy ? '儲存中……' : '儲存姓名並繼續'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  } // 結束 setBusy() 的目前區塊、參數或資料結構

  function cleanUp() { // 定義 cleanUp()：處理 Google 登入、登入狀態與姓名確認 的 cleanUp 邏輯
    form.onsubmit = null; // 續接 cleanUp() 的運算、回呼或參數：form.onsubmit = null;
    signoutButton.onclick = null; // 續接 cleanUp() 的運算、回呼或參數：signoutButton.onclick = null;
    overlay.classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    document.body.classList.remove('name-onboarding-open'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  } // 結束 cleanUp() 的目前區塊、參數或資料結構

  setTimeout(() => { // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
    input.focus(); // 呼叫 input.focus()，處理 Google 登入、登入狀態與姓名確認 的 focus 邏輯
    input.select(); // 指定資料庫查詢欄位；後續篩選與排序仍屬同一查詢
  }, 0); // 續接 事件回呼() 的運算、回呼或參數：}, 0);

  return new Promise((resolve) => { // 回傳 new Promise((resolve) => {，交給 事件回呼() 的呼叫端
    form.onsubmit = async (event) => { // 續接 事件回呼() 的運算、回呼或參數：form.onsubmit = async (event) => {
      event.preventDefault(); // 呼叫 event.preventDefault()，處理 Google 登入、登入狀態與姓名確認 的 preventDefault 邏輯
      const confirmedName = input.value.trim().replace(/\s+/g, ' '); // 宣告不可重新指定的 confirmedName，供事件回呼()使用

      if (confirmedName.length < 2 || confirmedName.length > 80) { // 檢查 (confirmedName.length < 2 || confirmedName.length > 80)；成立時才執行此分支
        status.textContent = '請輸入 2 至 80 個字元的姓名。'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        status.className = 'name-onboarding-status error'; // 續接 事件回呼() 的運算、回呼或參數：status.className = 'name-onboarding-status error';
        input.focus(); // 呼叫 input.focus()，處理 Google 登入、登入狀態與姓名確認 的 focus 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構

      setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      status.textContent = '正在將姓名綁定到這個 Google 帳號……'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      status.className = 'name-onboarding-status'; // 續接 事件回呼() 的運算、回呼或參數：status.className = 'name-onboarding-status';

      const { data, error } = await confirmName(confirmedName); // 續接 事件回呼() 的運算、回呼或參數：const { data, error } = await confirmName(confirmedName);

      if (error) { // 檢查 (error)；成立時才執行此分支
        status.textContent = `儲存失敗：${error.message}`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        status.className = 'name-onboarding-status error'; // 續接 事件回呼() 的運算、回呼或參數：status.className = 'name-onboarding-status error';
        setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
        input.focus(); // 呼叫 input.focus()，處理 Google 登入、登入狀態與姓名確認 的 focus 邏輯
        return; // 提前結束 事件回呼()，不再執行後續操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構

      const updatedProfile = Array.isArray(data) ? data[0] : data; // 宣告不可重新指定的 updatedProfile，供事件回呼()使用
      const confirmedProfile = { // 宣告不可重新指定的 confirmedProfile，供事件回呼()使用
        ...profile, // 續接 事件回呼() 的運算、回呼或參數：...profile,
        ...updatedProfile, // 續接 事件回呼() 的運算、回呼或參數：...updatedProfile,
        display_name: updatedProfile?.display_name || confirmedName, // 設定 顯示名稱 欄位的值或型別
        name_confirmed: true, // 設定 name_confirmed 欄位的值或型別
      }; // 結束 事件回呼() 的目前區塊、參數或資料結構
      cleanUp(); // 呼叫 cleanUp()，處理 Google 登入、登入狀態與姓名確認 的 cleanUp 邏輯
      resolve(confirmedProfile); // 呼叫 resolve()，處理 Google 登入、登入狀態與姓名確認 的 resolve 邏輯
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構

    signoutButton.onclick = async () => { // 續接 事件回呼() 的運算、回呼或參數：signoutButton.onclick = async () => {
      setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      status.textContent = '正在登出……'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      status.className = 'name-onboarding-status'; // 續接 事件回呼() 的運算、回呼或參數：status.className = 'name-onboarding-status';
      try { // 開始可捕捉例外的操作範圍
        await signOut(); // 等待非同步操作完成後，才繼續同一流程
      } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
        status.textContent = `登出失敗：${error.message}`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        status.className = 'name-onboarding-status error'; // 續接 事件回呼() 的運算、回呼或參數：status.className = 'name-onboarding-status error';
        setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
} // 結束 ensureConfirmedName() 的目前區塊、參數或資料結構
