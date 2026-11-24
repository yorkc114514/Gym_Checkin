import { client } from '../core/client.js'; // 從 ../core/client.js 載入相依介面，供簽到網站共用流程使用
import { currentAccessToken } from '../features/auth/index.js'; // 從 ../features/auth/index.js 載入相依介面，供簽到網站共用流程使用
export function isUnauthorizedFunctionResult(result) { // 定義 isUnauthorizedFunctionResult()：處理 簽到網站共用流程 的 isUnauthorizedFunctionResult 邏輯
  const responseStatus = Number(result?.error?.context?.status || 0); // 宣告不可重新指定的 responseStatus，供isUnauthorizedFunctionResult()使用
  const errorText = [result?.error?.message, result?.data?.error].filter(Boolean).join(' '); // 宣告不可重新指定的 errorText，供isUnauthorizedFunctionResult()使用
  return ( // 回傳 (，交給 isUnauthorizedFunctionResult() 的呼叫端
    responseStatus === 401 || // 更新 responseStatus，保存本步處理結果
    /\b401\b|JWT|\u767b\u5165\u72c0\u614b\u7121\u6548|\u8acb\u5148\u767b\u5165/i.test(errorText) // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  ); // 結束 isUnauthorizedFunctionResult() 的目前區塊、參數或資料結構
} // 結束 isUnauthorizedFunctionResult() 的目前區塊、參數或資料結構

export async function invokeUserFunction(functionName, body) { // 定義 invokeUserFunction()：處理 簽到網站共用流程 的 invokeUserFunction 邏輯
  let accessToken = await currentAccessToken(false); // 宣告可更新的 accessToken，供invokeUserFunction()使用
  let result = await client.functions.invoke(functionName, { // 宣告可更新的 處理結果，供invokeUserFunction()使用
    body, // 續接 invokeUserFunction() 的運算、回呼或參數：body,
    headers: { Authorization: `Bearer ${accessToken}` }, // 設定 HTTP 標頭 欄位的值或型別
  }); // 結束 invokeUserFunction() 的目前區塊、參數或資料結構

  if (isUnauthorizedFunctionResult(result)) { // 檢查 (isUnauthorizedFunctionResult(result))；成立時才執行此分支
    accessToken = await currentAccessToken(true); // 更新 accessToken，保存本步處理結果
    result = await client.functions.invoke(functionName, { // 更新 處理結果，保存本步處理結果
      body, // 續接 invokeUserFunction() 的運算、回呼或參數：body,
      headers: { Authorization: `Bearer ${accessToken}` }, // 設定 HTTP 標頭 欄位的值或型別
    }); // 結束 invokeUserFunction() 的目前區塊、參數或資料結構
  } // 結束 invokeUserFunction() 的目前區塊、參數或資料結構

  return result; // 回傳 result，交給 invokeUserFunction() 的呼叫端
} // 結束 invokeUserFunction() 的目前區塊、參數或資料結構

export async function functionErrorMessage(error, fallbackMessage) { // 定義 functionErrorMessage()：處理 簽到網站共用流程 的 functionErrorMessage 邏輯
  const response = error?.context; // 宣告不可重新指定的 伺服器回應，供functionErrorMessage()使用
  if (response && typeof response.clone === 'function') { // 檢查 (response && typeof response.clone === 'function')；成立時才執行此分支
    try { // 開始可捕捉例外的操作範圍
      const payload = await response.clone().json(); // 宣告不可重新指定的 payload，供functionErrorMessage()使用
      if (typeof payload?.error === 'string' && payload.error) { // 檢查 (typeof payload?.error === 'string' && payload.error)；成立時才執行此分支
        return payload.error; // 回傳 payload.error，交給 functionErrorMessage() 的呼叫端
      } // 結束 functionErrorMessage() 的目前區塊、參數或資料結構
    } catch { // 捕捉上方操作的錯誤，進入失敗處理
      // 使用一般錯誤訊息。
    } // 結束 functionErrorMessage() 的目前區塊、參數或資料結構
  } // 結束 functionErrorMessage() 的目前區塊、參數或資料結構
  return error?.message || fallbackMessage; // 回傳 error?.message || fallbackMessage，交給 functionErrorMessage() 的呼叫端
} // 結束 functionErrorMessage() 的目前區塊、參數或資料結構
