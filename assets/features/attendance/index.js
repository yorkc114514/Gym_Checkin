// Public API. Other features depend on this file rather than implementation paths.
export { loadAttendanceActiveDates, loadOpenPeople } from './repository.js'; // 從 ./repository.js 重新匯出公開介面，供現場 QR 認證與簽到簽退使用
