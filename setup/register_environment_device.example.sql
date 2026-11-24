-- OPTIONAL: use only if the original device ID/secret is unavailable.
-- Updating an existing device secret also changes its QR credentials.
do $$ -- 續接資料庫欄位、條件或回傳內容：do $$
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  wanted_code text := 'CHANGE_ME_DEVICE_ID'; -- 定義 wanted_code 欄位的 text 型別與有效範圍或預設值
  wanted_secret text := 'CHANGE_ME_DEVICE_SECRET'; -- 定義 wanted_secret 欄位的 text 型別與有效範圍或預設值
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if wanted_code like 'CHANGE_ME%' or wanted_secret like 'CHANGE_ME%' then -- 判斷 if wanted_code like 'CHANGE_ME%' or wanted_secret like 'CHANGE_ME%' then，決定是否允許本次操作
    raise exception 'Fill wanted_code and wanted_secret before running'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊
  if wanted_code !~ '^[a-z0-9][a-z0-9_-]{2,63}$' then -- 判斷 if wanted_code !~ '^[a-z0-9][a-z0-9_-]{2,63}$' then，決定是否允許本次操作
    raise exception 'Device ID: 3-64 lowercase letters/digits/underscore/hyphen'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊
  if length(wanted_secret)<32 or wanted_secret<>btrim(wanted_secret) then -- 判斷 if length(wanted_secret)<32 or wanted_secret<>btrim(wanted_secret) then，決定是否允許本次操作
    raise exception 'Use a random secret of 32+ characters with no surrounding spaces'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊
  insert into public.presence_devices (device_code,display_name,secret_hash,enabled) -- 新增資料列，由後續 values 或 select 提供內容
  values (wanted_code,'運動科學實驗室',encode(extensions.digest(convert_to(wanted_secret,'UTF8'),'sha256'),'hex'),true) -- 續接資料庫欄位、條件或回傳內容：values (wanted_code,'運動科學實驗室',encode(extensions.digest(convert_to(wanted_secret,'UTF8'),'sha256'),'h…
  on conflict(device_code) do update set secret_hash=excluded.secret_hash,display_name=excluded.display_name,enabled=true; -- 指定唯一鍵衝突時更新或略過，避免重複紀錄
end $$; -- 開始或結束 PL/pgSQL 變數與控制區塊
