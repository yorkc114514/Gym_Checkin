-- Require each Google-authenticated account to confirm a recognizable name
-- once. Existing profiles intentionally start as unconfirmed and will be
-- prompted on their next visit.

alter table public.profiles -- 續接資料庫欄位、條件或回傳內容：alter table public.profiles
add column if not exists name_confirmed boolean not null default false; -- 續接資料庫欄位、條件或回傳內容：add column if not exists name_confirmed boolean not null default false;

comment on column public.profiles.name_confirmed is -- 為資料表或欄位保存用途說明
  'True after the account owner confirms a display name in the app'; -- 續接資料庫欄位、條件或回傳內容：'True after the account owner confirms a display name in the app';

create or replace function public.update_my_display_name( -- 建立或定義 public.update_my_display_name，供簽到網站共用流程使用
  new_display_name text -- 定義 new_display_name 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.profiles -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  current_user_id uuid := (select auth.uid()); -- 定義 current_user_id 欄位的 uuid 型別與有效範圍或預設值
  cleaned_name text; -- 定義 cleaned_name 欄位的 text 型別與有效範圍或預設值
  updated_profile public.profiles; -- 續接資料庫欄位、條件或回傳內容：updated_profile public.profiles;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if current_user_id is null then -- 判斷 if current_user_id is null then，決定是否允許本次操作
    raise exception '請先登入 Google 帳號'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

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
  set -- 續接資料庫欄位、條件或回傳內容：set
    display_name = cleaned_name, -- 續接資料庫欄位、條件或回傳內容：display_name = cleaned_name,
    name_confirmed = true -- 續接資料庫欄位、條件或回傳內容：name_confirmed = true
  where id = current_user_id -- 限制資料或判斷條件：where id = current_user_id
    and name_confirmed = false -- 限制資料或判斷條件：and name_confirmed = false
  returning * into updated_profile; -- 續接資料庫欄位、條件或回傳內容：returning * into updated_profile;

  if updated_profile.id is null then -- 判斷 if updated_profile.id is null then，決定是否允許本次操作
    if exists ( -- 判斷 if exists (，決定是否允許本次操作
      select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
      from public.profiles -- 指定查詢來源或關聯資料表
      where id = current_user_id -- 限制資料或判斷條件：where id = current_user_id
        and name_confirmed = true -- 限制資料或判斷條件：and name_confirmed = true
    ) then -- 續接資料庫欄位、條件或回傳內容：) then
      raise exception '姓名已完成綁定，如需更正請聯絡管理員'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
    end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

    raise exception '找不到目前登入者的個人資料'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return updated_profile; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.update_my_display_name(text) -- 續接資料庫欄位、條件或回傳內容：on function public.update_my_display_name(text)
from public; -- 指定查詢來源或關聯資料表

grant execute -- 授予明確列出的角色指定操作權限
on function public.update_my_display_name(text) -- 續接資料庫欄位、條件或回傳內容：on function public.update_my_display_name(text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
