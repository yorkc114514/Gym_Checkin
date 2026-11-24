create extension if not exists pgcrypto with schema extensions; -- 建立或定義 pgcrypto，供簽到網站共用流程使用

create table public.presence_devices ( -- 建立或定義 public.presence_devices，供簽到網站共用流程使用
  id uuid primary key default gen_random_uuid(), -- 定義 id 欄位的 uuid 型別與有效範圍或預設值
  device_code text not null unique -- 定義 裝置代碼 欄位的 text 型別與有效範圍或預設值
    check (device_code ~ '^[a-z0-9][a-z0-9_-]{2,63}$'), -- 定義資料一致性約束，在資料庫層拒絕非法值
  display_name text not null -- 定義 顯示名稱 欄位的 text 型別與有效範圍或預設值
    check (char_length(display_name) between 1 and 80), -- 定義資料一致性約束，在資料庫層拒絕非法值
  secret_hash text not null -- 定義 secret_hash 欄位的 text 型別與有效範圍或預設值
    check (secret_hash ~ '^[0-9a-f]{64}$'), -- 定義資料一致性約束，在資料庫層拒絕非法值
  enabled boolean not null default true, -- 定義 enabled 欄位的 boolean 型別與有效範圍或預設值
  last_seen_at timestamptz, -- 定義 last_seen_at 欄位的 timestamptz 型別與有效範圍或預設值
  created_at timestamptz not null default now(), -- 定義 created_at 欄位的 timestamptz 型別與有效範圍或預設值
  updated_at timestamptz not null default now() -- 定義 updated_at 欄位的 timestamptz 型別與有效範圍或預設值
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

comment on table public.presence_devices is -- 為資料表或欄位保存用途說明
  'Trusted on-site devices that may request short-lived check-in QR tokens'; -- 續接資料庫欄位、條件或回傳內容：'Trusted on-site devices that may request short-lived check-in QR tokens';

create trigger presence_devices_set_updated_at -- 建立或定義 presence_devices_set_updated_at，供簽到網站共用流程使用
before update on public.presence_devices -- 續接資料庫欄位、條件或回傳內容：before update on public.presence_devices
for each row -- 續接資料庫欄位、條件或回傳內容：for each row
execute function public.set_profile_updated_at(); -- 續接資料庫欄位、條件或回傳內容：execute function public.set_profile_updated_at();

alter table public.presence_devices enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制
revoke all on table public.presence_devices from anon, authenticated; -- 撤銷指定角色的操作權限，避免繞過應用流程


create table public.presence_qr_tokens ( -- 建立或定義 public.presence_qr_tokens，供簽到網站共用流程使用
  id uuid primary key default gen_random_uuid(), -- 定義 id 欄位的 uuid 型別與有效範圍或預設值
  token_hash text not null unique -- 定義 token_hash 欄位的 text 型別與有效範圍或預設值
    check (token_hash ~ '^[0-9a-f]{64}$'), -- 定義資料一致性約束，在資料庫層拒絕非法值
  device_id uuid not null -- 定義 裝置資料列識別碼 欄位的 uuid 型別與有效範圍或預設值
    references public.presence_devices(id) on delete cascade, -- 續接資料庫欄位、條件或回傳內容：references public.presence_devices(id) on delete cascade,
  issued_at timestamptz not null default now(), -- 定義 issued_at 欄位的 timestamptz 型別與有效範圍或預設值
  expires_at timestamptz not null, -- 定義 expires_at 欄位的 timestamptz 型別與有效範圍或預設值
  created_at timestamptz not null default now(), -- 定義 created_at 欄位的 timestamptz 型別與有效範圍或預設值

  constraint presence_qr_token_valid_lifetime -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      expires_at > issued_at -- 續接資料庫欄位、條件或回傳內容：expires_at > issued_at
      and expires_at <= issued_at + interval '2 minutes' -- 限制資料或判斷條件：and expires_at <= issued_at + interval '2 minutes'
    ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

comment on table public.presence_qr_tokens is -- 為資料表或欄位保存用途說明
  'Hashed, reusable-within-lifetime tokens issued by an on-site QR device'; -- 續接資料庫欄位、條件或回傳內容：'Hashed, reusable-within-lifetime tokens issued by an on-site QR device';

create index presence_qr_tokens_expiry -- 建立或定義 presence_qr_tokens_expiry，供簽到網站共用流程使用
on public.presence_qr_tokens (expires_at); -- 續接資料庫欄位、條件或回傳內容：on public.presence_qr_tokens (expires_at);

alter table public.presence_qr_tokens enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制
revoke all on table public.presence_qr_tokens from anon, authenticated; -- 撤銷指定角色的操作權限，避免繞過應用流程


create or replace function public.presence_token_status( -- 建立或定義 public.presence_token_status，供簽到網站共用流程使用
  presence_token text -- 定義 presence_token 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns table ( -- 宣告資料庫函式回傳的型別或欄位
  is_valid boolean, -- 定義 is_valid 欄位的 boolean 型別與有效範圍或預設值
  expires_at timestamptz, -- 定義 expires_at 欄位的 timestamptz 型別與有效範圍或預設值
  message text -- 定義 message 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
stable -- 續接資料庫欄位、條件或回傳內容：stable
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  token_record record; -- 續接資料庫欄位、條件或回傳內容：token_record record;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if presence_token is null -- 判斷 if presence_token is null，決定是否允許本次操作
     or char_length(presence_token) < 16 -- 限制資料或判斷條件：or char_length(presence_token) < 16
     or char_length(presence_token) > 200 then -- 限制資料或判斷條件：or char_length(presence_token) > 200 then
    return query -- 回傳結果或結束目前資料庫函式
    select false, null::timestamptz, 'QR Code 內沒有有效的現場認證碼'; -- 查詢欄位或運算結果，供權限判斷與資料回傳
    return; -- 回傳結果或結束目前資料庫函式
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  select -- 查詢欄位或運算結果，供權限判斷與資料回傳
    token.expires_at, -- 續接資料庫欄位、條件或回傳內容：token.expires_at,
    device.enabled -- 續接資料庫欄位、條件或回傳內容：device.enabled
  into token_record -- 續接資料庫欄位、條件或回傳內容：into token_record
  from public.presence_qr_tokens as token -- 指定查詢來源或關聯資料表
  join public.presence_devices as device -- 指定查詢來源或關聯資料表
    on device.id = token.device_id -- 續接資料庫欄位、條件或回傳內容：on device.id = token.device_id
  where token.token_hash = encode( -- 限制資料或判斷條件：where token.token_hash = encode(
    extensions.digest(convert_to(presence_token, 'UTF8'), 'sha256'), -- 續接資料庫欄位、條件或回傳內容：extensions.digest(convert_to(presence_token, 'UTF8'), 'sha256'),
    'hex' -- 續接資料庫欄位、條件或回傳內容：'hex'
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  limit 1; -- 續接資料庫欄位、條件或回傳內容：limit 1;

  if not found then -- 判斷 if not found then，決定是否允許本次操作
    return query -- 回傳結果或結束目前資料庫函式
    select false, null::timestamptz, '找不到這組現場認證碼'; -- 查詢欄位或運算結果，供權限判斷與資料回傳
    return; -- 回傳結果或結束目前資料庫函式
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if not token_record.enabled then -- 判斷 if not token_record.enabled then，決定是否允許本次操作
    return query -- 回傳結果或結束目前資料庫函式
    select false, token_record.expires_at, '現場 QR 裝置目前已停用'; -- 查詢欄位或運算結果，供權限判斷與資料回傳
    return; -- 回傳結果或結束目前資料庫函式
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if token_record.expires_at <= clock_timestamp() then -- 判斷 if token_record.expires_at <= clock_timestamp() then，決定是否允許本次操作
    return query -- 回傳結果或結束目前資料庫函式
    select false, token_record.expires_at, -- 查詢欄位或運算結果，供權限判斷與資料回傳
      '這個 QR Code 已過期，請在現場重新感應並掃描'; -- 續接資料庫欄位、條件或回傳內容：'這個 QR Code 已過期，請在現場重新感應並掃描';
    return; -- 回傳結果或結束目前資料庫函式
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return query -- 回傳結果或結束目前資料庫函式
  select true, token_record.expires_at, -- 查詢欄位或運算結果，供權限判斷與資料回傳
    '現場認證有效，可以進行簽到'; -- 續接資料庫欄位、條件或回傳內容：'現場認證有效，可以進行簽到';
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界


create or replace function public.gym_check_in_with_presence( -- 建立或定義 public.gym_check_in_with_presence，供簽到網站共用流程使用
  presence_token text, -- 定義 presence_token 欄位的 text 型別與有效範圍或預設值
  requested_role text default 'member' -- 定義 requested_role 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.attendance_sessions -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  current_user_id uuid := (select auth.uid()); -- 定義 current_user_id 欄位的 uuid 型別與有效範圍或預設值
  normalized_role text := -- 定義 normalized_role 欄位的 text 型別與有效範圍或預設值
    lower(btrim(coalesce(requested_role, 'member'))); -- 續接資料庫欄位、條件或回傳內容：lower(btrim(coalesce(requested_role, 'member')));
  result public.attendance_sessions; -- 續接資料庫欄位、條件或回傳內容：result public.attendance_sessions;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if current_user_id is null then -- 判斷 if current_user_id is null then，決定是否允許本次操作
    raise exception '請先登入 Google 帳號'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if normalized_role not in ('primary', 'member') then -- 判斷 if normalized_role not in ('primary', 'member') then，決定是否允許本次操作
    raise exception '無效的簽到身分'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if presence_token is null -- 判斷 if presence_token is null，決定是否允許本次操作
     or char_length(presence_token) < 16 -- 限制資料或判斷條件：or char_length(presence_token) < 16
     or char_length(presence_token) > 200 -- 限制資料或判斷條件：or char_length(presence_token) > 200
     or not exists ( -- 限制資料或判斷條件：or not exists (
       select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
       from public.presence_qr_tokens as token -- 指定查詢來源或關聯資料表
       join public.presence_devices as device -- 指定查詢來源或關聯資料表
         on device.id = token.device_id -- 續接資料庫欄位、條件或回傳內容：on device.id = token.device_id
       where token.token_hash = encode( -- 限制資料或判斷條件：where token.token_hash = encode(
         extensions.digest(convert_to(presence_token, 'UTF8'), 'sha256'), -- 續接資料庫欄位、條件或回傳內容：extensions.digest(convert_to(presence_token, 'UTF8'), 'sha256'),
         'hex' -- 續接資料庫欄位、條件或回傳內容：'hex'
       ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
         and token.issued_at <= clock_timestamp() + interval '10 seconds' -- 限制資料或判斷條件：and token.issued_at <= clock_timestamp() + interval '10 seconds'
         and token.expires_at > clock_timestamp() -- 限制資料或判斷條件：and token.expires_at > clock_timestamp()
         and device.enabled -- 限制資料或判斷條件：and device.enabled
     ) then -- 續接資料庫欄位、條件或回傳內容：) then
    raise exception '現場 QR Code 無效或已過期，請重新掃描'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if not exists ( -- 判斷 if not exists (，決定是否允許本次操作
    select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
    from public.profiles -- 指定查詢來源或關聯資料表
    where id = current_user_id -- 限制資料或判斷條件：where id = current_user_id
      and status = 'active' -- 限制資料或判斷條件：and status = 'active'
  ) then -- 續接資料庫欄位、條件或回傳內容：) then
    raise exception '使用者不存在或已停用'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  insert into public.attendance_sessions ( -- 新增資料列，由後續 values 或 select 提供內容
    user_id, -- 續接資料庫欄位、條件或回傳內容：user_id,
    gym_role -- 續接資料庫欄位、條件或回傳內容：gym_role
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  values ( -- 續接資料庫欄位、條件或回傳內容：values (
    current_user_id, -- 續接資料庫欄位、條件或回傳內容：current_user_id,
    normalized_role -- 續接資料庫欄位、條件或回傳內容：normalized_role
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  on conflict (user_id) -- 指定唯一鍵衝突時更新或略過，避免重複紀錄
    where checked_out_at is null -- 限制資料或判斷條件：where checked_out_at is null
  do nothing -- 續接資料庫欄位、條件或回傳內容：do nothing
  returning * into result; -- 續接資料庫欄位、條件或回傳內容：returning * into result;

  if result.id is null then -- 判斷 if result.id is null then，決定是否允許本次操作
    select * -- 查詢欄位或運算結果，供權限判斷與資料回傳
    into result -- 續接資料庫欄位、條件或回傳內容：into result
    from public.attendance_sessions -- 指定查詢來源或關聯資料表
    where user_id = current_user_id -- 限制資料或判斷條件：where user_id = current_user_id
      and checked_out_at is null -- 限制資料或判斷條件：and checked_out_at is null
    limit 1; -- 續接資料庫欄位、條件或回傳內容：limit 1;
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return result; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界


-- Prevent clients from bypassing the on-site proof through the old RPC.
revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.gym_check_in(text) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_in(text)
from public, anon, authenticated; -- 指定查詢來源或關聯資料表

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.presence_token_status(text) -- 續接資料庫欄位、條件或回傳內容：on function public.presence_token_status(text)
from public; -- 指定查詢來源或關聯資料表

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.gym_check_in_with_presence(text, text) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_in_with_presence(text, text)
from public; -- 指定查詢來源或關聯資料表

grant execute -- 授予明確列出的角色指定操作權限
on function public.presence_token_status(text) -- 續接資料庫欄位、條件或回傳內容：on function public.presence_token_status(text)
to anon, authenticated; -- 續接資料庫欄位、條件或回傳內容：to anon, authenticated;

grant execute -- 授予明確列出的角色指定操作權限
on function public.gym_check_in_with_presence(text, text) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_in_with_presence(text, text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
