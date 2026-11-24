-- Initial profiles migration
create table public.profiles ( -- 建立或定義 public.profiles，供簽到網站共用流程使用
  id uuid primary key references auth.users(id) on delete cascade, -- 以外鍵對應 Supabase Auth 使用者，帳號刪除時依設定處理關聯
  display_name text not null -- 定義 顯示名稱 欄位的 text 型別與有效範圍或預設值
    check (char_length(display_name) between 1 and 80), -- 定義資料一致性約束，在資料庫層拒絕非法值
  avatar_url text, -- 定義 avatar_url 欄位的 text 型別與有效範圍或預設值
  status text not null default 'active' -- 定義 status 欄位的 text 型別與有效範圍或預設值
    check (status in ('active', 'inactive')), -- 定義資料一致性約束，在資料庫層拒絕非法值
  app_role text not null default 'member' -- 定義 app_role 欄位的 text 型別與有效範圍或預設值
    check (app_role in ('member', 'admin')), -- 定義資料一致性約束，在資料庫層拒絕非法值
  created_at timestamptz not null default now(), -- 定義 created_at 欄位的 timestamptz 型別與有效範圍或預設值
  updated_at timestamptz not null default now() -- 定義 updated_at 欄位的 timestamptz 型別與有效範圍或預設值
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

comment on table public.profiles is -- 為資料表或欄位保存用途說明
  'Application profiles linked one-to-one with Supabase Auth users'; -- 續接資料庫欄位、條件或回傳內容：'Application profiles linked one-to-one with Supabase Auth users';

alter table public.profiles enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制

revoke all on table public.profiles from anon, authenticated; -- 撤銷指定角色的操作權限，避免繞過應用流程
grant usage on schema public to authenticated; -- 授予明確列出的角色指定操作權限
grant select on table public.profiles to authenticated; -- 授予明確列出的角色指定操作權限

create policy "Authenticated users can read active profiles" -- 建立或定義 "Authenticated，供簽到網站共用流程使用
on public.profiles -- 續接資料庫欄位、條件或回傳內容：on public.profiles
for select -- 續接資料庫欄位、條件或回傳內容：for select
to authenticated -- 續接資料庫欄位、條件或回傳內容：to authenticated
using ( -- 續接資料庫欄位、條件或回傳內容：using (
  status = 'active' -- 續接資料庫欄位、條件或回傳內容：status = 'active'
  or id = (select auth.uid()) -- 限制資料或判斷條件：or id = (select auth.uid())
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

create or replace function public.set_profile_updated_at() -- 建立或定義 public.set_profile_updated_at，供簽到網站共用流程使用
returns trigger -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  new.updated_at = now(); -- 續接資料庫欄位、條件或回傳內容：new.updated_at = now();
  return new; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

revoke all on function public.set_profile_updated_at() from public; -- 撤銷指定角色的操作權限，避免繞過應用流程

create trigger profiles_set_updated_at -- 建立或定義 profiles_set_updated_at，供簽到網站共用流程使用
before update on public.profiles -- 續接資料庫欄位、條件或回傳內容：before update on public.profiles
for each row -- 續接資料庫欄位、條件或回傳內容：for each row
execute function public.set_profile_updated_at(); -- 續接資料庫欄位、條件或回傳內容：execute function public.set_profile_updated_at();

create or replace function public.handle_new_auth_user() -- 建立或定義 public.handle_new_auth_user，供簽到網站共用流程使用
returns trigger -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  inferred_name text; -- 定義 inferred_name 欄位的 text 型別與有效範圍或預設值
  inferred_avatar text; -- 定義 inferred_avatar 欄位的 text 型別與有效範圍或預設值
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  inferred_name := left( -- 續接資料庫欄位、條件或回傳內容：inferred_name := left(
    coalesce( -- 續接資料庫欄位、條件或回傳內容：coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      '未命名使用者' -- 續接資料庫欄位、條件或回傳內容：'未命名使用者'
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述
    80 -- 續接資料庫欄位、條件或回傳內容：80
  ); -- 結束目前欄位、條件、函式參數或 SQL 敘述

  inferred_avatar := coalesce( -- 續接資料庫欄位、條件或回傳內容：inferred_avatar := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''), -- 續接資料庫欄位、條件或回傳內容：nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', '') -- 續接資料庫欄位、條件或回傳內容：nullif(new.raw_user_meta_data ->> 'picture', '')
  ); -- 結束目前欄位、條件、函式參數或 SQL 敘述

  insert into public.profiles ( -- 新增資料列，由後續 values 或 select 提供內容
    id, -- 續接資料庫欄位、條件或回傳內容：id,
    display_name, -- 續接資料庫欄位、條件或回傳內容：display_name,
    avatar_url -- 續接資料庫欄位、條件或回傳內容：avatar_url
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  values ( -- 續接資料庫欄位、條件或回傳內容：values (
    new.id, -- 續接資料庫欄位、條件或回傳內容：new.id,
    inferred_name, -- 續接資料庫欄位、條件或回傳內容：inferred_name,
    inferred_avatar -- 續接資料庫欄位、條件或回傳內容：inferred_avatar
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  on conflict (id) do nothing; -- 指定唯一鍵衝突時更新或略過，避免重複紀錄

  return new; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

revoke all on function public.handle_new_auth_user() from public; -- 撤銷指定角色的操作權限，避免繞過應用流程

create trigger create_profile_after_auth_signup -- 建立或定義 create_profile_after_auth_signup，供簽到網站共用流程使用
after insert on auth.users -- 續接資料庫欄位、條件或回傳內容：after insert on auth.users
for each row -- 續接資料庫欄位、條件或回傳內容：for each row
execute function public.handle_new_auth_user(); -- 續接資料庫欄位、條件或回傳內容：execute function public.handle_new_auth_user();

insert into public.profiles ( -- 新增資料列，由後續 values 或 select 提供內容
  id, -- 續接資料庫欄位、條件或回傳內容：id,
  display_name, -- 續接資料庫欄位、條件或回傳內容：display_name,
  avatar_url -- 續接資料庫欄位、條件或回傳內容：avatar_url
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
select -- 查詢欄位或運算結果，供權限判斷與資料回傳
  auth_user.id, -- 續接資料庫欄位、條件或回傳內容：auth_user.id,
  left( -- 續接資料庫欄位、條件或回傳內容：left(
    coalesce( -- 續接資料庫欄位、條件或回傳內容：coalesce(
      nullif(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(auth_user.raw_user_meta_data ->> 'name'), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(btrim(auth_user.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''), -- 續接資料庫欄位、條件或回傳內容：nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
      '未命名使用者' -- 續接資料庫欄位、條件或回傳內容：'未命名使用者'
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述
    80 -- 續接資料庫欄位、條件或回傳內容：80
  ), -- 結束目前欄位、條件、函式參數或 SQL 敘述
  coalesce( -- 續接資料庫欄位、條件或回傳內容：coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'avatar_url', ''), -- 續接資料庫欄位、條件或回傳內容：nullif(auth_user.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(auth_user.raw_user_meta_data ->> 'picture', '') -- 續接資料庫欄位、條件或回傳內容：nullif(auth_user.raw_user_meta_data ->> 'picture', '')
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
from auth.users as auth_user -- 指定查詢來源或關聯資料表
on conflict (id) do nothing; -- 指定唯一鍵衝突時更新或略過，避免重複紀錄

create or replace function public.update_my_display_name( -- 建立或定義 public.update_my_display_name，供簽到網站共用流程使用
  new_display_name text -- 定義 new_display_name 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.profiles -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  cleaned_name text; -- 定義 cleaned_name 欄位的 text 型別與有效範圍或預設值
  updated_profile public.profiles; -- 續接資料庫欄位、條件或回傳內容：updated_profile public.profiles;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  cleaned_name := regexp_replace( -- 續接資料庫欄位、條件或回傳內容：cleaned_name := regexp_replace(
    btrim(coalesce(new_display_name, '')), -- 續接資料庫欄位、條件或回傳內容：btrim(coalesce(new_display_name, '')),
    '\s+', -- 續接資料庫欄位、條件或回傳內容：'\s+',
    ' ', -- 續接資料庫欄位、條件或回傳內容：' ',
    'g' -- 續接資料庫欄位、條件或回傳內容：'g'
  ); -- 結束目前欄位、條件、函式參數或 SQL 敘述

  if char_length(cleaned_name) < 2 -- 判斷 if char_length(cleaned_name) < 2，決定是否允許本次操作
     or char_length(cleaned_name) > 80 then -- 限制資料或判斷條件：or char_length(cleaned_name) > 80 then
    raise exception '姓名必須為 2 至 80 個字元'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  update public.profiles -- 更新指定資料表，配合 where 限制範圍
  set display_name = cleaned_name -- 續接資料庫欄位、條件或回傳內容：set display_name = cleaned_name
  where id = (select auth.uid()) -- 限制資料或判斷條件：where id = (select auth.uid())
  returning * into updated_profile; -- 續接資料庫欄位、條件或回傳內容：returning * into updated_profile;

  if updated_profile.id is null then -- 判斷 if updated_profile.id is null then，決定是否允許本次操作
    raise exception '找不到目前登入者的個人資料'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return updated_profile; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

revoke all on function public.update_my_display_name(text) from public; -- 撤銷指定角色的操作權限，避免繞過應用流程
grant execute -- 授予明確列出的角色指定操作權限
on function public.update_my_display_name(text) -- 續接資料庫欄位、條件或回傳內容：on function public.update_my_display_name(text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
