-- All signed-in users may view issue reports.
-- Status changes remain protected by admin_set_issue_status(), which performs
-- its own active-admin check before updating any row.

drop policy if exists -- 若同名 RLS 政策存在就先移除，便於重新套用政策
  "Users can read their own reports and admins can read all" -- 續接資料庫欄位、條件或回傳內容："Users can read their own reports and admins can read all"
on public.issue_reports; -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports;

drop policy if exists -- 若同名 RLS 政策存在就先移除，便於重新套用政策
  "Authenticated users can read all issue reports" -- 續接資料庫欄位、條件或回傳內容："Authenticated users can read all issue reports"
on public.issue_reports; -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports;

create policy "Authenticated users can read all issue reports" -- 建立或定義 "Authenticated，供簽到網站共用流程使用
on public.issue_reports -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports
for select -- 續接資料庫欄位、條件或回傳內容：for select
to authenticated -- 續接資料庫欄位、條件或回傳內容：to authenticated
using (true); -- 續接資料庫欄位、條件或回傳內容：using (true);

comment on policy "Authenticated users can read all issue reports" -- 為資料表或欄位保存用途說明
on public.issue_reports is -- 續接資料庫欄位、條件或回傳內容：on public.issue_reports is
  'Allows every Google-authenticated app user to view the shared issue list'; -- 續接資料庫欄位、條件或回傳內容：'Allows every Google-authenticated app user to view the shared issue list';
