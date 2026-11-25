import { pathToFileURL } from 'node:url'; // 從 node:url 載入相依介面，供簽到網站共用流程使用
import fs from 'node:fs/promises'; // 從 node:fs/promises 載入相依介面，供簽到網站共用流程使用
import assert from 'node:assert/strict'; // 從 node:assert/strict 載入相依介面，供簽到網站共用流程使用
const { PGlite } = await import( // 續接 簽到網站共用流程 的運算、回呼或參數：const { PGlite } = await import(
  process.env.QA_NODE_MODULES // 續接 簽到網站共用流程 的運算、回呼或參數：process.env.QA_NODE_MODULES
    ? pathToFileURL(process.env.QA_NODE_MODULES + '/@electric-sql/pglite/dist/index.js') // 續接 簽到網站共用流程 的運算、回呼或參數：? pathToFileURL(process.env.QA_NODE_MODULES + '/@electric-sql/pglite/dist/in…
    : '@electric-sql/pglite' // 續接 簽到網站共用流程 的運算、回呼或參數：: '@electric-sql/pglite'
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
const db = new PGlite(); // 宣告不可重新指定的 本機 IndexedDB，供簽到網站共用流程使用
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; grant usage on schema auth,public to anon,authenticated,service_role;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table profiles(id uuid primary key,status text); grant select on profiles to authenticated;
 create table presence_devices(id uuid primary key);
 insert into profiles values('11111111-1111-1111-1111-111111111111','active'),('22222222-2222-2222-2222-222222222222','inactive');
 insert into presence_devices values('33333333-3333-3333-3333-333333333333');`); // 續接 簽到網站共用流程 的運算、回呼或參數：insert into presence_devices values('33333333-3333-3333-3333-333333333333');…
await db.exec( // 等待非同步操作完成後，才繼續同一流程
  await fs.readFile( // 等待非同步操作完成後，才繼續同一流程
    new URL('../supabase/migrations/20261122000100_environment_latest.sql', import.meta.url), // 續接 簽到網站共用流程 的運算、回呼或參數：new URL('../supabase/migrations/20261122000100_environment_latest.sql', impo…
    'utf8', // 提供 'utf8', 文字、路徑或資料欄位值
  ), // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
const insert = `insert into environment_latest(device_id,device_code,display_name,temperature_c,humidity_pct,illuminance_lux,light_status,full_spectrum,infrared,wifi_rssi,uptime_s,sampled_at,received_at) values('33333333-3333-3333-3333-333333333333','room-esp32','Room',19.5,48.7,160.9,'ok',6013,795,-53,90,now(),now())`; // 建立測試案例，將下方操作與預期結果放在同一測試範圍
await db.exec('set role service_role'); // 等待非同步操作完成後，才繼續同一流程
await db.exec(insert); // 等待非同步操作完成後，才繼續同一流程
await db.exec(insert + ' on conflict(device_id) do update set temperature_c=20.0'); // 等待非同步操作完成後，才繼續同一流程
assert.equal((await db.query('select count(*)::int as n from environment_latest')).rows[0].n, 1); // 測試斷言：檢查 assert.equal((await db.query('select count(*)::int as n from environment_latest')).rows[0].n, 1)… 所要求的行為
await db.exec( // 等待非同步操作完成後，才繼續同一流程
  "set role authenticated;select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false)", // 提供 "set role authenticated;select set_config('request.jwt.claim.sub','11111111-1111… 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
assert.equal( // 測試斷言：檢查 assert.equal( 所要求的行為
  (await db.query('select temperature_c from environment_latest')).rows[0].temperature_c, // 續接 簽到網站共用流程 的運算、回呼或參數：(await db.query('select temperature_c from environment_latest')).rows[0].tem…
  20, // 續接 簽到網站共用流程 的運算、回呼或參數：20,
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
for (const sql of [ // 依 for (const sql of [ 逐項處理或重複等待
  'update environment_latest set temperature_c=50', // 提供 'update environment_latest set temperature_c=50', 文字、路徑或資料欄位值
  'delete from environment_latest', // 提供 'delete from environment_latest', 文字、路徑或資料欄位值
  insert, // 續接 簽到網站共用流程 的運算、回呼或參數：insert,
]) // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
  await assert.rejects(db.exec(sql), /permission denied/); // 測試斷言：檢查 await assert.rejects(db.exec(sql), /permission denied/); 所要求的行為
await db.exec( // 等待非同步操作完成後，才繼續同一流程
  "select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false)", // 提供 "select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222… 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
assert.equal((await db.query('select * from environment_latest')).rows.length, 0); // 測試斷言：檢查 assert.equal((await db.query('select * from environment_latest')).rows.length, 0); 所要求的行為
await db.exec('set role anon'); // 等待非同步操作完成後，才繼續同一流程
await assert.rejects(db.exec('select * from environment_latest'), /permission denied/); // 測試斷言：檢查 await assert.rejects(db.exec('select * from environment_latest'), /permission denied/); 所要求的行為
await db.exec('set role service_role'); // 等待非同步操作完成後，才繼續同一流程
for (const sql of [ // 依 for (const sql of [ 逐項處理或重複等待
  'update environment_latest set humidity_pct=101', // 提供 'update environment_latest set humidity_pct=101', 文字、路徑或資料欄位值
  "update environment_latest set illuminance_lux='NaN'::float8", // 提供 "update environment_latest set illuminance_lux='NaN'::float8", 文字、路徑或資料欄位值
  "update environment_latest set light_status='error'", // 提供 "update environment_latest set light_status='error'", 文字、路徑或資料欄位值
]) // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
  await assert.rejects(db.exec(sql), /check constraint/); // 測試斷言：檢查 await assert.rejects(db.exec(sql), /check constraint/); 所要求的行為
await db.exec( // 等待非同步操作完成後，才繼續同一流程
  "update environment_latest set temperature_c=null,humidity_pct=null,illuminance_lux=null,light_status='error',full_spectrum=null,infrared=null", // 提供 "update environment_latest set temperature_c=null,humidity_pct=null,illuminance_… 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
await db.close(); // 等待非同步操作完成後，才繼續同一流程
console.log( // 把偵錯或測試資訊寫到開發者主控台
  'PASS SQL migration, RLS, service upsert, active-user reads, inactive/anonymous denial, write denial and constraints', // 提供 'PASS SQL migration, RLS, service upsert, active-user reads, inactive/anonymous … 文字、路徑或資料欄位值
); // 結束 簽到網站共用流程 的目前區塊、參數或資料結構
