import assert from 'node:assert/strict'; // 從 node:assert/strict 載入相依介面，供溫度、濕度與照度使用
import { test } from 'node:test'; // 從 node:test 載入相依介面，供溫度、濕度與照度使用
import { metric, readingState, ageText } from '../assets/features/environment/model.js'; // 從 ../assets/features/environment/model.js 載入相依介面，供溫度、濕度與照度使用
import { // 載入溫度、濕度與照度所需的模組；多行匯入項目於後續列出
  createEnvironmentHandler, // 續接 溫度、濕度與照度 的運算、回呼或參數：createEnvironmentHandler,
  validateReading, // 續接 溫度、濕度與照度 的運算、回呼或參數：validateReading,
  sha256Hex, // 續接 溫度、濕度與照度 的運算、回呼或參數：sha256Hex,
} from '../supabase/functions/ingest-environment/handler.ts'; // 續接 溫度、濕度與照度 的運算、回呼或參數：} from '../supabase/functions/ingest-environment/handler.ts';
const reading = { // 宣告不可重新指定的 reading，供溫度、濕度與照度使用
  temperature_c: 19.5, // 設定 攝氏溫度 欄位的值或型別
  humidity_pct: 48.7, // 設定 相對濕度百分比 欄位的值或型別
  illuminance_lux: 160.9, // 設定 照度 lx 欄位的值或型別
  light_status: 'ok', // 設定 光感測器狀態 欄位的值或型別
  full_spectrum: 6013, // 設定 全頻道原始光值 欄位的值或型別
  infrared: 795, // 設定 紅外線原始光值 欄位的值或型別
  wifi_rssi: -53, // 設定 Wi-Fi 訊號強度 欄位的值或型別
  uptime_s: 90, // 設定 開機秒數 欄位的值或型別
  sample_age_ms: 1000, // 設定 樣本年齡毫秒 欄位的值或型別
}; // 結束 溫度、濕度與照度 的目前區塊、參數或資料結構
test('payload: finite values, darkness, missing sensors, saturation, bounded sample age', () => { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  assert.equal(validateReading(reading).illuminance_lux, 160.9); // 測試斷言：檢查 assert.equal(validateReading(reading).illuminance_lux, 160.9); 所要求的行為
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    validateReading({ ...reading, illuminance_lux: 0, full_spectrum: 0, infrared: 0 }) // 呼叫 validateReading()，檢查環境資料格式、範圍與感測狀態
      .illuminance_lux, // 續接 事件回呼() 的運算、回呼或參數：.illuminance_lux,
    0, // 續接 事件回呼() 的運算、回呼或參數：0,
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(validateReading({ ...reading, temperature_c: null }).temperature_c, null); // 測試斷言：檢查 assert.equal(validateReading({ ...reading, temperature_c: null }).temperature_c, null); 所要求的行為
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    validateReading({ ...reading, light_status: 'saturated', illuminance_lux: null }) // 呼叫 validateReading()，檢查環境資料格式、範圍與感測狀態
      .illuminance_lux, // 續接 事件回呼() 的運算、回呼或參數：.illuminance_lux,
    null, // 續接 事件回呼() 的運算、回呼或參數：null,
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  for (const change of [ // 依 for (const change of [ 逐項處理或重複等待
    { humidity_pct: 101 }, // 續接 事件回呼() 的運算、回呼或參數：{ humidity_pct: 101 },
    { temperature_c: NaN }, // 續接 事件回呼() 的運算、回呼或參數：{ temperature_c: NaN },
    { temperature_c: '19.5' }, // 續接 事件回呼() 的運算、回呼或參數：{ temperature_c: '19.5' },
    { illuminance_lux: Infinity }, // 續接 事件回呼() 的運算、回呼或參數：{ illuminance_lux: Infinity },
    { illuminance_lux: -1 }, // 續接 事件回呼() 的運算、回呼或參數：{ illuminance_lux: -1 },
    { light_status: 'error' }, // 續接 事件回呼() 的運算、回呼或參數：{ light_status: 'error' },
    { light_status: 'ok', illuminance_lux: null }, // 續接 事件回呼() 的運算、回呼或參數：{ light_status: 'ok', illuminance_lux: null },
    { sample_age_ms: 10001 }, // 續接 事件回呼() 的運算、回呼或參數：{ sample_age_ms: 10001 },
    { infrared: 1.5 }, // 續接 事件回呼() 的運算、回呼或參數：{ infrared: 1.5 },
    { uptime_s: -1 }, // 續接 事件回呼() 的運算、回呼或參數：{ uptime_s: -1 },
    { light_status: 'saturated', illuminance_lux: null, full_spectrum: null }, // 續接 事件回呼() 的運算、回呼或參數：{ light_status: 'saturated', illuminance_lux: null, full_spectrum: null },
  ]) // 結束 事件回呼() 的目前區塊、參數或資料結構
    assert.throws(() => validateReading({ ...reading, ...change })); // 測試斷言：檢查 assert.throws(() => validateReading({ ...reading, ...change })); 所要求的行為
  assert.throws(() => validateReading({})); // 測試斷言：檢查 assert.throws(() => validateReading({})); 所要求的行為
  assert.throws(() => validateReading([])); // 測試斷言：檢查 assert.throws(() => validateReading([])); 所要求的行為
  const parsed = validateReading({ ...reading, device_id: 'forged', received_at: '2099-01-01' }); // 宣告不可重新指定的 parsed，供事件回呼()使用
  assert.equal(parsed.device_id, undefined); // 測試斷言：檢查 assert.equal(parsed.device_id, undefined); 所要求的行為
  assert.equal(parsed.received_at, undefined); // 測試斷言：檢查 assert.equal(parsed.received_at, undefined); 所要求的行為
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
test('display: zero vs null, stale times and partial errors', () => { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  const now = Date.parse('2026-11-22T01:00:00Z'); // 宣告不可重新指定的 目前時間，供事件回呼()使用
  const row = { // 宣告不可重新指定的 目前資料列，供事件回呼()使用
    ...reading, // 續接 事件回呼() 的運算、回呼或參數：...reading,
    received_at: new Date(now).toISOString(), // 設定 伺服器接收時間 欄位的值或型別
    sampled_at: new Date(now - 1000).toISOString(), // 設定 估算感測時間 欄位的值或型別
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(readingState(row, now), 'fresh'); // 測試斷言：檢查 assert.equal(readingState(row, now), 'fresh'); 所要求的行為
  assert.equal(readingState({ ...row, illuminance_lux: 0 }, now), 'fresh'); // 測試斷言：檢查 assert.equal(readingState({ ...row, illuminance_lux: 0 }, now), 'fresh'); 所要求的行為
  assert.equal(readingState({ ...row, temperature_c: null }, now), 'partial'); // 測試斷言：檢查 assert.equal(readingState({ ...row, temperature_c: null }, now), 'partial'); 所要求的行為
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    readingState({ ...row, light_status: 'saturated', illuminance_lux: null }, now), // 呼叫 readingState()，判斷資料是否過期或有感測異常
    'partial', // 提供 'partial', 文字、路徑或資料欄位值
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(readingState(row, now + 151000), 'stale'); // 測試斷言：檢查 assert.equal(readingState(row, now + 151000), 'stale'); 所要求的行為
  assert.equal(readingState({ ...row, received_at: 'broken' }, now), 'stale'); // 測試斷言：檢查 assert.equal(readingState({ ...row, received_at: 'broken' }, now), 'stale'); 所要求的行為
  assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
    readingState({ ...row, sampled_at: new Date(now + 60000).toISOString() }, now), // 呼叫 readingState()，判斷資料是否過期或有感測異常
    'stale', // 提供 'stale', 文字、路徑或資料欄位值
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(metric(null), '—'); // 測試斷言：檢查 assert.equal(metric(null), '—'); 所要求的行為
  assert.equal(metric(NaN), '—'); // 測試斷言：檢查 assert.equal(metric(NaN), '—'); 所要求的行為
  assert.equal(metric(0), '0.0'); // 測試斷言：檢查 assert.equal(metric(0), '0.0'); 所要求的行為
  assert.equal(ageText(new Date(now - 61000).toISOString(), now), '1 分 1 秒'); // 測試斷言：檢查 assert.equal(ageText(new Date(now - 61000).toISOString(), now), '1 分 1 秒'); 所要求的行為
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
test('endpoint: credential rejection, disabled devices, identity binding, persistence and failures', async () => { // 建立測試案例，將下方操作與預期結果放在同一測試範圍
  let writes = [], // 宣告可更新的 writes，供事件回呼()使用
    enabled = true, // 更新 enabled，保存本步處理結果
    lookupError = null, // 更新 lookupError，保存本步處理結果
    writeError = null; // 更新 writeError，保存本步處理結果
  const hash = await sha256Hex('test-only-secret'); // 宣告不可重新指定的 hash，供事件回呼()使用
  const client = { // 宣告不可重新指定的 Supabase 用戶端，供事件回呼()使用
    from(table) { // 呼叫 from()，處理 溫度、濕度與照度 的 from 邏輯
      if (table === 'presence_devices') // 檢查 (table === 'presence_devices')；成立時才執行此分支
        return { // 回傳 {，交給 from() 的呼叫端
          select() { // 呼叫 select()，處理 溫度、濕度與照度 的 select 邏輯
            return this; // 回傳 this，交給 select() 的呼叫端
          }, // 結束 select() 的目前區塊、參數或資料結構
          eq() { // 呼叫 eq()，處理 溫度、濕度與照度 的 eq 邏輯
            return this; // 回傳 this，交給 eq() 的呼叫端
          }, // 結束 eq() 的目前區塊、參數或資料結構
          async maybeSingle() { // 續接 maybeSingle() 的運算、回呼或參數：async maybeSingle() {
            return { // 回傳 {，交給 maybeSingle() 的呼叫端
              data: { // 設定 查詢或回應資料 欄位的值或型別
                id: 'trusted-device', // 設定 id 欄位的值或型別
                device_code: 'room-esp32', // 設定 裝置代碼 欄位的值或型別
                display_name: 'Room', // 設定 顯示名稱 欄位的值或型別
                enabled, // 續接 maybeSingle() 的運算、回呼或參數：enabled,
                secret_hash: hash, // 設定 secret_hash 欄位的值或型別
              }, // 結束 maybeSingle() 的目前區塊、參數或資料結構
              error: lookupError, // 設定 錯誤資訊 欄位的值或型別
            }; // 結束 maybeSingle() 的目前區塊、參數或資料結構
          }, // 結束 maybeSingle() 的目前區塊、參數或資料結構
        }; // 結束 from() 的目前區塊、參數或資料結構
      assert.equal(table, 'environment_latest'); // 測試斷言：檢查 assert.equal(table, 'environment_latest'); 所要求的行為
      return { // 回傳 {，交給 from() 的呼叫端
        async upsert(row, options) { // 續接 upsert() 的運算、回呼或參數：async upsert(row, options) {
          writes.push(row); // 呼叫 writes.push()，處理 溫度、濕度與照度 的 push 邏輯
          assert.equal(options.onConflict, 'device_id'); // 測試斷言：檢查 assert.equal(options.onConflict, 'device_id'); 所要求的行為
          return { error: writeError }; // 回傳 { error: writeError }，交給 upsert() 的呼叫端
        }, // 結束 upsert() 的目前區塊、參數或資料結構
      }; // 結束 from() 的目前區塊、參數或資料結構
    }, // 結束 from() 的目前區塊、參數或資料結構
  }; // 結束 事件回呼() 的目前區塊、參數或資料結構
  const handler = createEnvironmentHandler(() => client); // 宣告不可重新指定的 handler，供事件回呼()使用
  const request = (payload = reading, secret = 'test-only-secret', method = 'POST') => // 宣告不可重新指定的 HTTP 請求，供request()使用
    new Request('https://test.invalid', { // 續接 request() 的運算、回呼或參數：new Request('https://test.invalid', {
      method, // 續接 request() 的運算、回呼或參數：method,
      headers: { // 設定 HTTP 標頭 欄位的值或型別
        'content-type': 'application/json', // 提供 'content-type': 'application/json', 文字、路徑或資料欄位值
        'x-device-id': 'room-esp32', // 提供 'x-device-id': 'room-esp32', 文字、路徑或資料欄位值
        'x-device-secret': secret, // 提供 'x-device-secret': secret, 文字、路徑或資料欄位值
      }, // 結束 request() 的目前區塊、參數或資料結構
      ...(method === 'POST' ? { body: JSON.stringify(payload) } : {}), // 把資料轉成 JSON 字串以傳送或保存
    }); // 結束 request() 的目前區塊、參數或資料結構
  assert.equal((await handler(request(reading, '', 'OPTIONS'))).status, 200); // 測試斷言：檢查 assert.equal((await handler(request(reading, '', 'OPTIONS'))).status, 200); 所要求的行為
  assert.equal((await handler(request(reading, '', 'GET'))).status, 405); // 測試斷言：檢查 assert.equal((await handler(request(reading, '', 'GET'))).status, 405); 所要求的行為
  assert.equal((await handler(request(reading, ''))).status, 401); // 測試斷言：檢查 assert.equal((await handler(request(reading, ''))).status, 401); 所要求的行為
  assert.equal((await handler(request(reading, 'wrong'))).status, 401); // 測試斷言：檢查 assert.equal((await handler(request(reading, 'wrong'))).status, 401); 所要求的行為
  enabled = false; // 更新 enabled，保存本步處理結果
  assert.equal((await handler(request())).status, 401); // 測試斷言：檢查 assert.equal((await handler(request())).status, 401); 所要求的行為
  enabled = true; // 更新 enabled，保存本步處理結果
  assert.equal(writes.length, 0); // 測試斷言：檢查 assert.equal(writes.length, 0); 所要求的行為
  assert.equal((await handler(request({ ...reading, temperature_c: 99 }))).status, 400); // 測試斷言：檢查 assert.equal((await handler(request({ ...reading, temperature_c: 99 }))).status, 400); 所要求的行為
  assert.equal((await handler(request({ ...reading, padding: 'a'.repeat(5000) }))).status, 400); // 測試斷言：檢查 assert.equal((await handler(request({ ...reading, padding: 'a'.repeat(5000) }))).status, 400); 所要求的行為
  const response = await handler( // 宣告不可重新指定的 伺服器回應，供事件回呼()使用
    request({ ...reading, device_id: 'attacker', received_at: '2099-01-01' }), // 呼叫 request()，處理 溫度、濕度與照度 的 request 邏輯
  ); // 結束 事件回呼() 的目前區塊、參數或資料結構
  assert.equal(response.status, 200); // 測試斷言：檢查 assert.equal(response.status, 200); 所要求的行為
  assert.equal((await response.json()).ok, true); // 測試斷言：檢查 assert.equal((await response.json()).ok, true); 所要求的行為
  assert.equal(writes.length, 1); // 測試斷言：檢查 assert.equal(writes.length, 1); 所要求的行為
  assert.equal(writes[0].device_id, 'trusted-device'); // 測試斷言：檢查 assert.equal(writes[0].device_id, 'trusted-device'); 所要求的行為
  assert.equal(Date.parse(writes[0].received_at) - Date.parse(writes[0].sampled_at), 1000); // 測試斷言：檢查 assert.equal(Date.parse(writes[0].received_at) - Date.parse(writes[0].sampled_at), 1000); 所要求的行為
  assert(!('secret_hash' in writes[0])); // 測試斷言：檢查 assert(!('secret_hash' in writes[0])); 所要求的行為
  writeError = { code: '42P01' }; // 更新 writeError，保存本步處理結果
  assert.equal((await handler(request())).status, 500); // 測試斷言：檢查 assert.equal((await handler(request())).status, 500); 所要求的行為
  lookupError = { code: '42P01' }; // 更新 lookupError，保存本步處理結果
  assert.equal((await handler(request())).status, 500); // 測試斷言：檢查 assert.equal((await handler(request())).status, 500); 所要求的行為
}); // 結束 事件回呼() 的目前區塊、參數或資料結構
