-- Requires the existing profiles and presence_devices migrations.
-- Retain only the most recent sample for each device.
create table if not exists public.environment_latest ( -- 建立或定義 public.environment_latest，供簽到網站共用流程使用
  device_id uuid primary key references public.presence_devices(id) on delete cascade, -- 定義 裝置資料列識別碼 欄位的 uuid 型別與有效範圍或預設值
  device_code text not null, -- 定義 裝置代碼 欄位的 text 型別與有效範圍或預設值
  display_name text not null, -- 定義 顯示名稱 欄位的 text 型別與有效範圍或預設值
  temperature_c double precision check (temperature_c between -40 and 80), -- 定義 攝氏溫度 欄位的 double precision 型別與有效範圍或預設值
  humidity_pct double precision check (humidity_pct between 0 and 100), -- 定義 相對濕度百分比 欄位的 double precision 型別與有效範圍或預設值
  illuminance_lux double precision check (illuminance_lux between 0 and 200000), -- 定義 照度 lx 欄位的 double precision 型別與有效範圍或預設值
  light_status text not null check (light_status in ('ok','error','saturated')), -- 定義 光感測器狀態 欄位的 text 型別與有效範圍或預設值
  full_spectrum integer check (full_spectrum between 0 and 65535), -- 定義 全頻道原始光值 欄位的 integer 型別與有效範圍或預設值
  infrared integer check (infrared between 0 and 65535), -- 定義 紅外線原始光值 欄位的 integer 型別與有效範圍或預設值
  wifi_rssi integer check (wifi_rssi between -127 and 0), -- 定義 Wi-Fi 訊號強度 欄位的 integer 型別與有效範圍或預設值
  uptime_s bigint not null check (uptime_s between 0 and 4294967295), -- 定義 開機秒數 欄位的 bigint 型別與有效範圍或預設值
  sampled_at timestamptz not null, -- 定義 估算感測時間 欄位的 timestamptz 型別與有效範圍或預設值
  received_at timestamptz not null default now(), -- 定義 伺服器接收時間 欄位的 timestamptz 型別與有效範圍或預設值
  constraint environment_light_consistency check ( -- 定義資料一致性約束，在資料庫層拒絕非法值
    (light_status='ok' and illuminance_lux is not null and full_spectrum is not null and infrared is not null) -- 續接資料庫欄位、條件或回傳內容：(light_status='ok' and illuminance_lux is not null and full_spectrum is not null and infrared is not…
    or (light_status='saturated' and illuminance_lux is null and full_spectrum is not null and infrared is not null) -- 限制資料或判斷條件：or (light_status='saturated' and illuminance_lux is null and full_spectrum is not null and infrared …
    or (light_status='error' and illuminance_lux is null and full_spectrum is null and infrared is null) -- 限制資料或判斷條件：or (light_status='error' and illuminance_lux is null and full_spectrum is null and infrared is null)
  ) -- 結束目前欄位、條件、函式參數或 SQL 敘述
); -- 結束目前欄位、條件、函式參數或 SQL 敘述
comment on table public.environment_latest is 'Latest room environment reading per ESP32. Missing sensors use NULL, not zero.'; -- 為資料表或欄位保存用途說明
alter table public.environment_latest enable row level security; -- 啟用資料列層級權限，讓查詢與寫入受 RLS 政策控制
revoke all on table public.environment_latest from anon, authenticated; -- 撤銷指定角色的操作權限，避免繞過應用流程
grant select on table public.environment_latest to authenticated; -- 授予明確列出的角色指定操作權限
grant select, insert, update on table public.environment_latest to service_role; -- 授予明確列出的角色指定操作權限
drop policy if exists environment_read_active_users -- 若同名 RLS 政策存在就先移除，便於重新套用政策
on public.environment_latest; -- 續接資料庫欄位、條件或回傳內容：on public.environment_latest;
create policy environment_read_active_users on public.environment_latest -- 建立或定義 environment_read_active_users，供簽到網站共用流程使用
for select to authenticated using ( -- 續接資料庫欄位、條件或回傳內容：for select to authenticated using (
  exists (select 1 from public.profiles where id=(select auth.uid()) and status='active') -- 續接資料庫欄位、條件或回傳內容：exists (select 1 from public.profiles where id=(select auth.uid()) and status='active')
); -- 結束目前欄位、條件、函式參數或 SQL 敘述
