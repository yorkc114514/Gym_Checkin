export const KEY = 'gym-rest-timer-v1:' + new URL('.', location.href).pathname; // 變更目前瀏覽器頁面或重新載入，配合登入與返回流程
export const TimerStorage = { // 宣告不可重新指定的 TimerStorage，供組間休息計時器使用
  read: () => JSON.parse(localStorage.getItem(KEY) || 'null'), // 解析 JSON 文字為資料物件；格式錯誤會進入例外處理
  write: (data) => localStorage.setItem(KEY, JSON.stringify(data)), // 把資料轉成 JSON 字串以傳送或保存
}; // 結束 組間休息計時器 的目前區塊、參數或資料結構
