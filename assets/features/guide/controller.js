import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供簽到網站共用流程使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  await appInit({ requireAuth: false }); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
