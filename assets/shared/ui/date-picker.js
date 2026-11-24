export function createRecordDatePicker({ // 定義 createRecordDatePicker()：處理 共用日期、表單與介面 的 createRecordDatePicker 邏輯
  input, // 續接 createRecordDatePicker() 的運算、回呼或參數：input,
  initialDate, // 續接 createRecordDatePicker() 的運算、回呼或參數：initialDate,
  loadActiveDates, // 續接 createRecordDatePicker() 的運算、回呼或參數：loadActiveDates,
  onChange, // 續接 createRecordDatePicker() 的運算、回呼或參數：onChange,
  clickOpens = true, // 更新 clickOpens，保存本步處理結果
}) { // 續接 createRecordDatePicker() 的運算、回呼或參數：}) {
  if (!input) return null; // 檢查 (!input) return null;；成立時才執行此分支

  if (typeof window.flatpickr !== 'function') { // 檢查 (typeof window.flatpickr !== 'function')；成立時才執行此分支
    input.type = 'date'; // 續接 createRecordDatePicker() 的運算、回呼或參數：input.type = 'date';
    if (initialDate) input.value = initialDate; // 檢查 (initialDate) input.value = initialDate;；成立時才執行此分支
    return null; // 回傳 null，交給 createRecordDatePicker() 的呼叫端
  } // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構

  const monthCache = new Map(); // 宣告不可重新指定的 monthCache，供createRecordDatePicker()使用
  let activeDates = new Set(); // 宣告可更新的 activeDates，供createRecordDatePicker()使用
  let loadSequence = 0; // 宣告可更新的 loadSequence，供createRecordDatePicker()使用

  function localDateString(date) { // 定義 localDateString()：處理 共用日期、表單與介面 的 localDateString 邏輯
    return [ // 回傳 [，交給 localDateString() 的呼叫端
      date.getFullYear(), // 呼叫 date.getFullYear()，處理 共用日期、表單與介面 的 getFullYear 邏輯
      String(date.getMonth() + 1).padStart(2, '0'), // 呼叫 String()，處理 共用日期、表單與介面 的 String 邏輯
      String(date.getDate()).padStart(2, '0'), // 呼叫 String()，處理 共用日期、表單與介面 的 String 邏輯
    ].join('-'); // 續接 localDateString() 的運算、回呼或參數：].join('-');
  } // 結束 localDateString() 的目前區塊、參數或資料結構

  function monthRange(year, monthIndex) { // 定義 monthRange()：處理 共用日期、表單與介面 的 monthRange 邏輯
    const start = new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 10); // 宣告不可重新指定的 start，供monthRange()使用
    const end = new Date(Date.UTC(year, monthIndex + 1, 1)).toISOString().slice(0, 10); // 宣告不可重新指定的 end，供monthRange()使用
    return { start, end, month: start.slice(0, 7) }; // 回傳 { start, end, month: start.slice(0, 7) }，交給 monthRange() 的呼叫端
  } // 結束 monthRange() 的目前區塊、參數或資料結構

  async function refreshMonth(instance) { // 定義 refreshMonth()：處理 共用日期、表單與介面 的 refreshMonth 邏輯
    const range = monthRange(instance.currentYear, instance.currentMonth); // 宣告不可重新指定的 range，供refreshMonth()使用
    const currentLoad = ++loadSequence; // 宣告不可重新指定的 currentLoad，供refreshMonth()使用

    try { // 開始可捕捉例外的操作範圍
      let dates = monthCache.get(range.month); // 宣告可更新的 dates，供refreshMonth()使用
      if (!dates) { // 檢查 (!dates)；成立時才執行此分支
        dates = await loadActiveDates(range); // 更新 dates，保存本步處理結果
        dates = Array.isArray(dates) ? dates : []; // 更新 dates，保存本步處理結果
        monthCache.set(range.month, dates); // 呼叫 monthCache.set()，處理 共用日期、表單與介面 的 set 邏輯
      } // 結束 refreshMonth() 的目前區塊、參數或資料結構
      if (currentLoad !== loadSequence) return; // 檢查 (currentLoad !== loadSequence) return;；成立時才執行此分支
      activeDates = new Set(dates); // 更新 activeDates，保存本步處理結果
      instance.redraw(); // 呼叫 instance.redraw()，處理 共用日期、表單與介面 的 redraw 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      if (currentLoad !== loadSequence) return; // 檢查 (currentLoad !== loadSequence) return;；成立時才執行此分支
      activeDates = new Set(); // 更新 activeDates，保存本步處理結果
      console.warn('Active date markers could not be loaded', error); // 呼叫 console.warn()，處理 共用日期、表單與介面 的 warn 邏輯
      instance.redraw(); // 呼叫 instance.redraw()，處理 共用日期、表單與介面 的 redraw 邏輯
    } // 結束 refreshMonth() 的目前區塊、參數或資料結構
  } // 結束 refreshMonth() 的目前區塊、參數或資料結構

  const locale = { // 宣告不可重新指定的 locale，供createRecordDatePicker()使用
    firstDayOfWeek: 1, // 設定 firstDayOfWeek 欄位的值或型別
    weekdays: { // 設定 weekdays 欄位的值或型別
      shorthand: ['日', '一', '二', '三', '四', '五', '六'], // 設定 shorthand 欄位的值或型別
      longhand: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], // 設定 longhand 欄位的值或型別
    }, // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構
    months: { // 設定 months 欄位的值或型別
      shorthand: [ // 設定 shorthand 欄位的值或型別
        '1月', // 提供 '1月', 文字、路徑或資料欄位值
        '2月', // 提供 '2月', 文字、路徑或資料欄位值
        '3月', // 提供 '3月', 文字、路徑或資料欄位值
        '4月', // 提供 '4月', 文字、路徑或資料欄位值
        '5月', // 提供 '5月', 文字、路徑或資料欄位值
        '6月', // 提供 '6月', 文字、路徑或資料欄位值
        '7月', // 提供 '7月', 文字、路徑或資料欄位值
        '8月', // 提供 '8月', 文字、路徑或資料欄位值
        '9月', // 提供 '9月', 文字、路徑或資料欄位值
        '10月', // 提供 '10月', 文字、路徑或資料欄位值
        '11月', // 提供 '11月', 文字、路徑或資料欄位值
        '12月', // 提供 '12月', 文字、路徑或資料欄位值
      ], // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構
      longhand: [ // 設定 longhand 欄位的值或型別
        '1月', // 提供 '1月', 文字、路徑或資料欄位值
        '2月', // 提供 '2月', 文字、路徑或資料欄位值
        '3月', // 提供 '3月', 文字、路徑或資料欄位值
        '4月', // 提供 '4月', 文字、路徑或資料欄位值
        '5月', // 提供 '5月', 文字、路徑或資料欄位值
        '6月', // 提供 '6月', 文字、路徑或資料欄位值
        '7月', // 提供 '7月', 文字、路徑或資料欄位值
        '8月', // 提供 '8月', 文字、路徑或資料欄位值
        '9月', // 提供 '9月', 文字、路徑或資料欄位值
        '10月', // 提供 '10月', 文字、路徑或資料欄位值
        '11月', // 提供 '11月', 文字、路徑或資料欄位值
        '12月', // 提供 '12月', 文字、路徑或資料欄位值
      ], // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構
    }, // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構
  }; // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構

  const options = { // 宣告不可重新指定的 選項清單，供createRecordDatePicker()使用
    allowInput: false, // 設定 allowInput 欄位的值或型別
    clickOpens, // 續接 createRecordDatePicker() 的運算、回呼或參數：clickOpens,
    dateFormat: 'Y-m-d', // 設定 dateFormat 欄位的值或型別
    disableMobile: true, // 設定 disableMobile 欄位的值或型別
    locale, // 續接 createRecordDatePicker() 的運算、回呼或參數：locale,
    onReady: (_dates, _dateText, instance) => refreshMonth(instance), // 設定 onReady 欄位的值或型別
    onMonthChange: (_dates, _dateText, instance) => refreshMonth(instance), // 設定 onMonthChange 欄位的值或型別
    onYearChange: (_dates, _dateText, instance) => refreshMonth(instance), // 設定 onYearChange 欄位的值或型別
    onChange: (_dates, dateText) => { // 設定 onChange 欄位的值或型別
      if (dateText && typeof onChange === 'function') onChange(dateText); // 檢查 (dateText && typeof onChange === 'function') onChange(dateText);；成立時才執行此分支
    }, // 結束 onChange() 的目前區塊、參數或資料結構
    onDayCreate: (_dates, _dateText, _instance, dayElement) => { // 設定 onDayCreate 欄位的值或型別
      const dateText = localDateString(dayElement.dateObj); // 宣告不可重新指定的 dateText，供onDayCreate()使用
      if (!activeDates.has(dateText)) return; // 檢查 (!activeDates.has(dateText)) return;；成立時才執行此分支
      dayElement.classList.add('has-records'); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態
      dayElement.title = `${dateText}（有紀錄）`; // 續接 onDayCreate() 的運算、回呼或參數：dayElement.title = `${dateText}（有紀錄）`;
    }, // 結束 onDayCreate() 的目前區塊、參數或資料結構
  }; // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構

  if (initialDate) options.defaultDate = initialDate; // 檢查 (initialDate) options.defaultDate = initialDate;；成立時才執行此分支
  return window.flatpickr(input, options); // 回傳 window.flatpickr(input, options)，交給 createRecordDatePicker() 的呼叫端
} // 結束 createRecordDatePicker() 的目前區塊、參數或資料結構
