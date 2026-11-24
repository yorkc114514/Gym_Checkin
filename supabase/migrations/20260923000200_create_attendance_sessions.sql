create table public.attendance_sessions ( -- 建立或定義 public.attendance_sessions，供簽到網站共用流程使用
  id uuid primary key default gen_random_uuid(), -- 定義 id 欄位的 uuid 型別與有效範圍或預設值

  user_id uuid not null -- 定義 user_id 欄位的 uuid 型別與有效範圍或預設值
    references public.profiles(id) on delete restrict, -- 續接資料庫欄位、條件或回傳內容：references public.profiles(id) on delete restrict,

  gym_role text not null default 'member' -- 定義 gym_role 欄位的 text 型別與有效範圍或預設值
    check (gym_role in ('primary', 'member')), -- 定義資料一致性約束，在資料庫層拒絕非法值

  checked_in_at timestamptz not null default now(), -- 定義 checked_in_at 欄位的 timestamptz 型別與有效範圍或預設值
  checked_out_at timestamptz, -- 定義 checked_out_at 欄位的 timestamptz 型別與有效範圍或預設值

  checked_out_by uuid -- 定義 checked_out_by 欄位的 uuid 型別與有效範圍或預設值
    references public.profiles(id) on delete restrict, -- 續接資料庫欄位、條件或回傳內容：references public.profiles(id) on delete restrict,

  checkout_method text -- 定義 checkout_method 欄位的 text 型別與有效範圍或預設值
    check (checkout_method in ('self', 'assisted')), -- 定義資料一致性約束，在資料庫層拒絕非法值

  transferred_to uuid -- 定義 transferred_to 欄位的 uuid 型別與有效範圍或預設值
    references public.profiles(id) on delete restrict, -- 續接資料庫欄位、條件或回傳內容：references public.profiles(id) on delete restrict,

  trash_checked boolean, -- 定義 trash_checked 欄位的 boolean 型別與有效範圍或預設值
  ac_lights_checked boolean, -- 定義 ac_lights_checked 欄位的 boolean 型別與有效範圍或預設值
  dehumidifier_checked boolean, -- 定義 dehumidifier_checked 欄位的 boolean 型別與有效範圍或預設值

  note text -- 定義 note 欄位的 text 型別與有效範圍或預設值
    check (note is null or char_length(note) <= 500), -- 定義資料一致性約束，在資料庫層拒絕非法值

  created_at timestamptz not null default now(), -- 定義 created_at 欄位的 timestamptz 型別與有效範圍或預設值

  constraint attendance_valid_time -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      checked_out_at is null -- 續接資料庫欄位、條件或回傳內容：checked_out_at is null
      or checked_out_at >= checked_in_at -- 限制資料或判斷條件：or checked_out_at >= checked_in_at
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_valid_checkout_state -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        checked_out_at is null -- 續接資料庫欄位、條件或回傳內容：checked_out_at is null
        and checked_out_by is null -- 限制資料或判斷條件：and checked_out_by is null
        and checkout_method is null -- 限制資料或判斷條件：and checkout_method is null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
      or -- 限制資料或判斷條件：or
      ( -- 結束目前欄位、條件、函式參數或 SQL 敘述
        checked_out_at is not null -- 續接資料庫欄位、條件或回傳內容：checked_out_at is not null
        and checked_out_by is not null -- 限制資料或判斷條件：and checked_out_by is not null
        and checkout_method is not null -- 限制資料或判斷條件：and checkout_method is not null
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_valid_checkout_actor -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      checkout_method is null -- 續接資料庫欄位、條件或回傳內容：checkout_method is null
      or ( -- 限制資料或判斷條件：or (
        checkout_method = 'self' -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'self'
        and checked_out_by = user_id -- 限制資料或判斷條件：and checked_out_by = user_id
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
      or ( -- 限制資料或判斷條件：or (
        checkout_method = 'assisted' -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'assisted'
        and checked_out_by <> user_id -- 限制資料或判斷條件：and checked_out_by <> user_id
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_primary_not_assisted -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      not ( -- 續接資料庫欄位、條件或回傳內容：not (
        gym_role = 'primary' -- 續接資料庫欄位、條件或回傳內容：gym_role = 'primary'
        and checkout_method = 'assisted' -- 限制資料或判斷條件：and checkout_method = 'assisted'
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_transfer_primary_only -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      transferred_to is null -- 續接資料庫欄位、條件或回傳內容：transferred_to is null
      or gym_role = 'primary' -- 限制資料或判斷條件：or gym_role = 'primary'
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_transfer_other_user -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      transferred_to is null -- 續接資料庫欄位、條件或回傳內容：transferred_to is null
      or transferred_to <> user_id -- 限制資料或判斷條件：or transferred_to <> user_id
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_transfer_requires_checkout -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      transferred_to is null -- 續接資料庫欄位、條件或回傳內容：transferred_to is null
      or checked_out_at is not null -- 限制資料或判斷條件：or checked_out_at is not null
    ), -- 結束目前欄位、條件、函式參數或 SQL 敘述

  constraint attendance_primary_checkout_checks -- 定義資料一致性約束，在資料庫層拒絕非法值
    check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
      checked_out_at is null -- 續接資料庫欄位、條件或回傳內容：checked_out_at is null
      or gym_role = 'member' -- 限制資料或判斷條件：or gym_role = 'member'
      or transferred_to is not null -- 限制資料或判斷條件：or transferred_to is not null
      or ( -- 限制資料或判斷條件：or (
        coalesce(trash_checked, false) -- 續接資料庫欄位、條件或回傳內容：coalesce(trash_checked, false)
        and coalesce(ac_lights_checked, false) -- 限制資料或判斷條件：and coalesce(ac_lights_checked, false)
        and coalesce(dehumidifier_checked, false) -- 限制資料或判斷條件：and coalesce(dehumidifier_checked, false)
      ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
    ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
); -- 結束目前欄位、條件、函式參數或 SQL 敘述

comment on table public.attendance_sessions is -- 為資料表或欄位保存用途說明
  'Gym check-in and check-out sessions'; -- 續接資料庫欄位、條件或回傳內容：'Gym check-in and check-out sessions';

create unique index attendance_one_open_session_per_user -- 續接資料庫欄位、條件或回傳內容：create unique index attendance_one_open_session_per_user
on public.attendance_sessions (user_id) -- 續接資料庫欄位、條件或回傳內容：on public.attendance_sessions (user_id)
where checked_out_at is null; -- 限制資料或判斷條件：where checked_out_at is null;

create index attendance_open_sessions -- 建立或定義 attendance_open_sessions，供簽到網站共用流程使用
on public.attendance_sessions (checked_in_at) -- 續接資料庫欄位、條件或回傳內容：on public.attendance_sessions (checked_in_at)
where checked_out_at is null; -- 限制資料或判斷條件：where checked_out_at is null;

create index attendance_user_history -- 建立或定義 attendance_user_history，供簽到網站共用流程使用
on public.attendance_sessions (user_id, checked_in_at desc); -- 續接資料庫欄位、條件或回傳內容：on public.attendance_sessions (user_id, checked_in_at desc);

alter table public.attendance_sessions enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on table public.attendance_sessions -- 續接資料庫欄位、條件或回傳內容：on table public.attendance_sessions
from anon, authenticated; -- 指定查詢來源或關聯資料表

grant select -- 授予明確列出的角色指定操作權限
on table public.attendance_sessions -- 續接資料庫欄位、條件或回傳內容：on table public.attendance_sessions
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;

create policy "Authenticated users can read attendance" -- 建立或定義 "Authenticated，供簽到網站共用流程使用
on public.attendance_sessions -- 續接資料庫欄位、條件或回傳內容：on public.attendance_sessions
for select -- 續接資料庫欄位、條件或回傳內容：for select
to authenticated -- 續接資料庫欄位、條件或回傳內容：to authenticated
using (true); -- 續接資料庫欄位、條件或回傳內容：using (true);
