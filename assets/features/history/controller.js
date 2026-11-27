import { loadHistory as queryHistory } from './repository.js'; // 從 ./repository.js 載入相依介面，供按日期查詢簽到紀錄使用
import { createRecordDatePicker as appCreateRecordDatePicker } from '../../shared/ui/date-picker.js'; // 從 ../../shared/ui/date-picker.js 載入相依介面，供按日期查詢簽到紀錄使用
import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供按日期查詢簽到紀錄使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供按日期查詢簽到紀錄使用
import { loadAttendanceActiveDates as appLoadAttendanceActiveDates } from '../attendance/index.js'; // 從 ../attendance/index.js 載入相依介面，供按日期查詢簽到紀錄使用
import { loadProfiles as appLoadProfiles } from '../profiles/index.js'; // 從 ../profiles/index.js 載入相依介面，供按日期查詢簽到紀錄使用
import { nextDateString as appNextDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供按日期查詢簽到紀錄使用
import { roleLabel as appRoleLabel } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供按日期查詢簽到紀錄使用
import { taipeiDateString as appTaipeiDateString } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供按日期查詢簽到紀錄使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const app = await appInit(); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支

  const dateInput = document.getElementById('history-date'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const refreshButton = document.getElementById('history-refresh-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const status = document.getElementById('history-status'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const list = document.getElementById('history-list'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  let datePicker = null; // 宣告可更新的 datePicker，供mount()使用

  function setStatus(text, type = '') { // 定義 setStatus()：處理 按日期查詢簽到紀錄 的 setStatus 邏輯
    status.textContent = text; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
    status.className = `section-status${type ? ` ${type}` : ''}`; // 續接 setStatus() 的運算、回呼或參數：status.className = `section-status${type ? ` ${type}` : ''}`;
  } // 結束 setStatus() 的目前區塊、參數或資料結構

  function setBusy(isBusy) { // 定義 setBusy()：切換處理狀態並避免重複操作
    dateInput.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：dateInput.disabled = isBusy;
    refreshButton.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：refreshButton.disabled = isBusy;
    refreshButton.textContent = isBusy ? '讀取中……' : '查詢紀錄'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
  } // 結束 setBusy() 的目前區塊、參數或資料結構

  function renderRecords(records) { // 定義 renderRecords()：處理 按日期查詢簽到紀錄 的 renderRecords 邏輯
    list.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果

    for (const record of records) { // 依 for (const record of records) 逐項處理或重複等待
      const row = document.createElement('li'); // 建立 li DOM 元素，供後續填值與插入
      const heading = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
      const name = document.createElement('strong'); // 建立 strong DOM 元素，供後續填值與插入
      const role = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
      const time = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
      const detail = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入

      row.className = 'history-row'; // 續接 renderRecords() 的運算、回呼或參數：row.className = 'history-row';
      heading.className = 'history-name-row'; // 續接 renderRecords() 的運算、回呼或參數：heading.className = 'history-name-row';
      role.className = 'role-badge'; // 續接 renderRecords() 的運算、回呼或參數：role.className = 'role-badge';
      time.className = 'history-time'; // 續接 renderRecords() 的運算、回呼或參數：time.className = 'history-time';
      detail.className = 'history-detail'; // 續接 renderRecords() 的運算、回呼或參數：detail.className = 'history-detail';

      name.textContent = record.user_name; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      role.textContent = appRoleLabel(record.gym_role); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      time.textContent = record.checked_out_at // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        ? `${appFormatTime(record.checked_in_at)} 簽到 → ` + // 續接 renderRecords() 的運算、回呼或參數：? `${appFormatTime(record.checked_in_at)} 簽到 → ` +
          `${appFormatTime(record.checked_out_at)} 簽退` // 續接 renderRecords() 的運算、回呼或參數：`${appFormatTime(record.checked_out_at)} 簽退`
        : `${appFormatTime(record.checked_in_at)} 簽到 → 尚未簽退`; // 續接 renderRecords() 的運算、回呼或參數：: `${appFormatTime(record.checked_in_at)} 簽到 → 尚未簽退`;

      const detailParts = []; // 宣告不可重新指定的 detailParts，供renderRecords()使用
      if (!record.checked_out_at) { // 檢查 (!record.checked_out_at)；成立時才執行此分支
        detailParts.push('目前仍在場'); // 呼叫 detailParts.push()，處理 按日期查詢簽到紀錄 的 push 邏輯
      } else if (record.checkout_method === 'assisted') { // 前一條件未成立時，執行 renderRecords() 的另一分支
        detailParts.push(`由「${record.checkout_name}」協助簽退`); // 呼叫 detailParts.push()，處理 按日期查詢簽到紀錄 的 push 邏輯
      } else { // 前一條件未成立時，執行 renderRecords() 的另一分支
        detailParts.push('本人簽退'); // 呼叫 detailParts.push()，處理 按日期查詢簽到紀錄 的 push 邏輯
      } // 結束 renderRecords() 的目前區塊、參數或資料結構

      if (record.transferred_to) { // 檢查 (record.transferred_to)；成立時才執行此分支
        detailParts.push(`責任交接給「${record.transfer_name}」`); // 呼叫 detailParts.push()，處理 按日期查詢簽到紀錄 的 push 邏輯
      } else if ( // 前一條件未成立時，執行 renderRecords() 的另一分支
        record.gym_role === 'primary' && // 續接 renderRecords() 的運算、回呼或參數：record.gym_role === 'primary' &&
        record.checked_out_at && // 續接 renderRecords() 的運算、回呼或參數：record.checked_out_at &&
        record.checkout_method === 'self' // 續接 renderRecords() 的運算、回呼或參數：record.checkout_method === 'self'
      ) { // 續接 renderRecords() 的運算、回呼或參數：) {
        detailParts.push('設備檢查完成'); // 呼叫 detailParts.push()，處理 按日期查詢簽到紀錄 的 push 邏輯
      } // 結束 renderRecords() 的目前區塊、參數或資料結構

      detail.textContent = detailParts.join('｜'); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      heading.append(name, role); // 將建立的節點加入父容器，形成畫面內容
      row.append(heading, time, detail); // 將建立的節點加入父容器，形成畫面內容
      list.appendChild(row); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 renderRecords() 的目前區塊、參數或資料結構
  } // 結束 renderRecords() 的目前區塊、參數或資料結構

  async function loadHistory() { // 定義 loadHistory()：處理 按日期查詢簽到紀錄 的 loadHistory 邏輯
    const selectedDate = dateInput.value; // 宣告不可重新指定的 selectedDate，供loadHistory()使用
    const nextDate = appNextDateString(selectedDate); // 宣告不可重新指定的 nextDate，供loadHistory()使用
    if (!nextDate) { // 檢查 (!nextDate)；成立時才執行此分支
      setStatus('請先選擇有效日期。', 'error'); // 呼叫 setStatus()，處理 按日期查詢簽到紀錄 的 setStatus 邏輯
      return; // 提前結束 loadHistory()，不再執行後續操作
    } // 結束 loadHistory() 的目前區塊、參數或資料結構

    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    setStatus('正在讀取簽到紀錄……'); // 呼叫 setStatus()，處理 按日期查詢簽到紀錄 的 setStatus 邏輯

    try { // 開始可捕捉例外的操作範圍
      const { data: sessions, error } = await queryHistory(selectedDate, nextDate); // 續接 loadHistory() 的運算、回呼或參數：const { data: sessions, error } = await queryHistory(selectedDate, nextDate)…

      if (error) throw error; // 檢查 (error) throw error;；成立時才執行此分支

      const profileIds = (sessions || []).flatMap((session) => [ // 宣告不可重新指定的 profileIds，供事件回呼()使用
        session.user_id, // 續接 事件回呼() 的運算、回呼或參數：session.user_id,
        session.checked_out_by, // 續接 事件回呼() 的運算、回呼或參數：session.checked_out_by,
        session.transferred_to, // 續接 事件回呼() 的運算、回呼或參數：session.transferred_to,
      ]); // 結束 事件回呼() 的目前區塊、參數或資料結構
      const profileMap = await appLoadProfiles(profileIds); // 宣告不可重新指定的 profileMap，供loadHistory()使用
      const records = (sessions || []).map((session) => ({ // 宣告不可重新指定的 紀錄清單，供事件回呼()使用
        ...session, // 續接 事件回呼() 的運算、回呼或參數：...session,
        user_name: profileMap.get(session.user_id)?.display_name || '未知使用者', // 設定 user_name 欄位的值或型別
        checkout_name: profileMap.get(session.checked_out_by)?.display_name || '未知使用者', // 設定 checkout_name 欄位的值或型別
        transfer_name: profileMap.get(session.transferred_to)?.display_name || '未知使用者', // 設定 transfer_name 欄位的值或型別
      })); // 結束 事件回呼() 的目前區塊、參數或資料結構

      renderRecords(records); // 呼叫 renderRecords()，處理 按日期查詢簽到紀錄 的 renderRecords 邏輯
      setStatus( // 呼叫 setStatus()，處理 按日期查詢簽到紀錄 的 setStatus 邏輯
        records.length > 0 ? `已讀取 ${records.length} 筆簽到紀錄。` : '此日期沒有簽到紀錄。', // 續接 loadHistory() 的運算、回呼或參數：records.length > 0 ? `已讀取 ${records.length} 筆簽到紀錄。` : '此日期沒有簽到紀錄。',
        records.length > 0 ? 'success' : '', // 續接 loadHistory() 的運算、回呼或參數：records.length > 0 ? 'success' : '',
      ); // 結束 loadHistory() 的目前區塊、參數或資料結構
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      list.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
      console.error('Attendance history loading failed', error); // 把偵錯或測試資訊寫到開發者主控台
      setStatus(`讀取失敗：${error.message}`, 'error'); // 呼叫 setStatus()，處理 按日期查詢簽到紀錄 的 setStatus 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    } // 結束 loadHistory() 的目前區塊、參數或資料結構
  } // 結束 loadHistory() 的目前區塊、參數或資料結構

  async function loadActiveDates({ start, end }) { // 定義 loadActiveDates()：處理 按日期查詢簽到紀錄 的 loadActiveDates 邏輯
    return appLoadAttendanceActiveDates(start, end); // 回傳 appLoadAttendanceActiveDates(start, end)，交給 loadActiveDates() 的呼叫端
  } // 結束 loadActiveDates() 的目前區塊、參數或資料結構

  const initialDate = appTaipeiDateString(); // 宣告不可重新指定的 initialDate，供mount()使用
  datePicker = appCreateRecordDatePicker({ // 更新 datePicker，保存本步處理結果
    input: dateInput, // 設定 輸入資料 欄位的值或型別
    initialDate, // 續接 mount() 的運算、回呼或參數：initialDate,
    loadActiveDates, // 續接 mount() 的運算、回呼或參數：loadActiveDates,
    onChange: loadHistory, // 設定 onChange 欄位的值或型別
  }); // 結束 mount() 的目前區塊、參數或資料結構
  if (!datePicker) { // 檢查 (!datePicker)；成立時才執行此分支
    dateInput.value = initialDate; // 續接 mount() 的運算、回呼或參數：dateInput.value = initialDate;
    dateInput.addEventListener('change', loadHistory); // 綁定 change 事件，交由回呼處理使用者操作
  } // 結束 mount() 的目前區塊、參數或資料結構
  refreshButton.addEventListener('click', loadHistory); // 綁定 click 事件，交由回呼處理使用者操作
  await loadHistory(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
