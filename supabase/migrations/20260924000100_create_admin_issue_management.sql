create or replace function public.admin_set_issue_status( -- 建立或定義 public.admin_set_issue_status，供簽到網站共用流程使用
  target_report_id uuid, -- 定義 target_report_id 欄位的 uuid 型別與有效範圍或預設值
  target_status text -- 定義 target_status 欄位的 text 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.issue_reports -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  current_user_id uuid := (select auth.uid()); -- 定義 current_user_id 欄位的 uuid 型別與有效範圍或預設值
  cleaned_status text := lower(btrim(coalesce(target_status, ''))); -- 定義 cleaned_status 欄位的 text 型別與有效範圍或預設值
  updated_report public.issue_reports; -- 續接資料庫欄位、條件或回傳內容：updated_report public.issue_reports;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if current_user_id is null then -- 判斷 if current_user_id is null then，決定是否允許本次操作
    raise exception '請先登入 Google 帳號'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if not exists ( -- 判斷 if not exists (，決定是否允許本次操作
    select 1 -- 查詢欄位或運算結果，供權限判斷與資料回傳
    from public.profiles -- 指定查詢來源或關聯資料表
    where id = current_user_id -- 限制資料或判斷條件：where id = current_user_id
      and app_role = 'admin' -- 限制資料或判斷條件：and app_role = 'admin'
      and status = 'active' -- 限制資料或判斷條件：and status = 'active'
  ) then -- 續接資料庫欄位、條件或回傳內容：) then
    raise exception '僅限管理員更新問題狀態'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if cleaned_status not in ('open', 'resolved') then -- 判斷 if cleaned_status not in ('open', 'resolved') then，決定是否允許本次操作
    raise exception '不支援的問題狀態'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  update public.issue_reports -- 更新指定資料表，配合 where 限制範圍
  set -- 續接資料庫欄位、條件或回傳內容：set
    status = cleaned_status, -- 續接資料庫欄位、條件或回傳內容：status = cleaned_status,
    resolved_at = case -- 續接資料庫欄位、條件或回傳內容：resolved_at = case
      when cleaned_status = 'resolved' then now() -- 續接資料庫欄位、條件或回傳內容：when cleaned_status = 'resolved' then now()
      else null -- 續接資料庫欄位、條件或回傳內容：else null
    end, -- 開始或結束 PL/pgSQL 變數與控制區塊
    resolved_by = case -- 續接資料庫欄位、條件或回傳內容：resolved_by = case
      when cleaned_status = 'resolved' then current_user_id -- 續接資料庫欄位、條件或回傳內容：when cleaned_status = 'resolved' then current_user_id
      else null -- 續接資料庫欄位、條件或回傳內容：else null
    end -- 開始或結束 PL/pgSQL 變數與控制區塊
  where id = target_report_id -- 限制資料或判斷條件：where id = target_report_id
  returning * into updated_report; -- 續接資料庫欄位、條件或回傳內容：returning * into updated_report;

  if updated_report.id is null then -- 判斷 if updated_report.id is null then，決定是否允許本次操作
    raise exception '找不到指定的問題回報'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return updated_report; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界

comment on function public.admin_set_issue_status(uuid, text) is -- 為資料表或欄位保存用途說明
  'Allows active administrators to resolve or reopen an issue report'; -- 續接資料庫欄位、條件或回傳內容：'Allows active administrators to resolve or reopen an issue report';

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.admin_set_issue_status(uuid, text) -- 續接資料庫欄位、條件或回傳內容：on function public.admin_set_issue_status(uuid, text)
from public; -- 指定查詢來源或關聯資料表

grant execute -- 授予明確列出的角色指定操作權限
on function public.admin_set_issue_status(uuid, text) -- 續接資料庫欄位、條件或回傳內容：on function public.admin_set_issue_status(uuid, text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
