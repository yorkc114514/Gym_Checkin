import assert from "node:assert/strict"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import fs from "node:fs/promises"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { createHash } from "node:crypto"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { pathToFileURL } from "node:url"; // 載入本機測試使用的 Node.js 介面或資料庫套件
import { test } from "node:test"; // 載入本機測試使用的 Node.js 介面或資料庫套件
const { PGlite } = await import(process.env.QA_NODE_MODULES // 建立本次測試使用的資料、時間或控制狀態
  ? pathToFileURL(process.env.QA_NODE_MODULES + "/@electric-sql/pglite/dist/index.js") // 續接資料庫測試步驟；多行 SQL 原文保持不變
  : "@electric-sql/pglite"); // 續接資料庫測試步驟；多行 SQL 原文保持不變
const hash = (value) => createHash("sha256").update(value).digest("hex"); // 以 SHA256 建立雜湊，對照資料庫應保存的雜湊值

test("10-minute migration, rerun, expiry RPC and reusable check-in", async () => { // 建立測試案例，下方逐項設定資料並檢查預期結果
  const db = new PGlite(); // 建立隔離的本機 PostgreSQL 測試資料庫
  try { // 續接資料庫測試步驟；多行 SQL 原文保持不變
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema extensions;
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      create function extensions.digest(value bytea, algorithm text) returns bytea language sql immutable strict as $$
        select case when algorithm='sha256' then pg_catalog.sha256(value) else null::bytea end $$;
      create table public.profiles(id uuid primary key, status text);
      create table public.attendance_sessions(
        id uuid primary key default gen_random_uuid(), user_id uuid not null,
        gym_role text not null, checked_out_at timestamptz);
      create unique index one_open_session on public.attendance_sessions(user_id) where checked_out_at is null;
      create function public.set_profile_updated_at() returns trigger language plpgsql as $$
        begin new.updated_at=now(); return new; end $$;
      create function public.gym_check_in(requested_role text) returns void language sql as $$ select $$;
      grant usage on schema public,auth to anon,authenticated;
      insert into public.profiles values
        ('11111111-1111-1111-1111-111111111111','active'),
        ('22222222-2222-2222-2222-222222222222','active');
    `); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    // Use the original migration. PGlite uses PostgreSQL's built-in SHA256 in place of pgcrypto only for this local test.
    const original = (await fs.readFile(new URL("../supabase/migrations/20260927000100_create_presence_qr_check_in.sql", import.meta.url), "utf8")) // 讀取專案實際的 Function 或 migration，不另複製一份假實作
      .replace("create extension if not exists pgcrypto with schema extensions;", ""); // 本機測試以 PostgreSQL 內建 SHA256 代替 pgcrypto extension；正式 migration 原檔不變
    await db.exec(original); // 先套用原本 QR 資料表與 RPC，重現升級前的資料庫
    await db.exec(`insert into presence_devices(id,device_code,display_name,secret_hash)
      values('33333333-3333-3333-3333-333333333333','room-esp32','Room',repeat('a',64))`); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    const insert = async (token, issued, expires) => db.query( // 建立本次測試使用的資料、時間或控制狀態
      "insert into presence_qr_tokens(token_hash,device_id,issued_at,expires_at) values($1,'33333333-3333-3333-3333-333333333333',$2,$3)", // 續接資料庫測試步驟；多行 SQL 原文保持不變
      [hash(token), issued.toISOString(), expires.toISOString()]); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    const now = new Date(); // 建立本次測試使用的資料、時間或控制狀態
    const tenMinutes = new Date(now.getTime() + 600000); // 以 600000 毫秒檢查或建立十分鐘有效期
    await assert.rejects(insert("old-limit-10-minute-token", now, tenMinutes), /check constraint/u); // 確認這個無效或無權限操作確實被拒絕
    const migration = await fs.readFile(new URL("../supabase/migrations/20261122000200_presence_token_10_minutes.sql", import.meta.url), "utf8"); // 讀取專案實際的 Function 或 migration，不另複製一份假實作
    await db.exec(migration); // 套用十分鐘有效期 SQL；重複呼叫時確認可安全重跑
    await db.exec(migration); // 套用十分鐘有效期 SQL；重複呼叫時確認可安全重跑
    const token = "shared-valid-10-minute-token"; // 建立本次測試使用的資料、時間或控制狀態
    await insert(token, now, tenMinutes); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    await assert.rejects(insert("over-limit-10-minute-token", now, new Date(tenMinutes.getTime() + 1)), /check constraint/u); // 確認這個無效或無權限操作確實被拒絕
    await assert.rejects(insert("zero-duration-test-token", now, now), /check constraint/u); // 確認這個無效或無權限操作確實被拒絕
    const expired = "expired-test-presence-token"; // 建立本次測試使用的資料、時間或控制狀態
    await insert(expired, new Date(now.getTime() - 610000), new Date(now.getTime() - 10000)); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    await db.exec("set role anon"); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    await assert.rejects(db.exec("select * from presence_qr_tokens"), /permission denied/u); // 確認這個無效或無權限操作確實被拒絕
    let status = (await db.query("select * from presence_token_status($1)", [token])).rows[0]; // 呼叫原本的 QR 狀態 RPC，確認有效碼與過期碼的判斷
    assert.equal(status.is_valid, true); // 測試斷言：比對實際結果與程式列出的預期值
    status = (await db.query("select * from presence_token_status($1)", [expired])).rows[0]; // 呼叫原本的 QR 狀態 RPC，確認有效碼與過期碼的判斷
    assert.equal(status.is_valid, false); // 測試斷言：比對實際結果與程式列出的預期值
    for (const user of ["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"]) { // 逐一切換測試使用者，驗證同一組 QR 可以供多人使用
      await db.exec("set role authenticated"); // 續接資料庫測試步驟；多行 SQL 原文保持不變
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]); // 以測試用 auth.uid 模擬不同的已登入使用者
      const session = (await db.query("select * from gym_check_in_with_presence($1,'member')", [token])).rows[0]; // 呼叫原本的簽到 RPC，驗證同一 QR 的多人簽到與到期拒絕
      assert.equal(session.user_id, user); // 測試斷言：比對實際結果與程式列出的預期值
      const again = (await db.query("select * from gym_check_in_with_presence($1,'member')", [token])).rows[0]; // 呼叫原本的簽到 RPC，驗證同一 QR 的多人簽到與到期拒絕
      assert.equal(again.id, session.id); // 測試斷言：比對實際結果與程式列出的預期值
      await assert.rejects(db.query("select * from gym_check_in_with_presence($1,'member')", [expired]), /已過期/u); // 確認這個無效或無權限操作確實被拒絕
    } // 結束目前的測試物件、函式呼叫或控制區塊
    await db.exec("reset role"); // 續接資料庫測試步驟；多行 SQL 原文保持不變
    assert.equal((await db.query("select count(*)::int as n from attendance_sessions")).rows[0].n, 2); // 測試斷言：比對實際結果與程式列出的預期值
    await db.exec("update presence_devices set enabled=false; set role anon"); // 控制測試裝置的啟用狀態，確認停用裝置不能取得 Token
    assert.equal((await db.query("select * from presence_token_status($1)", [token])).rows[0].is_valid, false); // 測試斷言：比對實際結果與程式列出的預期值
  } finally { // 無論斷言成功或失敗都執行資源清理
    await db.close(); // 結束測試並釋放本機資料庫資源
  } // 結束目前的測試物件、函式呼叫或控制區塊
}); // 結束目前的測試物件、函式呼叫或控制區塊
