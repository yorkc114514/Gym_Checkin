import { client, initializeClient } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { REDIRECT_URL, RETURN_TO_KEY } from '../../core/config.js'; // 從 ../../core/config.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { setMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { mountShell, updateAuthShell } from '../../shared/ui/shell.js'; // 從 ../../shared/ui/shell.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { fetchProfile } from '../profiles/index.js'; // 從 ../profiles/index.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { rememberCurrentPage } from './return-target.js'; // 從 ./return-target.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
import { mountNameForm, ensureConfirmedName } from './onboarding.js'; // 從 ./onboarding.js 載入相依介面，供Google 登入、登入狀態與姓名確認使用
let currentSession = null, // 宣告可更新的 目前登入狀態，供Google 登入、登入狀態與姓名確認使用
  currentProfile = null, // 更新 目前使用者資料，保存本步處理結果
  authSubscription = null, // 更新 authSubscription，保存本步處理結果
  sessionRefreshPromise = null; // 更新 sessionRefreshPromise，保存本步處理結果
export async function signInWithGoogle() { // 定義 signInWithGoogle()：啟動 Google OAuth 登入
  setMessage('正在前往 Google 登入……'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
  const { error } = await client.auth.signInWithOAuth({ // 續接 signInWithGoogle() 的運算、回呼或參數：const { error } = await client.auth.signInWithOAuth({
    provider: 'google', // 設定 provider 欄位的值或型別
    options: { redirectTo: REDIRECT_URL }, // 設定 選項清單 欄位的值或型別
  }); // 結束 signInWithGoogle() 的目前區塊、參數或資料結構

  if (error) { // 檢查 (error)；成立時才執行此分支
    setMessage(`登入失敗：${error.message}`, 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
    throw error; // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 signInWithGoogle() 的目前區塊、參數或資料結構
} // 結束 signInWithGoogle() 的目前區塊、參數或資料結構

export async function signOut() { // 定義 signOut()：結束登入並返回首頁
  const { error } = await client.auth.signOut(); // 續接 signOut() 的運算、回呼或參數：const { error } = await client.auth.signOut();
  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  sessionStorage.removeItem(RETURN_TO_KEY); // 存取瀏覽器本機或分頁暫存，保存目前裝置的資料或登入返回位置
  window.location.href = './index.html'; // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
} // 結束 signOut() 的目前區塊、參數或資料結構
export async function init({ requireAuth = true } = {}) { // 定義 init()：掛載共用介面並確認登入與使用者資料
  mountShell(); // 呼叫 mountShell()，處理 Google 登入、登入狀態與姓名確認 的 mountShell 邏輯

  mountNameForm(); // 呼叫 mountNameForm()，處理 Google 登入、登入狀態與姓名確認 的 mountNameForm 邏輯
  try { // 開始可捕捉例外的操作範圍
    await initializeClient(); // 等待非同步操作完成後，才繼續同一流程
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    setMessage('Supabase 程式庫載入失敗，請重新整理頁面。', 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
    return null; // 回傳 null，交給 init() 的呼叫端
  } // 結束 init() 的目前區塊、參數或資料結構

  const { data, error } = await client.auth.getSession(); // 續接 init() 的運算、回呼或參數：const { data, error } = await client.auth.getSession();
  if (error) { // 檢查 (error)；成立時才執行此分支
    setMessage(`讀取登入狀態失敗：${error.message}`, 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
    return null; // 回傳 null，交給 init() 的呼叫端
  } // 結束 init() 的目前區塊、參數或資料結構

  currentSession = data.session; // 更新 目前登入狀態，保存本步處理結果
  if (!currentSession && requireAuth) { // 檢查 (!currentSession && requireAuth)；成立時才執行此分支
    rememberCurrentPage(); // 呼叫 rememberCurrentPage()，處理 Google 登入、登入狀態與姓名確認 的 rememberCurrentPage 邏輯
    window.location.replace('./index.html?login=required'); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
    return null; // 回傳 null，交給 init() 的呼叫端
  } // 結束 init() 的目前區塊、參數或資料結構

  if (currentSession) { // 檢查 (currentSession)；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      currentProfile = await fetchProfile(currentSession); // 更新 目前使用者資料，保存本步處理結果
    } catch (profileError) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error('Profile loading failed', profileError); // 把偵錯或測試資訊寫到開發者主控台
      setMessage(`讀取個人資料失敗：${profileError.message}`, 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
      return null; // 回傳 null，交給 init() 的呼叫端
    } // 結束 init() 的目前區塊、參數或資料結構
  } else { // 前一條件未成立時，執行 init() 的另一分支
    currentProfile = null; // 更新 目前使用者資料，保存本步處理結果
  } // 結束 init() 的目前區塊、參數或資料結構

  updateAuthShell(currentSession, currentProfile); // 呼叫 updateAuthShell()，處理 Google 登入、登入狀態與姓名確認 的 updateAuthShell 邏輯

  if (currentSession && currentProfile && !currentProfile.name_confirmed) { // 檢查 (currentSession && currentProfile && !currentProfile.name_confirmed)；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      currentProfile = await ensureConfirmedName(currentSession, currentProfile, signOut); // 更新 目前使用者資料，保存本步處理結果
      updateAuthShell(currentSession, currentProfile); // 呼叫 updateAuthShell()，處理 Google 登入、登入狀態與姓名確認 的 updateAuthShell 邏輯
    } catch (nameError) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error('Name onboarding failed', nameError); // 把偵錯或測試資訊寫到開發者主控台
      setMessage(`姓名設定失敗：${nameError.message}`, 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
      return null; // 回傳 null，交給 init() 的呼叫端
    } // 結束 init() 的目前區塊、參數或資料結構
  } // 結束 init() 的目前區塊、參數或資料結構

  const logoutButton = document.getElementById('drawer-logout-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  if (logoutButton && !logoutButton.dataset.bound) { // 檢查 (logoutButton && !logoutButton.dataset.bound)；成立時才執行此分支
    logoutButton.dataset.bound = 'true'; // 續接 init() 的運算、回呼或參數：logoutButton.dataset.bound = 'true';
    logoutButton.addEventListener('click', async () => { // 綁定 click 事件，交由回呼處理使用者操作
      logoutButton.disabled = true; // 續接 事件回呼() 的運算、回呼或參數：logoutButton.disabled = true;
      try { // 開始可捕捉例外的操作範圍
        await signOut(); // 等待非同步操作完成後，才繼續同一流程
      } catch (logoutError) { // 捕捉上方操作的錯誤，進入失敗處理
        setMessage(`登出失敗：${logoutError.message}`, 'error'); // 呼叫 setMessage()，處理 Google 登入、登入狀態與姓名確認 的 setMessage 邏輯
        logoutButton.disabled = false; // 續接 事件回呼() 的運算、回呼或參數：logoutButton.disabled = false;
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 init() 的目前區塊、參數或資料結構

  if (!authSubscription) { // 檢查 (!authSubscription)；成立時才執行此分支
    const result = client.auth.onAuthStateChange((event, session) => { // 宣告不可重新指定的 處理結果，供事件回呼()使用
      currentSession = session; // 更新 目前登入狀態，保存本步處理結果
      if (event === 'SIGNED_OUT' && requireAuth) { // 檢查 (event === 'SIGNED_OUT' && requireAuth)；成立時才執行此分支
        window.location.replace('./index.html'); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
    authSubscription = result.data.subscription; // 更新 authSubscription，保存本步處理結果
  } // 結束 init() 的目前區塊、參數或資料結構

  return { // 回傳 {，交給 init() 的呼叫端
    client, // 續接 init() 的運算、回呼或參數：client,
    session: currentSession, // 設定 登入工作階段 欄位的值或型別
    profile: currentProfile, // 設定 使用者資料 欄位的值或型別
  }; // 結束 init() 的目前區塊、參數或資料結構
} // 結束 init() 的目前區塊、參數或資料結構
export async function refreshCurrentSession() { // 定義 refreshCurrentSession()：處理 Google 登入、登入狀態與姓名確認 的 refreshCurrentSession 邏輯
  if (!sessionRefreshPromise) { // 檢查 (!sessionRefreshPromise)；成立時才執行此分支
    sessionRefreshPromise = (async () => { // 更新 sessionRefreshPromise，保存本步處理結果
      const { data, error } = await client.auth.refreshSession(); // 續接 事件回呼() 的運算、回呼或參數：const { data, error } = await client.auth.refreshSession();
      if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
      if (!data.session?.access_token) { // 檢查 (!data.session?.access_token)；成立時才執行此分支
        throw new Error('登入狀態已失效，請登出後重新登入'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
      } // 結束 事件回呼() 的目前區塊、參數或資料結構
      currentSession = data.session; // 更新 目前登入狀態，保存本步處理結果
      updateAuthShell(currentSession, currentProfile); // 呼叫 updateAuthShell()，處理 Google 登入、登入狀態與姓名確認 的 updateAuthShell 邏輯
      return currentSession; // 回傳 currentSession，交給 事件回呼() 的呼叫端
    })().finally(() => { // 續接 事件回呼() 的運算、回呼或參數：})().finally(() => {
      sessionRefreshPromise = null; // 更新 sessionRefreshPromise，保存本步處理結果
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  } // 結束 refreshCurrentSession() 的目前區塊、參數或資料結構

  return sessionRefreshPromise; // 回傳 sessionRefreshPromise，交給 refreshCurrentSession() 的呼叫端
} // 結束 refreshCurrentSession() 的目前區塊、參數或資料結構

export async function currentAccessToken(forceRefresh = false) { // 定義 currentAccessToken()：取得仍有效的使用者 access token
  if (!client) throw new Error('Supabase 尚未初始化'); // 檢查 (!client) throw new Error('Supabase 尚未初始化');；成立時才執行此分支

  if (forceRefresh) { // 檢查 (forceRefresh)；成立時才執行此分支
    const refreshedSession = await refreshCurrentSession(); // 宣告不可重新指定的 refreshedSession，供currentAccessToken()使用
    return refreshedSession.access_token; // 回傳 refreshedSession.access_token，交給 currentAccessToken() 的呼叫端
  } // 結束 currentAccessToken() 的目前區塊、參數或資料結構

  const { data, error } = await client.auth.getSession(); // 續接 currentAccessToken() 的運算、回呼或參數：const { data, error } = await client.auth.getSession();
  if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支
  if (!data.session?.access_token) { // 檢查 (!data.session?.access_token)；成立時才執行此分支
    throw new Error('請先使用 Google 帳號登入'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  } // 結束 currentAccessToken() 的目前區塊、參數或資料結構

  currentSession = data.session; // 更新 目前登入狀態，保存本步處理結果
  const expiresAtMs = Number(currentSession.expires_at || 0) * 1000; // 宣告不可重新指定的 expiresAtMs，供currentAccessToken()使用
  if (expiresAtMs && expiresAtMs <= Date.now() + 60_000) { // 檢查 (expiresAtMs && expiresAtMs <= Date.now() + 60_000)；成立時才執行此分支
    const refreshedSession = await refreshCurrentSession(); // 宣告不可重新指定的 refreshedSession，供currentAccessToken()使用
    return refreshedSession.access_token; // 回傳 refreshedSession.access_token，交給 currentAccessToken() 的呼叫端
  } // 結束 currentAccessToken() 的目前區塊、參數或資料結構

  return currentSession.access_token; // 回傳 currentSession.access_token，交給 currentAccessToken() 的呼叫端
} // 結束 currentAccessToken() 的目前區塊、參數或資料結構
