function download(data, filename) { // 定義 download()：處理 共用日期、表單與介面 的 download 邏輯
  const url = URL.createObjectURL( // 宣告不可重新指定的 url，供download()使用
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), // 把資料轉成 JSON 字串以傳送或保存
  ); // 結束 download() 的目前區塊、參數或資料結構
  const a = document.createElement('a'); // 建立 a DOM 元素，供後續填值與插入
  a.href = url; // 續接 download() 的運算、回呼或參數：a.href = url;
  a.download = filename; // 續接 download() 的運算、回呼或參數：a.download = filename;
  a.click(); // 呼叫 a.click()，處理 共用日期、表單與介面 的 click 邏輯
  setTimeout(() => URL.revokeObjectURL(url), 30000); // 註冊一次性的延遲操作或逾時取消，避免請求一直等待
} // 結束 download() 的目前區塊、參數或資料結構
async function readFile(file) { // 定義 readFile()：處理 共用日期、表單與介面 的 readFile 邏輯
  if (!file || file.size > 20 * 1024 * 1024) throw Error('請選擇 20 MB 內的 JSON 備份。'); // 檢查 (!file || file.size > 20 * 1024 * 1024) throw Error('請選擇 20 MB 內的 JSON 備份。');；成立時才執行此分支
  return JSON.parse(await file.text()); // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
} // 結束 readFile() 的目前區塊、參數或資料結構

export const FitnessFiles = { download, readFile }; // 宣告不可重新指定的 FitnessFiles，供共用日期、表單與介面使用
