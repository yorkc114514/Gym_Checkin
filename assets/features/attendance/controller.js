import { createPresenceTokenStore } from './presence-token.js'; // 從 ./presence-token.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { AttendanceRepository } from './repository.js'; // 從 ./repository.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { consumeReturnTarget as appConsumeReturnTarget } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { loadOpenPeople as appLoadOpenPeople } from './repository.js'; // 從 ./repository.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { profileAvatar as appProfileAvatar } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { profileName as appProfileName } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { roleLabel as appRoleLabel } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { signInWithGoogle as appSignInWithGoogle } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供現場 QR 認證與簽到簽退使用
import { signOut as appSignOut } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供現場 QR 認證與簽到簽退使用
export async function mount({ afterAttendance = async () => {} } = {}) { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const { capturePresenceToken, clearStoredPresenceToken } = createPresenceTokenStore(); // 續接 mount() 的運算、回呼或參數：const { capturePresenceToken, clearStoredPresenceToken } = createPresenceTok…
  const capturedPresence = capturePresenceToken(); // 宣告不可重新指定的 capturedPresence，供mount()使用
  let presenceToken = capturedPresence.token; // 宣告可更新的 現場認證 Token，供mount()使用

  const app = await appInit({ requireAuth: false }); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支

  const signedOutCard = document.getElementById('signed-out-card'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const signedInContent = document.getElementById('signed-in-content'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const loginButton = document.getElementById('login-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const logoutButton = document.getElementById('home-logout-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const attendanceState = document.getElementById('attendance-state'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const checkInControls = document.getElementById('check-in-controls'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const checkOutControls = document.getElementById('check-out-controls'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const primaryCheckoutControls = document.getElementById('primary-checkout-controls'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const transferUser = document.getElementById('transfer-user'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const equipmentChecks = document.getElementById('equipment-checks'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const checkInButton = document.getElementById('check-in-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const checkOutButton = document.getElementById('check-out-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const refreshButton = document.getElementById('refresh-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const presenceCard = document.getElementById('presence-card'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const presenceStatus = document.getElementById('presence-status'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const presenceDetail = document.getElementById('presence-detail'); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  let openPeople = []; // 宣告可更新的 openPeople，供mount()使用
  let currentAttendance = null; // 宣告可更新的 currentAttendance，供mount()使用
  let pageBusy = false; // 宣告可更新的 pageBusy，供mount()使用
  let presenceState = { // 宣告可更新的 presenceState，供mount()使用
    valid: false, // 設定 valid 欄位的值或型別
    kind: capturedPresence.malformed ? 'invalid' : presenceToken ? 'checking' : 'missing', // 設定 kind 欄位的值或型別
    message: capturedPresence.malformed // 設定 message 欄位的值或型別
      ? '這個連結的現場認證碼格式不正確。' // 續接 mount() 的運算、回呼或參數：? '這個連結的現場認證碼格式不正確。'
      : presenceToken // 續接 mount() 的運算、回呼或參數：: presenceToken
        ? '正在確認現場 QR Code……' // 續接 mount() 的運算、回呼或參數：? '正在確認現場 QR Code……'
        : '簽到前請在現場感應裝置並掃描 QR Code。', // 續接 mount() 的運算、回呼或參數：: '簽到前請在現場感應裝置並掃描 QR Code。',
    expiresAt: null, // 設定 expiresAt 欄位的值或型別
  }; // 結束 mount() 的目前區塊、參數或資料結構

  function updateActionAvailability() { // 定義 updateActionAvailability()：處理 現場 QR 認證與簽到簽退 的 updateActionAvailability 邏輯
    checkInButton.disabled = pageBusy || !presenceState.valid; // 續接 updateActionAvailability() 的運算、回呼或參數：checkInButton.disabled = pageBusy || !presenceState.valid;
    checkOutButton.disabled = pageBusy; // 續接 updateActionAvailability() 的運算、回呼或參數：checkOutButton.disabled = pageBusy;
    refreshButton.disabled = pageBusy; // 續接 updateActionAvailability() 的運算、回呼或參數：refreshButton.disabled = pageBusy;
    logoutButton.disabled = pageBusy; // 續接 updateActionAvailability() 的運算、回呼或參數：logoutButton.disabled = pageBusy;
    for (const radio of document.querySelectorAll('input[name="gym-role"]')) { // 依元素 ID 或 CSS 選擇器取得頁面控制項
      radio.disabled = pageBusy; // 續接 updateActionAvailability() 的運算、回呼或參數：radio.disabled = pageBusy;
    } // 結束 updateActionAvailability() 的目前區塊、參數或資料結構
  } // 結束 updateActionAvailability() 的目前區塊、參數或資料結構

  function renderPresenceState() { // 定義 renderPresenceState()：處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
    if (currentAttendance) { // 檢查 (currentAttendance)；成立時才執行此分支
      presenceCard.dataset.state = 'checkout'; // 續接 renderPresenceState() 的運算、回呼或參數：presenceCard.dataset.state = 'checkout';
      presenceStatus.textContent = '簽退不需要現場 QR Code'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      presenceDetail.textContent = presenceToken // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        ? '已讀取 QR 連結；你目前已簽到，可直接完成簽退。' // 續接 renderPresenceState() 的運算、回呼或參數：? '已讀取 QR 連結；你目前已簽到，可直接完成簽退。'
        : '你目前已簽到，可直接完成簽退。'; // 續接 renderPresenceState() 的運算、回呼或參數：: '你目前已簽到，可直接完成簽退。';
      updateActionAvailability(); // 呼叫 updateActionAvailability()，處理 現場 QR 認證與簽到簽退 的 updateActionAvailability 邏輯
      return; // 提前結束 renderPresenceState()，不再執行後續操作
    } // 結束 renderPresenceState() 的目前區塊、參數或資料結構

    if (presenceState.valid && presenceState.expiresAt) { // 檢查 (presenceState.valid && presenceState.expiresAt)；成立時才執行此分支
      const seconds = Math.max(0, Math.ceil((presenceState.expiresAt - Date.now()) / 1000)); // 宣告不可重新指定的 seconds，供renderPresenceState()使用

      if (seconds <= 0) { // 檢查 (seconds <= 0)；成立時才執行此分支
        presenceState = { // 更新 presenceState，保存本步處理結果
          valid: false, // 設定 valid 欄位的值或型別
          kind: 'expired', // 設定 kind 欄位的值或型別
          message: '這個 QR Code 已過期，請在現場重新感應並掃描。', // 設定 message 欄位的值或型別
          expiresAt: presenceState.expiresAt, // 設定 expiresAt 欄位的值或型別
        }; // 結束 renderPresenceState() 的目前區塊、參數或資料結構
      } else { // 前一條件未成立時，執行 renderPresenceState() 的另一分支
        presenceCard.dataset.state = 'valid'; // 續接 renderPresenceState() 的運算、回呼或參數：presenceCard.dataset.state = 'valid';
        presenceStatus.textContent = '現場認證有效'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        presenceDetail.textContent = `請在 ${seconds} 秒內完成簽到；同一 QR Code 在有效時間內可供多人使用。`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        updateActionAvailability(); // 呼叫 updateActionAvailability()，處理 現場 QR 認證與簽到簽退 的 updateActionAvailability 邏輯
        return; // 提前結束 renderPresenceState()，不再執行後續操作
      } // 結束 renderPresenceState() 的目前區塊、參數或資料結構
    } // 結束 renderPresenceState() 的目前區塊、參數或資料結構

    presenceCard.dataset.state = presenceState.kind; // 續接 renderPresenceState() 的運算、回呼或參數：presenceCard.dataset.state = presenceState.kind;
    presenceStatus.textContent = // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      presenceState.kind === 'checking' // 續接 renderPresenceState() 的運算、回呼或參數：presenceState.kind === 'checking'
        ? '正在確認現場 QR Code' // 續接 renderPresenceState() 的運算、回呼或參數：? '正在確認現場 QR Code'
        : presenceState.kind === 'expired' // 續接 renderPresenceState() 的運算、回呼或參數：: presenceState.kind === 'expired'
          ? 'QR Code 已過期' // 續接 renderPresenceState() 的運算、回呼或參數：? 'QR Code 已過期'
          : presenceState.kind === 'invalid' // 續接 renderPresenceState() 的運算、回呼或參數：: presenceState.kind === 'invalid'
            ? 'QR Code 無效' // 續接 renderPresenceState() 的運算、回呼或參數：? 'QR Code 無效'
            : '尚未取得現場認證'; // 續接 renderPresenceState() 的運算、回呼或參數：: '尚未取得現場認證';
    presenceDetail.textContent = presenceState.message; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    updateActionAvailability(); // 呼叫 updateActionAvailability()，處理 現場 QR 認證與簽到簽退 的 updateActionAvailability 邏輯
  } // 結束 renderPresenceState() 的目前區塊、參數或資料結構

  async function validatePresenceToken() { // 定義 validatePresenceToken()：處理 現場 QR 認證與簽到簽退 的 validatePresenceToken 邏輯
    if (!presenceToken) { // 檢查 (!presenceToken)；成立時才執行此分支
      presenceState = { // 更新 presenceState，保存本步處理結果
        valid: false, // 設定 valid 欄位的值或型別
        kind: capturedPresence.malformed ? 'invalid' : 'missing', // 設定 kind 欄位的值或型別
        message: capturedPresence.malformed // 設定 message 欄位的值或型別
          ? '這個連結的現場認證碼格式不正確。' // 續接 validatePresenceToken() 的運算、回呼或參數：? '這個連結的現場認證碼格式不正確。'
          : '簽到前請在現場感應裝置並掃描 QR Code。', // 續接 validatePresenceToken() 的運算、回呼或參數：: '簽到前請在現場感應裝置並掃描 QR Code。',
        expiresAt: null, // 設定 expiresAt 欄位的值或型別
      }; // 結束 validatePresenceToken() 的目前區塊、參數或資料結構
      renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
      return; // 提前結束 validatePresenceToken()，不再執行後續操作
    } // 結束 validatePresenceToken() 的目前區塊、參數或資料結構

    presenceState = { // 更新 presenceState，保存本步處理結果
      valid: false, // 設定 valid 欄位的值或型別
      kind: 'checking', // 設定 kind 欄位的值或型別
      message: '正在向伺服器確認現場 QR Code……', // 設定 message 欄位的值或型別
      expiresAt: null, // 設定 expiresAt 欄位的值或型別
    }; // 結束 validatePresenceToken() 的目前區塊、參數或資料結構
    renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯

    const { data, error } = await AttendanceRepository.presenceStatus({ // 續接 validatePresenceToken() 的運算、回呼或參數：const { data, error } = await AttendanceRepository.presenceStatus({
      presence_token: presenceToken, // 設定 presence_token 欄位的值或型別
    }); // 結束 validatePresenceToken() 的目前區塊、參數或資料結構

    if (error) { // 檢查 (error)；成立時才執行此分支
      presenceState = { // 更新 presenceState，保存本步處理結果
        valid: false, // 設定 valid 欄位的值或型別
        kind: 'invalid', // 設定 kind 欄位的值或型別
        message: `無法驗證現場 QR Code：${error.message}`, // 設定 message 欄位的值或型別
        expiresAt: null, // 設定 expiresAt 欄位的值或型別
      }; // 結束 validatePresenceToken() 的目前區塊、參數或資料結構
      renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
      return; // 提前結束 validatePresenceToken()，不再執行後續操作
    } // 結束 validatePresenceToken() 的目前區塊、參數或資料結構

    const result = Array.isArray(data) ? data[0] : data; // 宣告不可重新指定的 處理結果，供validatePresenceToken()使用
    const expiresAt = result?.expires_at ? new Date(result.expires_at).getTime() : null; // 宣告不可重新指定的 expiresAt，供validatePresenceToken()使用
    const valid = Boolean(result?.is_valid) && Number.isFinite(expiresAt); // 宣告不可重新指定的 valid，供validatePresenceToken()使用

    presenceState = { // 更新 presenceState，保存本步處理結果
      valid, // 續接 validatePresenceToken() 的運算、回呼或參數：valid,
      kind: valid ? 'valid' : expiresAt && expiresAt <= Date.now() ? 'expired' : 'invalid', // 設定 kind 欄位的值或型別
      message: result?.message || '現場認證碼無效。', // 設定 message 欄位的值或型別
      expiresAt, // 續接 validatePresenceToken() 的運算、回呼或參數：expiresAt,
    }; // 結束 validatePresenceToken() 的目前區塊、參數或資料結構

    if (!valid) clearStoredPresenceToken(); // 檢查 (!valid) clearStoredPresenceToken();；成立時才執行此分支
    renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
  } // 結束 validatePresenceToken() 的目前區塊、參數或資料結構

  window.setInterval(() => { // 註冊重複執行的介面更新排程
    if (!currentAttendance && presenceState.valid) renderPresenceState(); // 檢查 (!currentAttendance && presenceState.valid) renderPresenceState();；成立時才執行此分支
  }, 1000); // 續接 事件回呼() 的運算、回呼或參數：}, 1000);

  loginButton.addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
    loginButton.disabled = true; // 續接 事件回呼() 的運算、回呼或參數：loginButton.disabled = true;
    try { // 開始可捕捉例外的操作範圍
      await appSignInWithGoogle(); // 等待非同步操作完成後，才繼續同一流程
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      loginButton.disabled = false; // 續接 事件回呼() 的運算、回呼或參數：loginButton.disabled = false;
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  if (!app.session) { // 檢查 (!app.session)；成立時才執行此分支
    signedOutCard.classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    signedInContent.classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    if (presenceToken) await validatePresenceToken(); // 檢查 (presenceToken) await validatePresenceToken();；成立時才執行此分支
    else renderPresenceState(); // 前一條件未成立時，執行 mount() 的另一分支
    const requiresLogin = new URLSearchParams(window.location.search).get('login') === 'required'; // 宣告不可重新指定的 requiresLogin，供mount()使用
    appSetMessage( // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      requiresLogin // 續接 mount() 的運算、回呼或參數：requiresLogin
        ? '請先使用 Google 帳號登入。' // 續接 mount() 的運算、回呼或參數：? '請先使用 Google 帳號登入。'
        : presenceState.valid // 續接 mount() 的運算、回呼或參數：: presenceState.valid
          ? '已讀取現場 QR Code，請登入後完成簽到。' // 續接 mount() 的運算、回呼或參數：? '已讀取現場 QR Code，請登入後完成簽到。'
          : presenceToken // 續接 mount() 的運算、回呼或參數：: presenceToken
            ? '這個現場 QR Code 已無法用於簽到；仍可登入使用其他功能。' // 續接 mount() 的運算、回呼或參數：? '這個現場 QR Code 已無法用於簽到；仍可登入使用其他功能。'
            : '請先登入；簽到時另需掃描現場 QR Code。', // 續接 mount() 的運算、回呼或參數：: '請先登入；簽到時另需掃描現場 QR Code。',
    ); // 結束 mount() 的目前區塊、參數或資料結構
    return; // 提前結束 mount()，不再執行後續操作
  } // 結束 mount() 的目前區塊、參數或資料結構

  const returnTarget = appConsumeReturnTarget(); // 宣告不可重新指定的 returnTarget，供mount()使用
  if (returnTarget && returnTarget !== 'index.html') { // 檢查 (returnTarget && returnTarget !== 'index.html')；成立時才執行此分支
    window.location.replace(`./${returnTarget}`); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
    return; // 提前結束 mount()，不再執行後續操作
  } // 結束 mount() 的目前區塊、參數或資料結構

  signedOutCard.classList.add('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  signedInContent.classList.remove('hidden'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
  document.getElementById('home-name').textContent = appProfileName(app.profile, app.session); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  document.getElementById('home-email').textContent = app.session.user.email || '無 Email'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  document.getElementById('home-avatar').src = appProfileAvatar(app.profile, app.session); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  function updateEquipmentState() { // 定義 updateEquipmentState()：處理 現場 QR 認證與簽到簽退 的 updateEquipmentState 邏輯
    const isTransferring = Boolean(transferUser.value); // 宣告不可重新指定的 isTransferring，供updateEquipmentState()使用
    equipmentChecks.style.opacity = isTransferring ? '0.45' : '1'; // 續接 updateEquipmentState() 的運算、回呼或參數：equipmentChecks.style.opacity = isTransferring ? '0.45' : '1';
    transferUser.disabled = pageBusy; // 續接 updateEquipmentState() 的運算、回呼或參數：transferUser.disabled = pageBusy;

    for (const checkbox of equipmentChecks.querySelectorAll('input')) { // 依元素 ID 或 CSS 選擇器取得頁面控制項
      checkbox.disabled = pageBusy || isTransferring; // 續接 updateEquipmentState() 的運算、回呼或參數：checkbox.disabled = pageBusy || isTransferring;
    } // 結束 updateEquipmentState() 的目前區塊、參數或資料結構
  } // 結束 updateEquipmentState() 的目前區塊、參數或資料結構

  function setBusy(isBusy) { // 定義 setBusy()：切換處理狀態並避免重複操作
    pageBusy = isBusy; // 更新 pageBusy，保存本步處理結果
    updateActionAvailability(); // 呼叫 updateActionAvailability()，處理 現場 QR 認證與簽到簽退 的 updateActionAvailability 邏輯
    updateEquipmentState(); // 呼叫 updateEquipmentState()，處理 現場 QR 認證與簽到簽退 的 updateEquipmentState 邏輯
  } // 結束 setBusy() 的目前區塊、參數或資料結構

  function renderTransferOptions() { // 定義 renderTransferOptions()：處理 現場 QR 認證與簽到簽退 的 renderTransferOptions 邏輯
    const previousValue = transferUser.value; // 宣告不可重新指定的 previousValue，供renderTransferOptions()使用
    transferUser.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果

    const noTransfer = document.createElement('option'); // 建立 option DOM 元素，供後續填值與插入
    noTransfer.value = ''; // 續接 renderTransferOptions() 的運算、回呼或參數：noTransfer.value = '';
    noTransfer.textContent = '不交接，由我完成設備檢查'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    transferUser.appendChild(noTransfer); // 將建立的節點加入父容器，形成畫面內容

    for (const person of openPeople) { // 依 for (const person of openPeople) 逐項處理或重複等待
      if (person.user_id === app.session.user.id) continue; // 檢查 (person.user_id === app.session.user.id) continue;；成立時才執行此分支
      const option = document.createElement('option'); // 建立 option DOM 元素，供後續填值與插入
      option.value = person.user_id; // 續接 renderTransferOptions() 的運算、回呼或參數：option.value = person.user_id;
      option.textContent = `${person.profile.display_name}（${appRoleLabel(person.gym_role)}）`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      transferUser.appendChild(option); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 renderTransferOptions() 的目前區塊、參數或資料結構

    if ([...transferUser.options].some((option) => option.value === previousValue)) { // 檢查 ([...transferUser.options].some((option) => option.value === previousValue))；成立時才執行此分支
      transferUser.value = previousValue; // 續接 renderTransferOptions() 的運算、回呼或參數：transferUser.value = previousValue;
    } // 結束 renderTransferOptions() 的目前區塊、參數或資料結構
  } // 結束 renderTransferOptions() 的目前區塊、參數或資料結構

  function renderState() { // 定義 renderState()：處理 現場 QR 認證與簽到簽退 的 renderState 邏輯
    checkInControls.classList.toggle('hidden', Boolean(currentAttendance)); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    checkOutControls.classList.toggle('hidden', !currentAttendance); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態

    attendanceState.textContent = currentAttendance // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      ? `目前已簽到｜${appRoleLabel(currentAttendance.gym_role)}｜` + // 續接 renderState() 的運算、回呼或參數：? `目前已簽到｜${appRoleLabel(currentAttendance.gym_role)}｜` +
        `${appFormatTime(currentAttendance.checked_in_at)}` // 續接 renderState() 的運算、回呼或參數：`${appFormatTime(currentAttendance.checked_in_at)}`
      : '目前尚未簽到'; // 續接 renderState() 的運算、回呼或參數：: '目前尚未簽到';

    const isPrimary = currentAttendance?.gym_role === 'primary'; // 宣告不可重新指定的 isPrimary，供renderState()使用
    primaryCheckoutControls.classList.toggle('hidden', !isPrimary); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
    renderTransferOptions(); // 呼叫 renderTransferOptions()，處理 現場 QR 認證與簽到簽退 的 renderTransferOptions 邏輯
    renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
    updateEquipmentState(); // 呼叫 updateEquipmentState()，處理 現場 QR 認證與簽到簽退 的 updateEquipmentState 邏輯
  } // 結束 renderState() 的目前區塊、參數或資料結構

  async function loadState(successMessage = '') { // 定義 loadState()：處理 現場 QR 認證與簽到簽退 的 loadState 邏輯
    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    appSetMessage('正在同步簽到狀態……'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯

    try { // 開始可捕捉例外的操作範圍
      openPeople = await appLoadOpenPeople(); // 更新 openPeople，保存本步處理結果
      currentAttendance = // 更新 currentAttendance，保存本步處理結果
        openPeople.find((person) => person.user_id === app.session.user.id) || null; // 呼叫 openPeople.find()，處理 現場 QR 認證與簽到簽退 的 find 邏輯

      if (!currentAttendance) await validatePresenceToken(); // 檢查 (!currentAttendance) await validatePresenceToken();；成立時才執行此分支
      renderState(); // 呼叫 renderState()，處理 現場 QR 認證與簽到簽退 的 renderState 邏輯
      const defaultMessage = currentAttendance // 宣告不可重新指定的 defaultMessage，供loadState()使用
        ? '簽到狀態已同步；簽退不需要現場 QR Code。' // 續接 loadState() 的運算、回呼或參數：? '簽到狀態已同步；簽退不需要現場 QR Code。'
        : presenceState.valid // 續接 loadState() 的運算、回呼或參數：: presenceState.valid
          ? '現場認證有效，請選擇身分並完成簽到。' // 續接 loadState() 的運算、回呼或參數：? '現場認證有效，請選擇身分並完成簽到。'
          : '簽到狀態已同步；簽到前請掃描現場 QR Code。'; // 續接 loadState() 的運算、回呼或參數：: '簽到狀態已同步；簽到前請掃描現場 QR Code。';
      appSetMessage(successMessage || defaultMessage, 'success'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error(error); // 把偵錯或測試資訊寫到開發者主控台
      appSetMessage(`讀取資料失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      renderPresenceState(); // 呼叫 renderPresenceState()，處理 現場 QR 認證與簽到簽退 的 renderPresenceState 邏輯
    } // 結束 loadState() 的目前區塊、參數或資料結構
  } // 結束 loadState() 的目前區塊、參數或資料結構

  async function showDailyStamp(kind, data) { // 定義 showDailyStamp()：處理 現場 QR 認證與簽到簽退 的 showDailyStamp 邏輯
    try { // 開始可捕捉例外的操作範圍
      await afterAttendance(kind, app, data); // 等待非同步操作完成後，才繼續同一流程
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      // A local add-on must never turn a successful attendance operation into failure.
      console.warn('Local stamp view unavailable', error); // 呼叫 console.warn()，處理 現場 QR 認證與簽到簽退 的 warn 邏輯
      appSetMessage('簽到／簽退已成功，但本機集章畫面未能開啟。', 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
    } // 結束 showDailyStamp() 的目前區塊、參數或資料結構
  } // 結束 showDailyStamp() 的目前區塊、參數或資料結構

  checkInButton.addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
    if (pageBusy) return; // 檢查 (pageBusy) return;；成立時才執行此分支
    if (!presenceState.valid || !presenceToken) { // 檢查 (!presenceState.valid || !presenceToken)；成立時才執行此分支
      appSetMessage('請先在現場感應裝置並掃描有效的 QR Code。', 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    const selectedRole = document.querySelector('input[name="gym-role"]:checked').value; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    appSetMessage('正在驗證現場 QR Code 並簽到……'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯

    const { data, error } = await AttendanceRepository.checkIn({ // 續接 事件回呼() 的運算、回呼或參數：const { data, error } = await AttendanceRepository.checkIn({
      presence_token: presenceToken, // 設定 presence_token 欄位的值或型別
      requested_role: selectedRole, // 設定 requested_role 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (error) { // 檢查 (error)；成立時才執行此分支
      appSetMessage(`簽到失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      await validatePresenceToken(); // 等待非同步操作完成後，才繼續同一流程
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    presenceToken = null; // 更新 現場認證 Token，保存本步處理結果
    clearStoredPresenceToken(); // 呼叫 clearStoredPresenceToken()，處理 現場 QR 認證與簽到簽退 的 clearStoredPresenceToken 邏輯
    // Save from the successful RPC response, never from button clicks or page views.
    await showDailyStamp('in', data); // 等待非同步操作完成後，才繼續同一流程
    await loadState('現場認證成功，簽到完成。'); // 等待非同步操作完成後，才繼續同一流程
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  checkOutButton.addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
    if (pageBusy || !currentAttendance) return; // 檢查 (pageBusy || !currentAttendance) return;；成立時才執行此分支
    const isPrimary = currentAttendance?.gym_role === 'primary'; // 宣告不可重新指定的 isPrimary，供事件回呼()使用
    const transferTo = isPrimary && transferUser.value ? transferUser.value : null; // 宣告不可重新指定的 transferTo，供事件回呼()使用
    const trashChecked = document.getElementById('trash-check').checked; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    const acLightsChecked = document.getElementById('ac-lights-check').checked; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    const dehumidifierChecked = document.getElementById('dehumidifier-check').checked; // 依元素 ID 或 CSS 選擇器取得頁面控制項

    if (isPrimary && !transferTo && !(trashChecked && acLightsChecked && dehumidifierChecked)) { // 檢查 (isPrimary && !transferTo && !(trashChecked && acLightsChecked && dehumidifierChecked))；成立時才執行此分支
      appSetMessage('主要借用者必須完成三項設備檢查，或選擇責任交接。', 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    appSetMessage('正在簽退……'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯

    const { data, error } = await AttendanceRepository.checkOut({ // 續接 事件回呼() 的運算、回呼或參數：const { data, error } = await AttendanceRepository.checkOut({
      transfer_to_user_id: transferTo, // 設定 transfer_to_user_id 欄位的值或型別
      trash_is_checked: trashChecked, // 設定 trash_is_checked 欄位的值或型別
      ac_lights_are_checked: acLightsChecked, // 設定 ac_lights_are_checked 欄位的值或型別
      dehumidifier_is_checked: dehumidifierChecked, // 設定 dehumidifier_is_checked 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (error) { // 檢查 (error)；成立時才執行此分支
      appSetMessage(`簽退失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    presenceToken = null; // 更新 現場認證 Token，保存本步處理結果
    clearStoredPresenceToken(); // 呼叫 clearStoredPresenceToken()，處理 現場 QR 認證與簽到簽退 的 clearStoredPresenceToken 邏輯
    presenceState = { // 更新 presenceState，保存本步處理結果
      valid: false, // 設定 valid 欄位的值或型別
      kind: 'missing', // 設定 kind 欄位的值或型別
      message: '下次簽到時，請重新掃描現場 QR Code。', // 設定 message 欄位的值或型別
      expiresAt: null, // 設定 expiresAt 欄位的值或型別
    }; // 結束 事件回呼() 的目前區塊、參數或資料結構
    document.getElementById('trash-check').checked = false; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    document.getElementById('ac-lights-check').checked = false; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    document.getElementById('dehumidifier-check').checked = false; // 依元素 ID 或 CSS 選擇器取得頁面控制項
    transferUser.value = ''; // 續接 事件回呼() 的運算、回呼或參數：transferUser.value = '';
    await showDailyStamp('out', data); // 等待非同步操作完成後，才繼續同一流程
    await loadState('簽退成功。下次簽到請重新掃描現場 QR Code。'); // 等待非同步操作完成後，才繼續同一流程
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  logoutButton.addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
    logoutButton.disabled = true; // 續接 事件回呼() 的運算、回呼或參數：logoutButton.disabled = true;
    try { // 開始可捕捉例外的操作範圍
      await appSignOut(); // 等待非同步操作完成後，才繼續同一流程
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      appSetMessage(`登出失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 現場 QR 認證與簽到簽退 的 appSetMessage 邏輯
      logoutButton.disabled = false; // 續接 事件回呼() 的運算、回呼或參數：logoutButton.disabled = false;
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  app.client.auth.onAuthStateChange((_event, session) => { // 呼叫 app.client.auth.onAuthStateChange()，處理 現場 QR 認證與簽到簽退 的 onAuthStateChange 邏輯
    if (session?.user?.id !== app.session.user.id) { // 檢查 (session?.user?.id !== app.session.user.id)；成立時才執行此分支
      document.getElementById('stamp-dialog')?.close(); // 依元素 ID 或 CSS 選擇器取得頁面控制項
      window.location.replace('./index.html'); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  transferUser.addEventListener('change', updateEquipmentState); // 綁定 change 事件，交由回呼處理使用者操作
  refreshButton.addEventListener('click', () => loadState()); // 綁定 click 事件，交由回呼處理使用者操作

  await loadState(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
