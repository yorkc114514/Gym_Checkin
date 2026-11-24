create table public.issue_reports ( -- 建立或定義 public.issue_reports，供簽到網站共用流程使用
  id uuid primary key default gen_random_uuid(), -- 定義 id 欄位的 uuid 型別與有效範圍或預設值

  reporter_id uuid not null -- 定義 reporter_id 欄位的 uuid 型別與有效範圍或預設值
    references public.profiles(id) on delete restrict, -- 續接資料庫欄位、條件或回傳內容：references public.profiles(id) on delete restrict,

  description text not null -- 定義 description 欄位的 text 型別與有效範圍或預設值
    check (char_length(description) between 5 and 1000), -- 定義資料一致性約束，在資料庫層拒絕非法值

  status text not null default 'open' -- 定義 status 欄位的 text 型別與有效範圍或預設值
    check (status in ('open', 'resolved')), -- 定義資料一致性約束，在資料庫層拒絕非法值

  notification_status text not null default 'pending' -- 定義 notification_status 欄位的 text 型別與有效範圍或預設值
    check (notification_status in ('pending', 'sent', 'failed')), -- 定義資料一致性約束，在資料庫層拒絕非法值

  notified_at timestamptz, -- 定義 notified_at 欄位的 timestamptz 型別與有效範圍或預設值
  notification_error text -- 定義 notification_error 欄位的 text 型別與有效範圍或預設值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      notification_error is null -- 續接資料庫欄位、條件或回傳內容：notification_error is null
      or char_length(notification_error) <= 500 -- 限制資料或判斷條件：or char_length(notification_error) <= 500
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  created_at timestamptz not null default now(), -- 定義 created_at 欄位的 timestamptz 型別與有效範圍或預設值
  resolved_at timestamptz, -- 定義 resolved_at 欄位的 timestamptz 型別與有效範圍或預設值
  resolved_by uuid -- 定義 resolved_by 欄位的 uuid 型別與有效範圍或預設值
    references public.profiles(id) on delete restrict, -- 續接資料庫欄位、條件或回傳內容：references public.profiles(id) on delete restrict,

  constraint issue_resolution_state_is_consistent -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        status = 'open' -- 續接資料庫欄位、條件或回傳內容：status = 'open'
        and resolved_at is null -- 限制資料或判斷條件：and resolved_at is null
        and resolved_by is null -- 限制資料或判斷條件：and resolved_by is null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
      or -- 限制資料或判斷條件：or
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        status = 'resolved' -- 續接資料庫欄位、條件或回傳內容：status = 'resolved'
        and resolved_at is not null -- 限制資料或判斷條件：and resolved_at is not null
        and resolved_by is not null -- 限制資料或判斷條件：and resolved_by is not null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint issue_notification_state_is_consistent -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        notification_status = 'sent' -- 續接資料庫欄位、條件或回傳內容：notification_status = 'sent'
        and notified_at is not null -- 限制資料或判斷條件：and notified_at is not null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
      or -- 限制資料或判斷條件：or
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        notification_status <> 'sent' -- 續接資料庫欄位、條件或回傳內容：notification_status <> 'sent'
        and notified_at is null -- 限制資料或判斷條件：and notified_at is null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

comment on table public.issue_reports is -- 為資料表或欄位保存用途說明
  'Problems reported by authenticated gym users'; -- 續接資料庫欄位、條件或回傳內容：'Problems reported by authenticated gym users';

create index issue_reports_created_at -- 建立或定義 issue_reports_created_at，供簽到網站共用流程使用
on public.issue_reports (created_at desc); -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports (created_at desc);

create index issue_reports_open -- 建立或定義 issue_reports_open，供簽到網站共用流程使用
on public.issue_reports (created_at desc) -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports (created_at desc)
where status = 'open'; -- 限制資料或判斷條件：where status = 'open';

alter table public.issue_reports enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on table public.issue_reports -- 續接資料庫欄位、條件或回傳內容：on table public.issue_reports
from anon, authenticated; -- 指定查詢來源或關聯資料表

grant select -- 授予明確列出的角色指定操作權限
on table public.issue_reports -- 續接資料庫欄位、條件或回傳內容：on table public.issue_reports
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;

grant select, update -- 授予明確列出的角色指定操作權限
on table public.issue_reports -- 續接資料庫欄位、條件或回傳內容：on table public.issue_reports
to service_role; -- 續接資料庫欄位、條件或回傳內容：to service_role;

create policy "Users can read their own reports and admins can read all" -- 建立或定義 "Users，供簽到網站共用流程使用
on public.issue_reports -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports
for select -- 續接資料庫欄位、條件或回傳內容：for select
to authenticated -- 續接資料庫欄位、條件或回傳內容：to authenticated
using ( -- 續接資料庫欄位、條件或回傳內容：using (
  reporter_id = (select auth.uid()) -- 續接資料庫欄位、條件或回傳內容：reporter_id = (select auth.uid())
  or exists ( -- 限制資料或判斷條件：or exists (
    select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
    from public.profiles -- 指定查詢來源或關聯資料表
    where id = (select auth.uid()) -- 限制資料或判斷條件：where id = (select auth.uid())
      and app_role = 'admin' -- 限制資料或判斷條件：and app_role = 'admin'
      and status = 'active' -- 限制資料或判斷條件：and status = 'active'
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

create or replace function public.report_issue( -- 建立或定義 public.report_issue，供簽到網站共用流程使用
  issue_text text -- 定義 issue_text 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.issue_reports -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  current_user_id uuid := (select auth.uid()); -- 定義 current_user_id 欄位的 uuid 型別與有效範圍或預設值
  cleaned_issue text; -- 定義 cleaned_issue 欄位的 text 型別與有效範圍或預設值
  created_report public.issue_reports; -- 續接資料庫欄位、條件或回傳內容：created_report public.issue_reports;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if current_user_id is null then -- 判斷 if current_user_id is null then，決定是否允許本次操作
    raise exception '請先登入 Google 帳號'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if not exists ( -- 判斷 if not exists (，決定是否允許本次操作
    select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
    from public.profiles -- 指定查詢來源或關聯資料表
    where id = current_user_id -- 限制資料或判斷條件：where id = current_user_id
      and status = 'active' -- 限制資料或判斷條件：and status = 'active'
  ) then -- 續接資料庫欄位、條件或回傳內容：) then
    raise exception '使用者不存在或已停用'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  cleaned_issue := regexp_replace( -- 續接資料庫欄位、條件或回傳內容：cleaned_issue := regexp_replace(
    btrim(coalesce(issue_text, '')), -- 續接資料庫欄位、條件或回傳內容：btrim(coalesce(issue_text, '')),
    '\s+', -- 續接資料庫欄位、條件或回傳內容：'\s+',
    ' ', -- 續接資料庫欄位、條件或回傳內容：' ',
    'g' -- 續接資料庫欄位、條件或回傳內容：'g'
  ); -- 結束目前欄位、條件、函式參數或 SQL 敘述

  if char_length(cleaned_issue) < 5 then -- 判斷 if char_length(cleaned_issue) < 5 then，決定是否允許本次操作
    raise exception '問題描述至少需要 5 個字元'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if char_length(cleaned_issue) > 1000 then -- 判斷 if char_length(cleaned_issue) > 1000 then，決定是否允許本次操作
    raise exception '問題描述不可超過 1000 個字元'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  insert into public.issue_reports ( -- 新增資料列，由後續 values 或 select 提供內容
    reporter_id, -- 續接資料庫欄位、條件或回傳內容：reporter_id,
    description -- 續接資料庫欄位、條件或回傳內容：description
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  values ( -- 續接資料庫欄位、條件或回傳內容：values (
    current_user_id, -- 續接資料庫欄位、條件或回傳內容：current_user_id,
    cleaned_issue -- 續接資料庫欄位、條件或回傳內容：cleaned_issue
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
  returning * into created_report; -- 續接資料庫欄位、條件或回傳內容：returning * into created_report;

  return created_report; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.report_issue(text) -- 續接資料庫欄位、條件或回傳內容：on function public.report_issue(text)
from public; -- 指定查詢來源或關聯資料表

grant execute -- 授予明確列出的角色指定操作權限
on function public.report_issue(text) -- 續接資料庫欄位、條件或回傳內容：on function public.report_issue(text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
