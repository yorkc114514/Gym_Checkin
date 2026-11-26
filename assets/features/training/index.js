// Public API. Other features depend on this file rather than implementation paths.
export { normalized, volume } from './metrics.js'; // 從 ./metrics.js 重新匯出公開介面，供本機訓練紀錄使用
export { TrainingStore } from './repository.js'; // 從 ./repository.js 重新匯出公開介面，供本機訓練紀錄使用
