import { FootprintsUI } from '../features/footprints/index.js'; // 載入已完成的足跡回呼
export async function afterAttendance(kind, app, data) { // 定義中心的跨模組完成回呼
  await FootprintsUI.present(kind, app, data); // 簽到／簽退完成後顯示足跡
} // 結束簽到完成回呼
