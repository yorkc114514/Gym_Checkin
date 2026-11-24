// Public API. Other features depend on this file rather than implementation paths.
export { consumeReturnTarget } from './return-target.js'; // 從 ./return-target.js 重新匯出公開介面，供Google 登入、登入狀態與姓名確認使用

export { init, signInWithGoogle, signOut, currentAccessToken } from './controller.js'; // 從 ./controller.js 重新匯出公開介面，供Google 登入、登入狀態與姓名確認使用
