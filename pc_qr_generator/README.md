# PC 現場 QR 測試器

這個程式在 ESP32 與 1.54 吋螢幕到貨前，模擬「使用者揮手後顯示
240 × 240 QR Code」的流程。按按鈕、空白鍵或 Enter 即視為揮手。

## 第一次設定（Windows）

1. 確認電腦已安裝 Python 3.10 以上版本，安裝時勾選 **Add Python to PATH**。
2. 雙擊 `start_windows.bat`。
3. 第一次執行會建立 `.venv`、安裝套件，並啟動 `setup_device.py`。
4. 設定程式會產生：
   - `config.json`：裝置密碼，只能留在現場電腦，禁止上傳 GitHub。
   - `register_device.sql`：貼到 Supabase 的 SQL Editor 執行一次。
5. SQL 執行完成後，再雙擊 `start_windows.bat`。

如果第一次尚未執行註冊 SQL，畫面出現「裝置認證失敗」是正常的；完成
SQL 後再按一次產生按鈕即可。

## macOS / Linux

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python setup_device.py
# 將 register_device.sql 貼至 Supabase SQL Editor 執行
python presence_qr.py
```

只想輸出一張 PNG、不開視窗時：

```bash
python presence_qr.py --save-only
```

## 行為

- 每次觸發都向 `issue-presence-token` 取得新的隨機 Token。
- 每組 Token 有效 10 分鐘，期間可讓多位使用者重複掃描。
- 逾時後 QR 圖仍留在畫面；掃描仍會進入網站，但網站會禁止簽到。
- QR 使用低錯誤修正以保留較大的模組，在 240 × 240 螢幕上較容易辨識。
- 實際 ESP32 上線後，會沿用同一個 API 與裝置認證，不需修改網頁端。

## 安全注意事項

- `config.json` 內的 `device_secret` 等同現場裝置密碼。
- 若裝置遺失，請在 `presence_devices` 將該列的 `enabled` 改為 `false`。
- 重新執行 `setup_device.py` 會更換密碼；必須再次執行新產生的 SQL。
- 不要把 Supabase `service_role` key 放入此程式。這個程式不需要它。
