-- 先在 SQL Editor 執行本檔，再部署 600 秒的 issue-presence-token。
-- 只放寬有效期上限，不刪表、不清資料，也不延長既有 Token 的 expires_at。
begin; -- 開始單一交易，確保約束修改完整套用
alter table public.presence_qr_tokens -- 修改現場 QR Token 資料表的約束
  drop constraint if exists presence_qr_token_valid_lifetime; -- 移除原本的有效期約束；不存在時可直接略過，便於重跑
alter table public.presence_qr_tokens -- 再次指定要修改的現場 QR Token 資料表
  add constraint presence_qr_token_valid_lifetime -- 建立新版有效期約束，名稱保持不變
  check ( -- 開始定義每筆 Token 都必須符合的檢查條件
    expires_at > issued_at -- 到期時間必須晚於發行時間，拒絕零秒或負數有效期
    and expires_at <= issued_at + interval '10 minutes' -- 到期時間最多是發行時間加十分鐘，拒絕更長有效期
  ); -- 結束並套用這個檢查條件
comment on constraint presence_qr_token_valid_lifetime -- 為新版有效期約束加上資料庫用途說明
  on public.presence_qr_tokens is -- 指定這個約束位於現場 QR Token 資料表
  'Positive lifetime up to 10 minutes; the server checks expires_at at check-in.'; -- 保存說明文字：簽到時仍由伺服器檢查到期時間
commit; -- 提交完整交易，完成有效期上限調整
