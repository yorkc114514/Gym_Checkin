grant usage -- 授予明確列出的角色指定操作權限
on schema public -- 續接資料庫欄位、條件或回傳內容：on schema public
to service_role; -- 續接資料庫欄位、條件或回傳內容：to service_role;

grant select, update -- 授予明確列出的角色指定操作權限
on table public.presence_devices -- 續接資料庫欄位、條件或回傳內容：on table public.presence_devices
to service_role; -- 續接資料庫欄位、條件或回傳內容：to service_role;

grant select, insert, delete -- 授予明確列出的角色指定操作權限
on table public.presence_qr_tokens -- 續接資料庫欄位、條件或回傳內容：on table public.presence_qr_tokens
to service_role; -- 續接資料庫欄位、條件或回傳內容：to service_role;
