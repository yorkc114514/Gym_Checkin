export function createPresenceTokenStore() { // 定義 createPresenceTokenStore()：處理 現場 QR 認證與簽到簽退 的 createPresenceTokenStore 邏輯
  const PRESENCE_QUERY_KEY = 'presence_token'; // 宣告不可重新指定的 PRESENCE_QUERY_KEY，供createPresenceTokenStore()使用
  const PRESENCE_STORAGE_KEY = 'gym-presence-token-v1'; // 宣告不可重新指定的 PRESENCE_STORAGE_KEY，供createPresenceTokenStore()使用
  const PRESENCE_STORAGE_MAX_AGE_MS = 10 * 60 * 1000; // 宣告不可重新指定的 PRESENCE_STORAGE_MAX_AGE_MS，供createPresenceTokenStore()使用
  const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,200}$/; // 宣告不可重新指定的 TOKEN_PATTERN，供createPresenceTokenStore()使用

  function availableStorages() { // 定義 availableStorages()：處理 現場 QR 認證與簽到簽退 的 availableStorages 邏輯
    const stores = []; // 宣告不可重新指定的 stores，供availableStorages()使用
    for (const name of ['sessionStorage', 'localStorage']) { // 依 for (const name of ['sessionStorage', 'localStorage']) 逐項處理或重複等待
      try { // 開始可捕捉例外的操作範圍
        const store = window[name]; // 宣告不可重新指定的 store，供availableStorages()使用
        const testKey = `${PRESENCE_STORAGE_KEY}-test`; // 宣告不可重新指定的 testKey，供availableStorages()使用
        store.setItem(testKey, '1'); // 呼叫 store.setItem()，處理 現場 QR 認證與簽到簽退 的 setItem 邏輯
        store.removeItem(testKey); // 呼叫 store.removeItem()，處理 現場 QR 認證與簽到簽退 的 removeItem 邏輯
        stores.push(store); // 呼叫 stores.push()，處理 現場 QR 認證與簽到簽退 的 push 邏輯
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        // Safari privacy settings can make an individual storage unavailable.
      } // 結束 availableStorages() 的目前區塊、參數或資料結構
    } // 結束 availableStorages() 的目前區塊、參數或資料結構
    return stores; // 回傳 stores，交給 availableStorages() 的呼叫端
  } // 結束 availableStorages() 的目前區塊、參數或資料結構

  const tokenStores = availableStorages(); // 宣告不可重新指定的 tokenStores，供createPresenceTokenStore()使用

  function clearStoredPresenceToken() { // 定義 clearStoredPresenceToken()：處理 現場 QR 認證與簽到簽退 的 clearStoredPresenceToken 邏輯
    for (const store of tokenStores) { // 依 for (const store of tokenStores) 逐項處理或重複等待
      try { // 開始可捕捉例外的操作範圍
        store.removeItem(PRESENCE_STORAGE_KEY); // 呼叫 store.removeItem()，處理 現場 QR 認證與簽到簽退 的 removeItem 邏輯
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        // Ignore a storage becoming unavailable during the session.
      } // 結束 clearStoredPresenceToken() 的目前區塊、參數或資料結構
    } // 結束 clearStoredPresenceToken() 的目前區塊、參數或資料結構
  } // 結束 clearStoredPresenceToken() 的目前區塊、參數或資料結構

  function storePresenceToken(token) { // 定義 storePresenceToken()：處理 現場 QR 認證與簽到簽退 的 storePresenceToken 邏輯
    const value = JSON.stringify({ token, captured_at: Date.now() }); // 把資料轉成 JSON 字串以傳送或保存
    for (const store of tokenStores) { // 依 for (const store of tokenStores) 逐項處理或重複等待
      try { // 開始可捕捉例外的操作範圍
        store.setItem(PRESENCE_STORAGE_KEY, value); // 呼叫 store.setItem()，處理 現場 QR 認證與簽到簽退 的 setItem 邏輯
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        // One successful storage is enough to survive the OAuth round trip.
      } // 結束 storePresenceToken() 的目前區塊、參數或資料結構
    } // 結束 storePresenceToken() 的目前區塊、參數或資料結構
  } // 結束 storePresenceToken() 的目前區塊、參數或資料結構

  function readStoredPresenceToken() { // 定義 readStoredPresenceToken()：處理 現場 QR 認證與簽到簽退 的 readStoredPresenceToken 邏輯
    for (const store of tokenStores) { // 依 for (const store of tokenStores) 逐項處理或重複等待
      try { // 開始可捕捉例外的操作範圍
        const raw = store.getItem(PRESENCE_STORAGE_KEY); // 宣告不可重新指定的 raw，供readStoredPresenceToken()使用
        if (!raw) continue; // 檢查 (!raw) continue;；成立時才執行此分支
        const value = JSON.parse(raw); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
        if ( // 檢查 (；成立時才執行此分支
          TOKEN_PATTERN.test(value?.token || '') && // 建立測試案例，將下方操作與預期結果放在同一測試範圍
          Number.isFinite(value?.captured_at) && // 呼叫 Number.isFinite()，處理 現場 QR 認證與簽到簽退 的 isFinite 邏輯
          Date.now() - value.captured_at <= PRESENCE_STORAGE_MAX_AGE_MS // 呼叫 Date.now()，處理 現場 QR 認證與簽到簽退 的 now 邏輯
        ) { // 續接 readStoredPresenceToken() 的運算、回呼或參數：) {
          return value.token; // 回傳 value.token，交給 readStoredPresenceToken() 的呼叫端
        } // 結束 readStoredPresenceToken() 的目前區塊、參數或資料結構
      } catch { // 捕捉上方操作的錯誤，進入失敗處理
        // Try the next available storage.
      } // 結束 readStoredPresenceToken() 的目前區塊、參數或資料結構
    } // 結束 readStoredPresenceToken() 的目前區塊、參數或資料結構
    clearStoredPresenceToken(); // 呼叫 clearStoredPresenceToken()，處理 現場 QR 認證與簽到簽退 的 clearStoredPresenceToken 邏輯
    return null; // 回傳 null，交給 readStoredPresenceToken() 的呼叫端
  } // 結束 readStoredPresenceToken() 的目前區塊、參數或資料結構

  function capturePresenceToken() { // 定義 capturePresenceToken()：處理 現場 QR 認證與簽到簽退 的 capturePresenceToken 邏輯
    const url = new URL(window.location.href); // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
    const scannedValue = url.searchParams.get(PRESENCE_QUERY_KEY); // 宣告不可重新指定的 scannedValue，供capturePresenceToken()使用

    if (scannedValue !== null) { // 檢查 (scannedValue !== null)；成立時才執行此分支
      url.searchParams.delete(PRESENCE_QUERY_KEY); // 呼叫 url.searchParams.delete()，處理 現場 QR 認證與簽到簽退 的 delete 邏輯
      window.history.replaceState({}, document.title, url.toString()); // 呼叫 window.history.replaceState()，處理 現場 QR 認證與簽到簽退 的 replaceState 邏輯

      if (TOKEN_PATTERN.test(scannedValue)) { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
        storePresenceToken(scannedValue); // 呼叫 storePresenceToken()，處理 現場 QR 認證與簽到簽退 的 storePresenceToken 邏輯
        return { token: scannedValue, malformed: false }; // 回傳 { token: scannedValue, malformed: false }，交給 capturePresenceToken() 的呼叫端
      } // 結束 capturePresenceToken() 的目前區塊、參數或資料結構

      clearStoredPresenceToken(); // 呼叫 clearStoredPresenceToken()，處理 現場 QR 認證與簽到簽退 的 clearStoredPresenceToken 邏輯
      return { token: null, malformed: true }; // 回傳 { token: null, malformed: true }，交給 capturePresenceToken() 的呼叫端
    } // 結束 capturePresenceToken() 的目前區塊、參數或資料結構

    return { token: readStoredPresenceToken(), malformed: false }; // 回傳 { token: readStoredPresenceToken(), malformed: false }，交給 capturePresenceToken() 的呼叫端
  } // 結束 capturePresenceToken() 的目前區塊、參數或資料結構

  return { capturePresenceToken, clearStoredPresenceToken }; // 回傳 { capturePresenceToken, clearStoredPresenceToken }，交給 createPresenceTokenStore() 的呼叫端
} // 結束 createPresenceTokenStore() 的目前區塊、參數或資料結構
