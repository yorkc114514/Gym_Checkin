import assert from "node:assert/strict"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import fs from "node:fs/promises"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import vm from "node:vm"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { stripTypeScriptTypes } from "node:module"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { createHash, webcrypto } from "node:crypto"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { test } from "node:test"; // 載入本機測試使用的 Node.js 介面或資料庫套件

const source = (await fs.readFile(new URL("../supabase/functions/issue-presence-token/index.ts", import.meta.url), "utf8")) // 讀取專案實際的 Function 或 migration，不另複製一份假實作
  .replace(/^import\s+\{\s*createClient\s*\}\s+from\s+["']npm:@supabase\/supabase-js@2["'];[^\r\n]*(?:\r?\n)?/u, ""); // 將遠端 npm 匯入改由本機測試物件提供，其餘 Function 內容保留
const executable = stripTypeScriptTypes(source); // 只移除 TypeScript 型別，執行實際的 Function 程式
const hash = (value) => createHash("sha256").update(value).digest("hex"); // 以 SHA256 建立雜湊，對照資料庫應保存的雜湊值

test("real issue-presence-token handler: 600 seconds, auth and storage", async () => { // 建立測試案例，下方逐項設定資料並檢查預期結果
  let handler, enabled = true, lookupError = null, writeError = null; // 保存或模擬資料庫寫入失敗，驗證 Function 的錯誤回應
  const inserts = [], updates = [], cleanups = []; // 記錄測試物件收到的資料庫操作，供後續斷言比對
  const secret = "test-only-device-secret"; // 建立本次測試使用的資料、時間或控制狀態
  const client = { // 建立本次測試使用的資料、時間或控制狀態
    from(table) { // 續接 Function 測試設定、模擬回應或待比對欄位
      if (table === "presence_devices") return { // 續接 Function 測試設定、模擬回應或待比對欄位
        select() { return this; }, // 續接 Function 測試設定、模擬回應或待比對欄位
        eq(column, value) { // 續接 Function 測試設定、模擬回應或待比對欄位
          if (column === "device_code") assert.equal(value, "room-esp32"); // 測試斷言：比對實際結果與程式列出的預期值
          else assert.equal(value, "33333333-3333-3333-3333-333333333333"); // 測試斷言：比對實際結果與程式列出的預期值
          return this; // 回傳測試物件或操作結果，讓實際 Function 繼續執行
        }, // 結束目前的測試物件、函式呼叫或控制區塊
        async maybeSingle() { // 續接 Function 測試設定、模擬回應或待比對欄位
          return {data: {id: "33333333-3333-3333-3333-333333333333", enabled, secret_hash: hash(secret)}, error: lookupError}; // 提供已登記裝置的測試查詢結果，避免使用正式裝置密碼
        }, // 結束目前的測試物件、函式呼叫或控制區塊
        update(row) { updates.push(row); return this; } // 記錄測試物件收到的資料庫操作，供後續斷言比對
      }; // 結束目前的測試物件、函式呼叫或控制區塊
      assert.equal(table, "presence_qr_tokens"); // 測試斷言：比對實際結果與程式列出的預期值
      return { // 回傳測試物件或操作結果，讓實際 Function 繼續執行
        async insert(row) { inserts.push(row); return {error: writeError}; }, // 保存或模擬資料庫寫入失敗，驗證 Function 的錯誤回應
        delete() { return this; }, // 續接 Function 測試設定、模擬回應或待比對欄位
        async lt(column, value) { assert.equal(column, "expires_at"); cleanups.push(value); return {error: null}; } // 測試斷言：比對實際結果與程式列出的預期值
      }; // 結束目前的測試物件、函式呼叫或控制區塊
    } // 結束目前的測試物件、函式呼叫或控制區塊
  }; // 結束目前的測試物件、函式呼叫或控制區塊
  const env = { // 建立本次測試使用的資料、時間或控制狀態
    SUPABASE_URL: "https://unit-test.supabase.co", // 續接 Function 測試設定、模擬回應或待比對欄位
    SUPABASE_SERVICE_ROLE_KEY: "test-only-service-key", // 續接 Function 測試設定、模擬回應或待比對欄位
    CHECKIN_APP_URL: "https://death-momoi.github.io/gym-checkin-webapp/" // 續接 Function 測試設定、模擬回應或待比對欄位
  }; // 結束目前的測試物件、函式呼叫或控制區塊
  vm.runInNewContext(executable, { // 在隔離的 JavaScript 執行環境啟動實際 Function 入口
    Deno: {env: {get: (key) => env[key]}, serve: (fn) => { handler = fn; }}, // 模擬 Deno 的設定讀取與 serve 入口，不連線到正式 Supabase
    createClient: () => client, // 將 Supabase 用戶端換成測試物件，驗證讀取、寫入與失敗處理
    crypto: webcrypto, Request, Response, URL, TextEncoder, Uint8Array, // 續接 Function 測試設定、模擬回應或待比對欄位
    btoa, Date, console: {error() {}} // 續接 Function 測試設定、模擬回應或待比對欄位
  }); // 結束目前的測試物件、函式呼叫或控制區塊
  const request = (method = "POST", suppliedSecret = secret) => new Request("https://unit-test.invalid", { // 建立模擬 HTTP 請求，用於實際呼叫 Function handler
    method, headers: {"x-device-id": "room-esp32", "x-device-secret": suppliedSecret} // 續接 Function 測試設定、模擬回應或待比對欄位
  }); // 結束目前的測試物件、函式呼叫或控制區塊
  assert.equal((await handler(request("OPTIONS"))).status, 200); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal((await handler(request("GET"))).status, 405); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal((await handler(request("POST", ""))).status, 401); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal((await handler(request("POST", "wrong"))).status, 401); // 測試斷言：比對實際結果與程式列出的預期值
  enabled = false; // 控制測試裝置的啟用狀態，確認停用裝置不能取得 Token
  assert.equal((await handler(request())).status, 401); // 測試斷言：比對實際結果與程式列出的預期值
  enabled = true; // 控制測試裝置的啟用狀態，確認停用裝置不能取得 Token
  assert.equal(inserts.length, 0); // 測試斷言：比對實際結果與程式列出的預期值
  const first = await handler(request()); // 送出測試請求，檢查認證與十分鐘 Token 的實際回應
  assert.equal(first.status, 200); // 測試斷言：比對實際結果與程式列出的預期值
  const body = await first.json(); // 建立本次測試使用的資料、時間或控制狀態
  assert.equal(body.ok, true); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(body.expires_in, 600); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(Date.parse(body.expires_at) - Date.parse(body.issued_at), 600000); // 以 600000 毫秒檢查或建立十分鐘有效期
  assert.match(body.token, /^[A-Za-z0-9_-]{24}$/u); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(new URL(body.check_in_url).searchParams.get("presence_token"), body.token); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(inserts[0].token_hash, hash(body.token)); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(inserts[0].device_id, "33333333-3333-3333-3333-333333333333"); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(inserts[0].expires_at, body.expires_at); // 測試斷言：比對實際結果與程式列出的預期值
  assert(!Object.values(inserts[0]).includes(body.token)); // 記錄測試物件收到的資料庫操作，供後續斷言比對
  assert.equal(first.headers.get("cache-control"), "no-store"); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(updates.length, 1); // 測試斷言：比對實際結果與程式列出的預期值
  assert.equal(cleanups.length, 1); // 測試斷言：比對實際結果與程式列出的預期值
  const second = await (await handler(request())).json(); // 送出測試請求，檢查認證與十分鐘 Token 的實際回應
  assert.notEqual(second.token, body.token); // 測試斷言：比對實際結果與程式列出的預期值
  writeError = {message: "database rejected write"}; // 保存或模擬資料庫寫入失敗，驗證 Function 的錯誤回應
  assert.equal((await handler(request())).status, 500); // 測試斷言：比對實際結果與程式列出的預期值
  writeError = null; // 保存或模擬資料庫寫入失敗，驗證 Function 的錯誤回應
  lookupError = {code: "42P01"}; // 保存或模擬裝置查詢失敗，驗證錯誤處理
  assert.equal((await handler(request())).status, 500); // 測試斷言：比對實際結果與程式列出的預期值
}); // 結束目前的測試物件、函式呼叫或控制區塊
