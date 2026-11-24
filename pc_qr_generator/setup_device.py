"""Create local credentials and the one-time SQL for an on-site QR device.""" # 函式或模組的原始說明字串

from __future__ import annotations # 匯入 __future__  的 annotations，提供本工具相依功能

import getpass # 匯入  的 getpass，提供本工具相依功能
import hashlib # 匯入  的 hashlib，提供本工具相依功能
import json # 匯入  的 json，提供本工具相依功能
import re # 匯入  的 re，提供本工具相依功能
import secrets # 匯入  的 secrets，提供本工具相依功能
from pathlib import Path # 匯入 pathlib  的 Path，提供本工具相依功能


ROOT = Path(__file__).resolve().parent # 設定 ROOT，保存 PC QR 工具 所需的資料或控制項
CONFIG_PATH = ROOT / "config.json" # 設定 CONFIG_PATH，保存 PC QR 工具 所需的資料或控制項
SQL_PATH = ROOT / "register_device.sql" # 設定 SQL_PATH，保存 PC QR 工具 所需的資料或控制項
DEFAULT_FUNCTION_URL = ( # 設定 DEFAULT_FUNCTION_URL，保存 PC QR 工具 所需的資料或控制項
    "https://rihibyswtlqsyljarerr.supabase.co/functions/v1/" # 續接 PC QR 工具 的參數、條件或呼叫："https://rihibyswtlqsyljarerr.supabase.co/functions/v1/"
    "issue-presence-token" # 續接 PC QR 工具 的參數、條件或呼叫："issue-presence-token"
) # 結束 PC QR 工具 目前的呼叫參數或資料結構
DEVICE_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]{2,63}$") # 設定 DEVICE_PATTERN，保存 PC QR 工具 所需的資料或控制項


def prompt(label: str, default: str) -> str: # 定義 prompt()：處理 prompt 的操作流程
    value = input(f"{label} [{default}]: ").strip() # 設定 value，保存 prompt() 所需的資料或控制項
    return value or default # 回傳 value or default 給 prompt() 的呼叫端


def sql_literal(value: str) -> str: # 定義 sql_literal()：處理 sql_literal 的操作流程
    return "'" + value.replace("'", "''") + "'" # 回傳 "'" + value.replace("'", "''") + "'" 給 sql_literal() 的呼叫端


def build_registration_sql( # 定義 build_registration_sql()：處理 build_registration_sql 的操作流程
    device_id: str, # 續接 build_registration_sql() 的參數、條件或呼叫：device_id: str,
    display_name: str, # 續接 build_registration_sql() 的參數、條件或呼叫：display_name: str,
    secret_hash: str, # 續接 build_registration_sql() 的參數、條件或呼叫：secret_hash: str,
) -> str: # 續接 build_registration_sql() 的參數、條件或呼叫：) -> str:
    return f"""-- Paste this file into Supabase Dashboard > SQL Editor and run it once.
insert into public.presence_devices (
  device_code,
  display_name,
  secret_hash,
  enabled
)
values (
  {sql_literal(device_id)},
  {sql_literal(display_name)},
  {sql_literal(secret_hash)},
  true
)
on conflict (device_code) do update
set
  display_name = excluded.display_name,
  secret_hash = excluded.secret_hash,
  enabled = true,
  updated_at = now();
""" # 函式或模組的原始說明字串


def main() -> None: # 定義 main()：解析啟動參數並執行工具主流程
    print("運動科學實驗室｜現場 QR 裝置設定") # 續接 main() 的參數、條件或呼叫：print("運動科學實驗室｜現場 QR 裝置設定")
    print("這個步驟只會在本機建立裝置密碼與註冊 SQL。\n") # 續接 main() 的參數、條件或呼叫：print("這個步驟只會在本機建立裝置密碼與註冊 SQL。\n")

    function_url = prompt("Edge Function URL", DEFAULT_FUNCTION_URL) # 設定 function_url，保存 main() 所需的資料或控制項
    device_id = prompt("裝置代碼", "lab-entrance-01").lower() # 設定 device_id，保存 main() 所需的資料或控制項
    if not DEVICE_PATTERN.fullmatch(device_id): # 檢查條件「not DEVICE_PATTERN.fullmatch(device_id)」，成立時執行下方流程
        raise SystemExit( # 拒絕無效設定或回應，交出可供使用者理解的錯誤
            "裝置代碼需為 3–64 個小寫英數字、底線或連字號，且須以英數字開頭。" # 續接 main() 的參數、條件或呼叫："裝置代碼需為 3–64 個小寫英數字、底線或連字號，且須以英數字開頭。"
        ) # 結束 main() 目前的呼叫參數或資料結構

    display_name = prompt("裝置名稱", "實驗室入口測試電腦") # 設定 display_name，保存 main() 所需的資料或控制項
    if not 1 <= len(display_name) <= 80: # 檢查條件「not 1 <= len(display_name) <= 80」，成立時執行下方流程
        raise SystemExit("裝置名稱需為 1–80 個字元。") # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    if CONFIG_PATH.exists(): # 檢查條件「CONFIG_PATH.exists()」，成立時執行下方流程
        confirmation = input( # 設定 confirmation，保存 main() 所需的資料或控制項
            "config.json 已存在。輸入 REPLACE 才會更換裝置密碼： " # 續接 main() 的參數、條件或呼叫："config.json 已存在。輸入 REPLACE 才會更換裝置密碼： "
        ).strip() # 續接 main() 的參數、條件或呼叫：).strip()
        if confirmation != "REPLACE": # 檢查條件「confirmation != "REPLACE"」，成立時執行下方流程
            raise SystemExit("已取消，原有裝置密碼未變更。") # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    device_secret = secrets.token_urlsafe(32) # 設定 device_secret，保存 main() 所需的資料或控制項
    secret_hash = hashlib.sha256(device_secret.encode("utf-8")).hexdigest() # 設定 secret_hash，保存 main() 所需的資料或控制項
    config = { # 設定 config，保存 main() 所需的資料或控制項
        "function_url": function_url, # 續接 main() 的參數、條件或呼叫："function_url": function_url,
        "device_id": device_id, # 續接 main() 的參數、條件或呼叫："device_id": device_id,
        "device_secret": device_secret, # 續接 main() 的參數、條件或呼叫："device_secret": device_secret,
        "display_size": 240, # 續接 main() 的參數、條件或呼叫："display_size": 240,
    } # 結束 main() 目前的呼叫參數或資料結構

    CONFIG_PATH.write_text( # 將設定或 SQL 檔寫到指定本機路徑
        json.dumps(config, ensure_ascii=False, indent=2) + "\n", # 設定 json.dumps(config, ensure_ascii，保存 main() 所需的資料或控制項
        encoding="utf-8", # 設定 encoding，保存 main() 所需的資料或控制項
    ) # 結束 main() 目前的呼叫參數或資料結構
    SQL_PATH.write_text( # 將設定或 SQL 檔寫到指定本機路徑
        build_registration_sql(device_id, display_name, secret_hash), # 續接 main() 的參數、條件或呼叫：build_registration_sql(device_id, display_name, secret_hash),
        encoding="utf-8", # 設定 encoding，保存 main() 所需的資料或控制項
    ) # 結束 main() 目前的呼叫參數或資料結構

    print("\n已建立：") # 續接 main() 的參數、條件或呼叫：print("\n已建立：")
    print(f"  {CONFIG_PATH.name}（請勿上傳 GitHub 或傳給他人）") # 續接 main() 的參數、條件或呼叫：print(f"  {CONFIG_PATH.name}（請勿上傳 GitHub 或傳給他人）")
    print(f"  {SQL_PATH.name}（下一步貼到 Supabase SQL Editor 執行）") # 續接 main() 的參數、條件或呼叫：print(f"  {SQL_PATH.name}（下一步貼到 Supabase SQL Editor 執行）")
    print("\n完成 SQL 後，執行：python presence_qr.py") # 續接 main() 的參數、條件或呼叫：print("\n完成 SQL 後，執行：python presence_qr.py")
    getpass.getpass("按 Enter 關閉……") # 續接 main() 的參數、條件或呼叫：getpass.getpass("按 Enter 關閉……")


if __name__ == "__main__": # 檢查條件「__name__ == "__main__"」，成立時執行下方流程
    main() # 續接 PC QR 工具 的參數、條件或呼叫：main()

