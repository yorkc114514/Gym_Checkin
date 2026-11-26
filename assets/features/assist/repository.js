import { client } from '../../core/client.js'; // 從 ../../core/client.js 載入相依介面，供協助其他人簽退使用
export const AssistRepository = { checkOut: (args) => client.rpc('gym_assist_check_out', args) }; // 呼叫 Supabase 資料庫函式，由伺服器處理權限與交易
