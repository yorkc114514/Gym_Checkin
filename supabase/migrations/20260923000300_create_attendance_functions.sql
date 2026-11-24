create or replace function public.gym_check_in( -- 建立或定義 public.gym_check_in，供簽到網站共用流程使用
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


create or replace function public.gym_check_out( -- 建立或定義 public.gym_check_out，供簽到網站共用流程使用
  transfer_to_user_id uuid default null, -- 定義 transfer_to_user_id 欄位的 uuid 型別與有效範圍或預設值
  trash_is_checked boolean default false, -- 定義 trash_is_checked 欄位的 boolean 型別與有效範圍或預設值
  ac_lights_are_checked boolean default false, -- 定義 ac_lights_are_checked 欄位的 boolean 型別與有效範圍或預設值
  dehumidifier_is_checked boolean default false -- 定義 dehumidifier_is_checked 欄位的 boolean 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.attendance_sessions -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  current_user_id uuid := (select auth.uid()); -- 定義 current_user_id 欄位的 uuid 型別與有效範圍或預設值
  current_session public.attendance_sessions; -- 續接資料庫欄位、條件或回傳內容：current_session public.attendance_sessions;
  transfer_session public.attendance_sessions; -- 續接資料庫欄位、條件或回傳內容：transfer_session public.attendance_sessions;
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

  select * -- 查詢欄位或運算結果，供權限判斷與資料回傳
  into current_session -- 續接資料庫欄位、條件或回傳內容：into current_session
  from public.attendance_sessions -- 指定查詢來源或關聯資料表
  where user_id = current_user_id -- 限制資料或判斷條件：where user_id = current_user_id
    and checked_out_at is null -- 限制資料或判斷條件：and checked_out_at is null
  limit 1 -- 續接資料庫欄位、條件或回傳內容：limit 1
  for update; -- 續接資料庫欄位、條件或回傳內容：for update;

  if current_session.id is null then -- 判斷 if current_session.id is null then，決定是否允許本次操作
    select * -- 查詢欄位或運算結果，供權限判斷與資料回傳
    into current_session -- 續接資料庫欄位、條件或回傳內容：into current_session
    from public.attendance_sessions -- 指定查詢來源或關聯資料表
    where user_id = current_user_id -- 限制資料或判斷條件：where user_id = current_user_id
    order by checked_in_at desc -- 續接資料庫欄位、條件或回傳內容：order by checked_in_at desc
    limit 1; -- 續接資料庫欄位、條件或回傳內容：limit 1;

    if current_session.id is null then -- 判斷 if current_session.id is null then，決定是否允許本次操作
      raise exception '目前沒有簽到紀錄'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
    end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

    return current_session; -- 回傳結果或結束目前資料庫函式
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if current_session.gym_role = 'primary' then -- 判斷 if current_session.gym_role = 'primary' then，決定是否允許本次操作
    if transfer_to_user_id is not null then -- 判斷 if transfer_to_user_id is not null then，決定是否允許本次操作
      if transfer_to_user_id = current_user_id then -- 判斷 if transfer_to_user_id = current_user_id then，決定是否允許本次操作
        raise exception '不能將責任交接給自己'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
      end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

      select attendance.* -- 查詢欄位或運算結果，供權限判斷與資料回傳
      into transfer_session -- 續接資料庫欄位、條件或回傳內容：into transfer_session
      from public.attendance_sessions as attendance -- 指定查詢來源或關聯資料表
      join public.profiles as profile -- 指定查詢來源或關聯資料表
        on profile.id = attendance.user_id -- 續接資料庫欄位、條件或回傳內容：on profile.id = attendance.user_id
      where attendance.user_id = transfer_to_user_id -- 限制資料或判斷條件：where attendance.user_id = transfer_to_user_id
        and attendance.checked_out_at is null -- 限制資料或判斷條件：and attendance.checked_out_at is null
        and profile.status = 'active' -- 限制資料或判斷條件：and profile.status = 'active'
      limit 1 -- 續接資料庫欄位、條件或回傳內容：limit 1
      for update of attendance; -- 續接資料庫欄位、條件或回傳內容：for update of attendance;

      if transfer_session.id is null then -- 判斷 if transfer_session.id is null then，決定是否允許本次操作
        raise exception '接替人員目前不在簽到狀態'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
      end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

      update public.attendance_sessions -- 更新指定資料表，配合 where 限制範圍
      set gym_role = 'primary' -- 續接資料庫欄位、條件或回傳內容：set gym_role = 'primary'
      where id = transfer_session.id; -- 限制資料或判斷條件：where id = transfer_session.id;

      update public.attendance_sessions -- 更新指定資料表，配合 where 限制範圍
      set -- 續接資料庫欄位、條件或回傳內容：set
        checked_out_at = now(), -- 續接資料庫欄位、條件或回傳內容：checked_out_at = now(),
        checked_out_by = current_user_id, -- 續接資料庫欄位、條件或回傳內容：checked_out_by = current_user_id,
        checkout_method = 'self', -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'self',
        transferred_to = transfer_to_user_id, -- 續接資料庫欄位、條件或回傳內容：transferred_to = transfer_to_user_id,
        note = '主要借用者責任已交接' -- 續接資料庫欄位、條件或回傳內容：note = '主要借用者責任已交接'
      where id = current_session.id -- 限制資料或判斷條件：where id = current_session.id
      returning * into current_session; -- 續接資料庫欄位、條件或回傳內容：returning * into current_session;

    else -- 續接資料庫欄位、條件或回傳內容：else
      if not ( -- 判斷 if not (，決定是否允許本次操作
        coalesce(trash_is_checked, false) -- 續接資料庫欄位、條件或回傳內容：coalesce(trash_is_checked, false)
        and coalesce(ac_lights_are_checked, false) -- 限制資料或判斷條件：and coalesce(ac_lights_are_checked, false)
        and coalesce(dehumidifier_is_checked, false) -- 限制資料或判斷條件：and coalesce(dehumidifier_is_checked, false)
      ) then -- 續接資料庫欄位、條件或回傳內容：) then
        raise exception '請完成垃圾、冷氣與電燈、除濕機三項檢查'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
      end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

      update public.attendance_sessions -- 更新指定資料表，配合 where 限制範圍
      set -- 續接資料庫欄位、條件或回傳內容：set
        checked_out_at = now(), -- 續接資料庫欄位、條件或回傳內容：checked_out_at = now(),
        checked_out_by = current_user_id, -- 續接資料庫欄位、條件或回傳內容：checked_out_by = current_user_id,
        checkout_method = 'self', -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'self',
        trash_checked = true, -- 續接資料庫欄位、條件或回傳內容：trash_checked = true,
        ac_lights_checked = true, -- 續接資料庫欄位、條件或回傳內容：ac_lights_checked = true,
        dehumidifier_checked = true -- 續接資料庫欄位、條件或回傳內容：dehumidifier_checked = true
      where id = current_session.id -- 限制資料或判斷條件：where id = current_session.id
      returning * into current_session; -- 續接資料庫欄位、條件或回傳內容：returning * into current_session;
    end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  else -- 續接資料庫欄位、條件或回傳內容：else
    if transfer_to_user_id is not null then -- 判斷 if transfer_to_user_id is not null then，決定是否允許本次操作
      raise exception '共同使用者不能進行責任交接'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
    end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

    update public.attendance_sessions -- 更新指定資料表，配合 where 限制範圍
    set -- 續接資料庫欄位、條件或回傳內容：set
      checked_out_at = now(), -- 續接資料庫欄位、條件或回傳內容：checked_out_at = now(),
      checked_out_by = current_user_id, -- 續接資料庫欄位、條件或回傳內容：checked_out_by = current_user_id,
      checkout_method = 'self' -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'self'
    where id = current_session.id -- 限制資料或判斷條件：where id = current_session.id
    returning * into current_session; -- 續接資料庫欄位、條件或回傳內容：returning * into current_session;
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  return current_session; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界


create or replace function public.gym_assist_check_out( -- 建立或定義 public.gym_assist_check_out，供簽到網站共用流程使用
  target_user_id uuid -- 定義 target_user_id 欄位的 uuid 型別與有效範圍或預設值
) -- 結束目前欄位、條件、函式參數或 SQL 敘述
returns public.attendance_sessions -- 宣告資料庫函式回傳的型別或欄位
language plpgsql -- 指定函式使用 SQL 或 PL/pgSQL 語言
security definer -- 以函式擁有者權限執行，因此函式內需自行驗證使用者與輸入
set search_path = '' -- 固定函式搜尋路徑，避免同名物件影響權限敏感操作
as $$ -- 標記資料庫函式本體的 dollar quote 邊界
declare -- 開始或結束 PL/pgSQL 變數與控制區塊
  helper_user_id uuid := (select auth.uid()); -- 定義 helper_user_id 欄位的 uuid 型別與有效範圍或預設值
  helper_name text; -- 定義 helper_name 欄位的 text 型別與有效範圍或預設值
  target_session public.attendance_sessions; -- 續接資料庫欄位、條件或回傳內容：target_session public.attendance_sessions;
begin -- 開始或結束 PL/pgSQL 變數與控制區塊
  if helper_user_id is null then -- 判斷 if helper_user_id is null then，決定是否允許本次操作
    raise exception '請先登入 Google 帳號'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  select display_name -- 查詢欄位或運算結果，供權限判斷與資料回傳
  into helper_name -- 續接資料庫欄位、條件或回傳內容：into helper_name
  from public.profiles -- 指定查詢來源或關聯資料表
  where id = helper_user_id -- 限制資料或判斷條件：where id = helper_user_id
    and status = 'active'; -- 限制資料或判斷條件：and status = 'active';

  if helper_name is null then -- 判斷 if helper_name is null then，決定是否允許本次操作
    raise exception '使用者不存在或已停用'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if target_user_id is null then -- 判斷 if target_user_id is null then，決定是否允許本次操作
    raise exception '請選擇要協助簽退的人員'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if target_user_id = helper_user_id then -- 判斷 if target_user_id = helper_user_id then，決定是否允許本次操作
    raise exception '請使用正常簽退功能替自己簽退'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  select * -- 查詢欄位或運算結果，供權限判斷與資料回傳
  into target_session -- 續接資料庫欄位、條件或回傳內容：into target_session
  from public.attendance_sessions -- 指定查詢來源或關聯資料表
  where user_id = target_user_id -- 限制資料或判斷條件：where user_id = target_user_id
    and checked_out_at is null -- 限制資料或判斷條件：and checked_out_at is null
  limit 1 -- 續接資料庫欄位、條件或回傳內容：limit 1
  for update; -- 續接資料庫欄位、條件或回傳內容：for update;

  if target_session.id is null then -- 判斷 if target_session.id is null then，決定是否允許本次操作
    raise exception '該使用者目前不在簽到狀態'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  if target_session.gym_role = 'primary' then -- 判斷 if target_session.gym_role = 'primary' then，決定是否允許本次操作
    raise exception '主要借用者必須親自完成簽退'; -- 以明確原因拒絕無效操作，讓呼叫端收到錯誤
  end if; -- 開始或結束 PL/pgSQL 變數與控制區塊

  update public.attendance_sessions -- 更新指定資料表，配合 where 限制範圍
  set -- 續接資料庫欄位、條件或回傳內容：set
    checked_out_at = now(), -- 續接資料庫欄位、條件或回傳內容：checked_out_at = now(),
    checked_out_by = helper_user_id, -- 續接資料庫欄位、條件或回傳內容：checked_out_by = helper_user_id,
    checkout_method = 'assisted', -- 續接資料庫欄位、條件或回傳內容：checkout_method = 'assisted',
    note = '由「' || helper_name || '」協助簽退' -- 續接資料庫欄位、條件或回傳內容：note = '由「' || helper_name || '」協助簽退'
  where id = target_session.id -- 限制資料或判斷條件：where id = target_session.id
  returning * into target_session; -- 續接資料庫欄位、條件或回傳內容：returning * into target_session;

  return target_session; -- 回傳結果或結束目前資料庫函式
end; -- 開始或結束 PL/pgSQL 變數與控制區塊
$$; -- 標記資料庫函式本體的 dollar quote 邊界


revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.gym_check_in(text) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_in(text)
from public; -- 指定查詢來源或關聯資料表

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.gym_check_out(uuid, boolean, boolean, boolean) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_out(uuid, boolean, boolean, boolean)
from public; -- 指定查詢來源或關聯資料表

revoke all -- 撤銷指定角色的操作權限，避免繞過應用流程
on function public.gym_assist_check_out(uuid) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_assist_check_out(uuid)
from public; -- 指定查詢來源或關聯資料表

grant execute -- 授予明確列出的角色指定操作權限
on function public.gym_check_in(text) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_in(text)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;

grant execute -- 授予明確列出的角色指定操作權限
on function public.gym_check_out(uuid, boolean, boolean, boolean) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_check_out(uuid, boolean, boolean, boolean)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;

grant execute -- 授予明確列出的角色指定操作權限
on function public.gym_assist_check_out(uuid) -- 續接資料庫欄位、條件或回傳內容：on function public.gym_assist_check_out(uuid)
to authenticated; -- 續接資料庫欄位、條件或回傳內容：to authenticated;
