import { TimerStorage, KEY } from './repository.js'; // 從 ./repository.js 載入相依介面，供組間休息計時器使用
const defaults = () => ({ // 宣告不可重新指定的 defaults，供defaults()使用
  version: 1, // 設定 version 欄位的值或型別
  duration: 90, // 設定 duration 欄位的值或型別
  remaining: 90000, // 設定 remaining 欄位的值或型別
  deadline: null, // 設定 deadline 欄位的值或型別
  state: 'idle', // 設定 畫面狀態 欄位的值或型別
  sound: false, // 設定 sound 欄位的值或型別
}); // 結束 defaults() 的目前區塊、參數或資料結構
let data = defaults(), // 宣告可更新的 查詢或回應資料，供組間休息計時器使用
  storageError = '', // 更新 storageError，保存本步處理結果
  audio; // 續接 組間休息計時器 的運算、回呼或參數：audio;
function load() { // 定義 load()：處理 組間休息計時器 的 load 邏輯
  try { // 開始可捕捉例外的操作範圍
    const value = TimerStorage.read(); // 宣告不可重新指定的 欄位值，供load()使用
    if ( // 檢查 (；成立時才執行此分支
      value && // 續接 load() 的運算、回呼或參數：value &&
      value.version === 1 && // 續接 load() 的運算、回呼或參數：value.version === 1 &&
      ['idle', 'running', 'paused', 'done'].includes(value.state) && // 續接 load() 的運算、回呼或參數：['idle', 'running', 'paused', 'done'].includes(value.state) &&
      Number.isInteger(value.duration) && // 呼叫 Number.isInteger()，處理 組間休息計時器 的 isInteger 邏輯
      value.duration >= 5 && // 續接 load() 的運算、回呼或參數：value.duration >= 5 &&
      value.duration <= 3600 && // 續接 load() 的運算、回呼或參數：value.duration <= 3600 &&
      Number.isFinite(value.remaining) && // 呼叫 Number.isFinite()，處理 組間休息計時器 的 isFinite 邏輯
      value.remaining >= 0 && // 續接 load() 的運算、回呼或參數：value.remaining >= 0 &&
      value.remaining <= 3600000 && // 續接 load() 的運算、回呼或參數：value.remaining <= 3600000 &&
      (value.deadline === null || (Number.isFinite(value.deadline) && value.deadline > 0)) && // 續接 load() 的運算、回呼或參數：(value.deadline === null || (Number.isFinite(value.deadline) && value.deadli…
      (value.state !== 'running' || value.deadline !== null) // 續接 load() 的運算、回呼或參數：(value.state !== 'running' || value.deadline !== null)
    ) { // 續接 load() 的運算、回呼或參數：) {
      data = { ...value, sound: value.sound === true }; // 更新 查詢或回應資料，保存本步處理結果
      return; // 提前結束 load()，不再執行後續操作
    } // 結束 load() 的目前區塊、參數或資料結構
    data = defaults(); // 更新 查詢或回應資料，保存本步處理結果
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    storageError = '瀏覽器無法讀取計時設定；倒數僅在本頁有效。'; // 更新 storageError，保存本步處理結果
  } // 結束 load() 的目前區塊、參數或資料結構
} // 結束 load() 的目前區塊、參數或資料結構
function persist() { // 定義 persist()：處理 組間休息計時器 的 persist 邏輯
  try { // 開始可捕捉例外的操作範圍
    TimerStorage.write(data); // 呼叫 TimerStorage.write()，處理 組間休息計時器 的 write 邏輯
    storageError = ''; // 更新 storageError，保存本步處理結果
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    storageError = '計時狀態未能存入手機；離開或重整可能重設倒數。'; // 更新 storageError，保存本步處理結果
  } // 結束 persist() 的目前區塊、參數或資料結構
} // 結束 persist() 的目前區塊、參數或資料結構
function remaining() { // 定義 remaining()：處理 組間休息計時器 的 remaining 邏輯
  return data.state === 'running' ? Math.max(0, data.deadline - Date.now()) : data.remaining; // 回傳 data.state === 'running' ? Math.max(0, data.deadline - Date.now()) : data.remain…，交給 remaining() 的呼叫端
} // 結束 remaining() 的目前區塊、參數或資料結構
function format(ms) { // 定義 format()：處理 組間休息計時器 的 format 邏輯
  const s = Math.ceil(ms / 1000); // 宣告不可重新指定的 s，供format()使用
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; // 回傳 `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0'…，交給 format() 的呼叫端
} // 結束 format() 的目前區塊、參數或資料結構
function unlockAudio() { // 定義 unlockAudio()：處理 組間休息計時器 的 unlockAudio 邏輯
  if (!data.sound) return; // 檢查 (!data.sound) return;；成立時才執行此分支
  try { // 開始可捕捉例外的操作範圍
    const Audio = window.AudioContext || window.webkitAudioContext; // 宣告不可重新指定的 Audio，供unlockAudio()使用
    if (!Audio) return; // 檢查 (!Audio) return;；成立時才執行此分支
    audio ||= new Audio(); // 續接 unlockAudio() 的運算、回呼或參數：audio ||= new Audio();
    audio.resume().catch(() => {}); // 呼叫 audio.resume()，處理 組間休息計時器 的 resume 邏輯
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    /* Visual completion remains available. */ // 既有註解：說明設計、相依性或使用限制
  } // 結束 unlockAudio() 的目前區塊、參數或資料結構
} // 結束 unlockAudio() 的目前區塊、參數或資料結構
function beep() { // 定義 beep()：處理 組間休息計時器 的 beep 邏輯
  if (!data.sound || !audio || audio.state !== 'running' || document.hidden) return; // 檢查 (!data.sound || !audio || audio.state !== 'running' || document.hidden) return;；成立時才執行此分支
  try { // 開始可捕捉例外的操作範圍
    for (let i = 0; i < 3; i++) { // 依 for (let i = 0; i < 3; i++) 逐項處理或重複等待
      const oscillator = audio.createOscillator(), // 宣告不可重新指定的 oscillator，供beep()使用
        gain = audio.createGain(); // 更新 gain，保存本步處理結果
      oscillator.connect(gain); // 呼叫 oscillator.connect()，處理 組間休息計時器 的 connect 邏輯
      gain.connect(audio.destination); // 呼叫 gain.connect()，處理 組間休息計時器 的 connect 邏輯
      oscillator.frequency.value = 740; // 續接 beep() 的運算、回呼或參數：oscillator.frequency.value = 740;
      const start = audio.currentTime + i * 0.3; // 宣告不可重新指定的 start，供beep()使用
      gain.gain.setValueAtTime(0, start); // 呼叫 gain.gain.setValueAtTime()，處理 組間休息計時器 的 setValueAtTime 邏輯
      gain.gain.linearRampToValueAtTime(0.13, start + 0.02); // 呼叫 gain.gain.linearRampToValueAtTime()，處理 組間休息計時器 的 linearRampToValueAtTime 邏輯
      gain.gain.linearRampToValueAtTime(0, start + 0.18); // 呼叫 gain.gain.linearRampToValueAtTime()，處理 組間休息計時器 的 linearRampToValueAtTime 邏輯
      oscillator.start(start); // 呼叫 oscillator.start()，處理 組間休息計時器 的 start 邏輯
      oscillator.stop(start + 0.2); // 呼叫 oscillator.stop()，處理 組間休息計時器 的 stop 邏輯
    } // 結束 beep() 的目前區塊、參數或資料結構
  } catch { // 捕捉上方操作的錯誤，進入失敗處理
    /* Sound is best effort on mobile browsers. */ // 既有註解：說明設計、相依性或使用限制
  } // 結束 beep() 的目前區塊、參數或資料結構
} // 結束 beep() 的目前區塊、參數或資料結構
function emit() { // 定義 emit()：處理 組間休息計時器 的 emit 邏輯
  document.dispatchEvent(new CustomEvent('rest-timer-change', { detail: snapshot() })); // 呼叫 document.dispatchEvent()，處理 組間休息計時器 的 dispatchEvent 邏輯
  onChange?.(RestTimer); // 續接 emit() 的運算、回呼或參數：onChange?.(RestTimer);
} // 結束 emit() 的目前區塊、參數或資料結構
function snapshot() { // 定義 snapshot()：處理 組間休息計時器 的 snapshot 邏輯
  return { ...data, remaining: remaining(), formatted: format(remaining()), storageError }; // 回傳 { ...data, remaining: remaining(), formatted: format(remaining()), storageError …，交給 snapshot() 的呼叫端
} // 結束 snapshot() 的目前區塊、參數或資料結構
function tick() { // 定義 tick()：處理 組間休息計時器 的 tick 邏輯
  if (data.state === 'running' && remaining() <= 0) { // 檢查 (data.state === 'running' && remaining() <= 0)；成立時才執行此分支
    data.state = 'done'; // 續接 tick() 的運算、回呼或參數：data.state = 'done';
    data.remaining = 0; // 續接 tick() 的運算、回呼或參數：data.remaining = 0;
    data.deadline = null; // 續接 tick() 的運算、回呼或參數：data.deadline = null;
    persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
    beep(); // 呼叫 beep()，處理 組間休息計時器 的 beep 邏輯
  } // 結束 tick() 的目前區塊、參數或資料結構
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 tick() 的目前區塊、參數或資料結構
function setDuration(seconds) { // 定義 setDuration()：處理 組間休息計時器 的 setDuration 邏輯
  if (!Number.isInteger(seconds) || seconds < 5 || seconds > 3600) // 檢查 (!Number.isInteger(seconds) || seconds < 5 || seconds > 3600)；成立時才執行此分支
    throw new Error('休息秒數請填 5～3600 的整數。'); // 中止目前流程並交出錯誤，讓呼叫端或 catch 顯示失敗原因
  data.duration = seconds; // 續接 setDuration() 的運算、回呼或參數：data.duration = seconds;
  data.remaining = seconds * 1000; // 續接 setDuration() 的運算、回呼或參數：data.remaining = seconds * 1000;
  data.deadline = null; // 續接 setDuration() 的運算、回呼或參數：data.deadline = null;
  data.state = 'idle'; // 續接 setDuration() 的運算、回呼或參數：data.state = 'idle';
  persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 setDuration() 的目前區塊、參數或資料結構
function start(fresh = false) { // 定義 start()：處理 組間休息計時器 的 start 邏輯
  if (!fresh && data.state === 'running') return; // 檢查 (!fresh && data.state === 'running') return;；成立時才執行此分支
  const ms = // 宣告不可重新指定的 ms，供start()使用
    !fresh && ['paused', 'idle'].includes(data.state) ? data.remaining : data.duration * 1000; // 續接 start() 的運算、回呼或參數：!fresh && ['paused', 'idle'].includes(data.state) ? data.remaining : data.du…
  data.remaining = ms; // 續接 start() 的運算、回呼或參數：data.remaining = ms;
  data.deadline = Date.now() + ms; // 續接 start() 的運算、回呼或參數：data.deadline = Date.now() + ms;
  data.state = 'running'; // 續接 start() 的運算、回呼或參數：data.state = 'running';
  unlockAudio(); // 呼叫 unlockAudio()，處理 組間休息計時器 的 unlockAudio 邏輯
  persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 start() 的目前區塊、參數或資料結構
function pause() { // 定義 pause()：處理 組間休息計時器 的 pause 邏輯
  if (data.state !== 'running') return; // 檢查 (data.state !== 'running') return;；成立時才執行此分支
  data.remaining = remaining(); // 續接 pause() 的運算、回呼或參數：data.remaining = remaining();
  data.deadline = null; // 續接 pause() 的運算、回呼或參數：data.deadline = null;
  data.state = data.remaining > 0 ? 'paused' : 'done'; // 續接 pause() 的運算、回呼或參數：data.state = data.remaining > 0 ? 'paused' : 'done';
  persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 pause() 的目前區塊、參數或資料結構
function add() { // 定義 add()：處理 組間休息計時器 的 add 邏輯
  if (data.state === 'done') { // 檢查 (data.state === 'done')；成立時才執行此分支
    data.remaining = 15000; // 續接 add() 的運算、回呼或參數：data.remaining = 15000;
    data.state = 'paused'; // 續接 add() 的運算、回呼或參數：data.state = 'paused';
  } else data.remaining = Math.min(3600000, remaining() + 15000); // 前一條件未成立時，執行 add() 的另一分支
  if (data.state === 'running') data.deadline = Date.now() + data.remaining; // 檢查 (data.state === 'running') data.deadline = Date.now() + data.remaining;；成立時才執行此分支
  persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 add() 的目前區塊、參數或資料結構
function reset() { // 定義 reset()：處理 組間休息計時器 的 reset 邏輯
  setDuration(data.duration); // 呼叫 setDuration()，處理 組間休息計時器 的 setDuration 邏輯
} // 結束 reset() 的目前區塊、參數或資料結構
function sound(enabled) { // 定義 sound()：處理 組間休息計時器 的 sound 邏輯
  data.sound = enabled; // 續接 sound() 的運算、回呼或參數：data.sound = enabled;
  unlockAudio(); // 呼叫 unlockAudio()，處理 組間休息計時器 的 unlockAudio 邏輯
  persist(); // 呼叫 persist()，處理 組間休息計時器 的 persist 邏輯
  emit(); // 呼叫 emit()，處理 組間休息計時器 的 emit 邏輯
} // 結束 sound() 的目前區塊、參數或資料結構

let started = false, // 宣告可更新的 started，供組間休息計時器使用
  onChange = null, // 更新 onChange，保存本步處理結果
  interval; // 續接 組間休息計時器 的運算、回呼或參數：interval;
export function startRestTimer(renderer) { // 定義 startRestTimer()：處理 組間休息計時器 的 startRestTimer 邏輯
  if (started) return; // 檢查 (started) return;；成立時才執行此分支
  started = true; // 更新 started，保存本步處理結果
  onChange = renderer; // 更新 onChange，保存本步處理結果
  load(); // 呼叫 load()，處理 組間休息計時器 的 load 邏輯
  window.addEventListener('storage', (event) => { // 綁定 storage 事件，交由回呼處理使用者操作
    if (event.key === KEY || event.key === null) { // 檢查 (event.key === KEY || event.key === null)；成立時才執行此分支
      load(); // 呼叫 load()，處理 組間休息計時器 的 load 邏輯
      tick(); // 呼叫 tick()，處理 組間休息計時器 的 tick 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  document.addEventListener('visibilitychange', () => { // 綁定 visibilitychange 事件，交由回呼處理使用者操作
    if (!document.hidden) { // 檢查 (!document.hidden)；成立時才執行此分支
      load(); // 呼叫 load()，處理 組間休息計時器 的 load 邏輯
      tick(); // 呼叫 tick()，處理 組間休息計時器 的 tick 邏輯
    } // 結束 事件回呼() 的目前區塊、參數或資料結構
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構
  tick(); // 呼叫 tick()，處理 組間休息計時器 的 tick 邏輯
  interval = setInterval(tick, 250); // 註冊重複執行的介面更新排程
} // 結束 startRestTimer() 的目前區塊、參數或資料結構
export const RestTimer = { snapshot, setDuration, start, pause, add, reset, sound, unlockAudio }; // 宣告不可重新指定的 RestTimer，供組間休息計時器使用
