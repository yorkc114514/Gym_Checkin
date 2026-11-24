"""PC test display for the 240 x 240 on-site check-in QR flow.""" # 函式或模組的原始說明字串

from __future__ import annotations # 匯入 __future__  的 annotations，提供本工具相依功能

import argparse # 匯入  的 argparse，提供本工具相依功能
import json # 匯入  的 json，提供本工具相依功能
import queue # 匯入  的 queue，提供本工具相依功能
import ssl # 匯入  的 ssl，提供本工具相依功能
import threading # 匯入  的 threading，提供本工具相依功能
import urllib.error # 匯入  的 urllib.error，提供本工具相依功能
import urllib.request # 匯入  的 urllib.request，提供本工具相依功能
from datetime import datetime, timezone # 匯入 datetime  的 datetime, timezone，提供本工具相依功能
from pathlib import Path # 匯入 pathlib  的 Path，提供本工具相依功能
from tkinter import BOTH, BOTTOM, DISABLED, NORMAL, X, Button, Label, Tk, messagebox # 匯入 tkinter  的 BOTH, BOTTOM, DISABLED, NORMAL, X, Button, Label, Tk, messagebox，提供本工具相依功能

import qrcode # 匯入  的 qrcode，提供本工具相依功能
from PIL import Image, ImageTk # 匯入 PIL  的 Image, ImageTk，提供本工具相依功能
from qrcode.constants import ERROR_CORRECT_L # 匯入 qrcode.constants  的 ERROR_CORRECT_L，提供本工具相依功能


ROOT = Path(__file__).resolve().parent # 設定 ROOT，保存 PC QR 工具 所需的資料或控制項
CONFIG_PATH = ROOT / "config.json" # 設定 CONFIG_PATH，保存 PC QR 工具 所需的資料或控制項
LAST_QR_PATH = ROOT / "last_qr_240.png" # 設定 LAST_QR_PATH，保存 PC QR 工具 所需的資料或控制項


def load_config(path: Path = CONFIG_PATH) -> dict: # 定義 load_config()：讀取 PC QR 設定並驗證必要欄位
    if not path.exists(): # 檢查條件「not path.exists()」，成立時執行下方流程
        raise RuntimeError("找不到 config.json，請先執行 setup_device.py。") # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    config = json.loads(path.read_text(encoding="utf-8")) # 把設定檔或 API 回應的 JSON 文字解析成 Python 物件
    required = ("function_url", "device_id", "device_secret") # 設定 required，保存 load_config() 所需的資料或控制項
    missing = [name for name in required if not str(config.get(name, "")).strip()] # 設定 missing，保存 load_config() 所需的資料或控制項
    if missing: # 檢查條件「missing」，成立時執行下方流程
        raise RuntimeError(f"config.json 缺少欄位：{', '.join(missing)}") # 拒絕無效設定或回應，交出可供使用者理解的錯誤
    return config # 回傳 config 給 load_config() 的呼叫端


def request_qr_payload(config: dict, timeout: int = 15) -> dict: # 定義 request_qr_payload()：以裝置認證向 Supabase 申請現場 QR Token
    request = urllib.request.Request( # 建立裝置認證用 HTTP 請求
        str(config["function_url"]), # 續接 request_qr_payload() 的參數、條件或呼叫：str(config["function_url"]),
        data=b"{}", # 設定 data，保存 request_qr_payload() 所需的資料或控制項
        headers={ # 設定 headers，保存 request_qr_payload() 所需的資料或控制項
            "Content-Type": "application/json", # 續接 request_qr_payload() 的參數、條件或呼叫："Content-Type": "application/json",
            "X-Device-ID": str(config["device_id"]), # 續接 request_qr_payload() 的參數、條件或呼叫："X-Device-ID": str(config["device_id"]),
            "X-Device-Secret": str(config["device_secret"]), # 續接 request_qr_payload() 的參數、條件或呼叫："X-Device-Secret": str(config["device_secret"]),
            "User-Agent": "gym-checkin-pc-qr/1.0", # 續接 request_qr_payload() 的參數、條件或呼叫："User-Agent": "gym-checkin-pc-qr/1.0",
        }, # 結束 request_qr_payload() 目前的呼叫參數或資料結構
        method="POST", # 設定 method，保存 request_qr_payload() 所需的資料或控制項
    ) # 結束 request_qr_payload() 目前的呼叫參數或資料結構

    try: # 開始可能失敗的操作，交由 except 處理錯誤
        with urllib.request.urlopen( # 送出 HTTPS 請求並使用設定的逾時限制
            request, # 續接 request_qr_payload() 的參數、條件或呼叫：request,
            timeout=timeout, # 設定 timeout，保存 request_qr_payload() 所需的資料或控制項
            context=ssl.create_default_context(), # 使用預設 CA 驗證的 TLS 設定
        ) as response: # 續接 request_qr_payload() 的參數、條件或呼叫：) as response:
            payload = json.loads(response.read().decode("utf-8")) # 把設定檔或 API 回應的 JSON 文字解析成 Python 物件
    except urllib.error.HTTPError as error: # 捕捉指定例外，避免網路或設定錯誤直接結束工具
        try: # 開始可能失敗的操作，交由 except 處理錯誤
            payload = json.loads(error.read().decode("utf-8")) # 把設定檔或 API 回應的 JSON 文字解析成 Python 物件
            detail = payload.get("error") # 設定 detail，保存 request_qr_payload() 所需的資料或控制項
        except (UnicodeDecodeError, json.JSONDecodeError): # 捕捉指定例外，避免網路或設定錯誤直接結束工具
            detail = None # 設定 detail，保存 request_qr_payload() 所需的資料或控制項
        raise RuntimeError(detail or f"Edge Function 回傳 HTTP {error.code}") from error # 拒絕無效設定或回應，交出可供使用者理解的錯誤
    except urllib.error.URLError as error: # 捕捉指定例外，避免網路或設定錯誤直接結束工具
        raise RuntimeError(f"無法連線到 Supabase：{error.reason}") from error # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    if not payload.get("ok") or not payload.get("check_in_url"): # 檢查條件「not payload.get("ok") or not payload.get("check_in_url")」，成立時執行下方流程
        raise RuntimeError(payload.get("error") or "伺服器沒有回傳簽到網址") # 拒絕無效設定或回應，交出可供使用者理解的錯誤
    return payload # 回傳 payload 給 request_qr_payload() 的呼叫端


def render_qr(url: str, size: int = 240) -> tuple[Image.Image, int, int]: # 定義 render_qr()：處理 render_qr 的操作流程
    qr = qrcode.QRCode( # 設定 qr，保存 render_qr() 所需的資料或控制項
        version=None, # 設定 version，保存 render_qr() 所需的資料或控制項
        error_correction=ERROR_CORRECT_L, # 設定 error_correction，保存 render_qr() 所需的資料或控制項
        box_size=1, # 設定 box_size，保存 render_qr() 所需的資料或控制項
        border=4, # 設定 border，保存 render_qr() 所需的資料或控制項
    ) # 結束 render_qr() 目前的呼叫參數或資料結構
    qr.add_data(url) # 續接 render_qr() 的參數、條件或呼叫：qr.add_data(url)
    qr.make(fit=True) # 設定 qr.make(fit，保存 render_qr() 所需的資料或控制項

    matrix_width = len(qr.get_matrix()) # 設定 matrix_width，保存 render_qr() 所需的資料或控制項
    pixels_per_module = size // matrix_width # 設定 pixels_per_module，保存 render_qr() 所需的資料或控制項
    if pixels_per_module < 3: # 檢查條件「pixels_per_module < 3」，成立時執行下方流程
        raise RuntimeError("簽到網址太長，無法在 240×240 畫面清楚顯示。") # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    rendered = qr.make_image( # 設定 rendered，保存 render_qr() 所需的資料或控制項
        fill_color="black", # 設定 fill_color，保存 render_qr() 所需的資料或控制項
        back_color="white", # 設定 back_color，保存 render_qr() 所需的資料或控制項
    ).convert("RGB") # 續接 render_qr() 的參數、條件或呼叫：).convert("RGB")
    rendered = rendered.resize( # 設定 rendered，保存 render_qr() 所需的資料或控制項
        (matrix_width * pixels_per_module, matrix_width * pixels_per_module), # 續接 render_qr() 的參數、條件或呼叫：(matrix_width * pixels_per_module, matrix_width * pixels_per_module),
        Image.Resampling.NEAREST, # 續接 render_qr() 的參數、條件或呼叫：Image.Resampling.NEAREST,
    ) # 結束 render_qr() 目前的呼叫參數或資料結構
    canvas = Image.new("RGB", (size, size), "white") # 設定 canvas，保存 render_qr() 所需的資料或控制項
    offset = ((size - rendered.width) // 2, (size - rendered.height) // 2) # 設定 offset，保存 render_qr() 所需的資料或控制項
    canvas.paste(rendered, offset) # 續接 render_qr() 的參數、條件或呼叫：canvas.paste(rendered, offset)
    return canvas, matrix_width, pixels_per_module # 回傳 canvas, matrix_width, pixels_per_module 給 render_qr() 的呼叫端


def parse_timestamp(value: str) -> datetime: # 定義 parse_timestamp()：處理 parse_timestamp 的操作流程
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc) # 回傳 datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc) 給 parse_timestamp() 的呼叫端


class PresenceQrApp: # 定義 PC QR 視窗或工具類別，集中保存狀態與操作
    def __init__(self, root: Tk, config: dict) -> None: # 定義 __init__()：處理 __init__ 的操作流程
        self.root = root # 設定 self.root，保存 __init__() 所需的資料或控制項
        self.config = config # 設定 self.config，保存 __init__() 所需的資料或控制項
        self.result_queue: queue.Queue = queue.Queue() # 設定 self.result_queue: queue.Queue，保存 __init__() 所需的資料或控制項
        self.expires_at: datetime | None = None # 設定 self.expires_at: datetime | None，保存 __init__() 所需的資料或控制項
        self.photo: ImageTk.PhotoImage | None = ImageTk.PhotoImage( # 設定 self.photo: ImageTk.PhotoImage | None，保存 __init__() 所需的資料或控制項
            Image.new("RGB", (240, 240), "#111827") # 續接 __init__() 的參數、條件或呼叫：Image.new("RGB", (240, 240), "#111827")
        ) # 結束 __init__() 目前的呼叫參數或資料結構
        self.loading = False # 設定 self.loading，保存 __init__() 所需的資料或控制項

        root.title("現場簽到 QR｜PC 測試器") # 續接 __init__() 的參數、條件或呼叫：root.title("現場簽到 QR｜PC 測試器")
        root.configure(bg="#0f172a") # 更新 Tkinter 控制項文字、顏色或可用狀態
        root.resizable(False, False) # 續接 __init__() 的參數、條件或呼叫：root.resizable(False, False)
        root.bind("<space>", lambda _event: self.issue_qr()) # 續接 __init__() 的參數、條件或呼叫：root.bind("<space>", lambda _event: self.issue_qr())
        root.bind("<Return>", lambda _event: self.issue_qr()) # 續接 __init__() 的參數、條件或呼叫：root.bind("<Return>", lambda _event: self.issue_qr())

        self.title = Label( # 設定 self.title，保存 __init__() 所需的資料或控制項
            root, # 續接 __init__() 的參數、條件或呼叫：root,
            text="在超音波感測器前揮手", # 設定 text，保存 __init__() 所需的資料或控制項
            fg="#f8fafc", # 設定 fg，保存 __init__() 所需的資料或控制項
            bg="#0f172a", # 設定 bg，保存 __init__() 所需的資料或控制項
            font=("Arial", 16, "bold"), # 設定 font，保存 __init__() 所需的資料或控制項
            pady=12, # 設定 pady，保存 __init__() 所需的資料或控制項
        ) # 結束 __init__() 目前的呼叫參數或資料結構
        self.title.pack(fill=X) # 設定 self.title.pack(fill，保存 __init__() 所需的資料或控制項

        self.qr_label = Label( # 設定 self.qr_label，保存 __init__() 所需的資料或控制項
            root, # 續接 __init__() 的參數、條件或呼叫：root,
            image=self.photo, # 設定 image，保存 __init__() 所需的資料或控制項
            compound="center", # 設定 compound，保存 __init__() 所需的資料或控制項
            width=240, # 設定 width，保存 __init__() 所需的資料或控制項
            height=240, # 設定 height，保存 __init__() 所需的資料或控制項
            text="按下方按鈕或空白鍵\n模擬揮手", # 設定 text，保存 __init__() 所需的資料或控制項
            fg="#cbd5e1", # 設定 fg，保存 __init__() 所需的資料或控制項
            bg="#111827", # 設定 bg，保存 __init__() 所需的資料或控制項
            font=("Arial", 13), # 設定 font，保存 __init__() 所需的資料或控制項
        ) # 結束 __init__() 目前的呼叫參數或資料結構
        self.qr_label.pack(padx=18, pady=4) # 設定 self.qr_label.pack(padx，保存 __init__() 所需的資料或控制項

        self.status = Label( # 設定 self.status，保存 __init__() 所需的資料或控制項
            root, # 續接 __init__() 的參數、條件或呼叫：root,
            text="QR Code 尚未產生", # 設定 text，保存 __init__() 所需的資料或控制項
            fg="#94a3b8", # 設定 fg，保存 __init__() 所需的資料或控制項
            bg="#0f172a", # 設定 bg，保存 __init__() 所需的資料或控制項
            font=("Arial", 11), # 設定 font，保存 __init__() 所需的資料或控制項
            pady=10, # 設定 pady，保存 __init__() 所需的資料或控制項
        ) # 結束 __init__() 目前的呼叫參數或資料結構
        self.status.pack(fill=X) # 設定 self.status.pack(fill，保存 __init__() 所需的資料或控制項

        self.button = Button( # 設定 self.button，保存 __init__() 所需的資料或控制項
            root, # 續接 __init__() 的參數、條件或呼叫：root,
            text="模擬揮手／產生新 QR Code", # 設定 text，保存 __init__() 所需的資料或控制項
            command=self.issue_qr, # 設定 command，保存 __init__() 所需的資料或控制項
            bg="#22c55e", # 設定 bg，保存 __init__() 所需的資料或控制項
            fg="#052e16", # 設定 fg，保存 __init__() 所需的資料或控制項
            activebackground="#86efac", # 設定 activebackground，保存 __init__() 所需的資料或控制項
            font=("Arial", 12, "bold"), # 設定 font，保存 __init__() 所需的資料或控制項
            padx=12, # 設定 padx，保存 __init__() 所需的資料或控制項
            pady=9, # 設定 pady，保存 __init__() 所需的資料或控制項
        ) # 結束 __init__() 目前的呼叫參數或資料結構
        self.button.pack(fill=BOTH, side=BOTTOM, padx=18, pady=(0, 16)) # 設定 self.button.pack(fill，保存 __init__() 所需的資料或控制項

        self.root.after(100, self.poll_result) # 交由 Tkinter 主執行緒稍後更新畫面或倒數
        self.root.after(250, self.update_countdown) # 交由 Tkinter 主執行緒稍後更新畫面或倒數

    def issue_qr(self) -> None: # 定義 issue_qr()：處理 issue_qr 的操作流程
        if self.loading: # 檢查條件「self.loading」，成立時執行下方流程
            return # 回傳  給 issue_qr() 的呼叫端
        self.loading = True # 設定 self.loading，保存 issue_qr() 所需的資料或控制項
        self.button.configure(state=DISABLED) # 更新 Tkinter 控制項文字、顏色或可用狀態
        self.status.configure(text="正在向 Supabase 取得 10 分鐘認證碼……", fg="#7dd3fc") # 更新 Tkinter 控制項文字、顏色或可用狀態
        threading.Thread(target=self.fetch_in_background, daemon=True).start() # 在背景執行網路操作，避免凍結 Tkinter 視窗

    def fetch_in_background(self) -> None: # 定義 fetch_in_background()：處理 fetch_in_background 的操作流程
        try: # 開始可能失敗的操作，交由 except 處理錯誤
            payload = request_qr_payload(self.config) # 設定 payload，保存 fetch_in_background() 所需的資料或控制項
            size = int(self.config.get("display_size", 240)) # 設定 size，保存 fetch_in_background() 所需的資料或控制項
            image, modules, pixels = render_qr(payload["check_in_url"], size) # 設定 image, modules, pixels，保存 fetch_in_background() 所需的資料或控制項
            image.save(LAST_QR_PATH) # 續接 fetch_in_background() 的參數、條件或呼叫：image.save(LAST_QR_PATH)
            self.result_queue.put(("ok", payload, image, modules, pixels)) # 透過佇列在背景作業與 GUI 主執行緒之間交換結果
        except Exception as error:  # noqa: BLE001 - displayed to the operator # 捕捉指定例外，避免網路或設定錯誤直接結束工具
            self.result_queue.put(("error", str(error))) # 透過佇列在背景作業與 GUI 主執行緒之間交換結果

    def poll_result(self) -> None: # 定義 poll_result()：處理 poll_result 的操作流程
        try: # 開始可能失敗的操作，交由 except 處理錯誤
            result = self.result_queue.get_nowait() # 透過佇列在背景作業與 GUI 主執行緒之間交換結果
        except queue.Empty: # 捕捉指定例外，避免網路或設定錯誤直接結束工具
            self.root.after(100, self.poll_result) # 交由 Tkinter 主執行緒稍後更新畫面或倒數
            return # 回傳  給 poll_result() 的呼叫端

        self.loading = False # 設定 self.loading，保存 poll_result() 所需的資料或控制項
        self.button.configure(state=NORMAL) # 更新 Tkinter 控制項文字、顏色或可用狀態

        if result[0] == "error": # 檢查條件「result[0] == "error"」，成立時執行下方流程
            self.status.configure(text="產生失敗", fg="#fca5a5") # 更新 Tkinter 控制項文字、顏色或可用狀態
            messagebox.showerror("無法產生 QR Code", result[1]) # 向使用者顯示操作失敗或提示對話框
        else: # 當前一條件不成立時，改執行這個分支
            _, payload, image, modules, pixels = result # 設定 _, payload, image, modules, pixels，保存 poll_result() 所需的資料或控制項
            self.photo = ImageTk.PhotoImage(image) # 設定 self.photo，保存 poll_result() 所需的資料或控制項
            self.qr_label.configure(image=self.photo, text="", width=image.width, height=image.height) # 更新 Tkinter 控制項文字、顏色或可用狀態
            self.expires_at = parse_timestamp(payload["expires_at"]) # 設定 self.expires_at，保存 poll_result() 所需的資料或控制項
            self.status.configure( # 更新 Tkinter 控制項文字、顏色或可用狀態
                text=f"認證有效｜{modules} 模組｜每模組 {pixels}px", # 設定 text，保存 poll_result() 所需的資料或控制項
                fg="#86efac", # 設定 fg，保存 poll_result() 所需的資料或控制項
            ) # 結束 poll_result() 目前的呼叫參數或資料結構

        self.root.after(100, self.poll_result) # 交由 Tkinter 主執行緒稍後更新畫面或倒數

    def update_countdown(self) -> None: # 定義 update_countdown()：處理 update_countdown 的操作流程
        if self.expires_at and not self.loading: # 檢查條件「self.expires_at and not self.loading」，成立時執行下方流程
            remaining = int( # 設定 remaining，保存 update_countdown() 所需的資料或控制項
                (self.expires_at - datetime.now(timezone.utc)).total_seconds() # 續接 update_countdown() 的參數、條件或呼叫：(self.expires_at - datetime.now(timezone.utc)).total_seconds()
            ) # 結束 update_countdown() 目前的呼叫參數或資料結構
            if remaining >= 0: # 檢查條件「remaining >= 0」，成立時執行下方流程
                self.status.configure( # 更新 Tkinter 控制項文字、顏色或可用狀態
                    text=f"可重複掃描｜剩餘 {remaining} 秒", # 設定 text，保存 update_countdown() 所需的資料或控制項
                    fg="#86efac" if remaining > 10 else "#fde68a", # 設定 fg，保存 update_countdown() 所需的資料或控制項
                ) # 結束 update_countdown() 目前的呼叫參數或資料結構
            else: # 當前一條件不成立時，改執行這個分支
                self.status.configure( # 更新 Tkinter 控制項文字、顏色或可用狀態
                    text="已過期｜仍可開啟網頁，但不能簽到", # 設定 text，保存 update_countdown() 所需的資料或控制項
                    fg="#fca5a5", # 設定 fg，保存 update_countdown() 所需的資料或控制項
                ) # 結束 update_countdown() 目前的呼叫參數或資料結構
                self.expires_at = None # 設定 self.expires_at，保存 update_countdown() 所需的資料或控制項
        self.root.after(250, self.update_countdown) # 交由 Tkinter 主執行緒稍後更新畫面或倒數


def save_once(config: dict) -> None: # 定義 save_once()：處理 save_once 的操作流程
    payload = request_qr_payload(config) # 設定 payload，保存 save_once() 所需的資料或控制項
    size = int(config.get("display_size", 240)) # 設定 size，保存 save_once() 所需的資料或控制項
    image, modules, pixels = render_qr(payload["check_in_url"], size) # 設定 image, modules, pixels，保存 save_once() 所需的資料或控制項
    image.save(LAST_QR_PATH) # 續接 save_once() 的參數、條件或呼叫：image.save(LAST_QR_PATH)
    print(f"已建立：{LAST_QR_PATH}") # 續接 save_once() 的參數、條件或呼叫：print(f"已建立：{LAST_QR_PATH}")
    print(f"有效期限：{payload['expires_at']}") # 續接 save_once() 的參數、條件或呼叫：print(f"有效期限：{payload['expires_at']}")
    print(f"QR：{modules} 模組，每模組 {pixels}px，輸出 {size}×{size}px") # 續接 save_once() 的參數、條件或呼叫：print(f"QR：{modules} 模組，每模組 {pixels}px，輸出 {size}×{size}px")


def main() -> None: # 定義 main()：解析啟動參數並執行工具主流程
    parser = argparse.ArgumentParser(description="現場簽到 QR PC 測試器") # 設定 parser，保存 main() 所需的資料或控制項
    parser.add_argument( # 續接 main() 的參數、條件或呼叫：parser.add_argument(
        "--save-only", # 續接 main() 的參數、條件或呼叫："--save-only",
        action="store_true", # 設定 action，保存 main() 所需的資料或控制項
        help="不開啟視窗，只產生 last_qr_240.png", # 設定 help，保存 main() 所需的資料或控制項
    ) # 結束 main() 目前的呼叫參數或資料結構
    args = parser.parse_args() # 設定 args，保存 main() 所需的資料或控制項

    try: # 開始可能失敗的操作，交由 except 處理錯誤
        config = load_config() # 設定 config，保存 main() 所需的資料或控制項
    except (OSError, ValueError, RuntimeError) as error: # 捕捉指定例外，避免網路或設定錯誤直接結束工具
        raise SystemExit(str(error)) from error # 拒絕無效設定或回應，交出可供使用者理解的錯誤

    if args.save_only: # 檢查條件「args.save_only」，成立時執行下方流程
        save_once(config) # 續接 main() 的參數、條件或呼叫：save_once(config)
        return # 回傳  給 main() 的呼叫端

    root = Tk() # 設定 root，保存 main() 所需的資料或控制項
    PresenceQrApp(root, config) # 續接 main() 的參數、條件或呼叫：PresenceQrApp(root, config)
    root.mainloop() # 續接 main() 的參數、條件或呼叫：root.mainloop()


if __name__ == "__main__": # 檢查條件「__name__ == "__main__"」，成立時執行下方流程
    main() # 續接 PC QR 工具 的參數、條件或呼叫：main()
