import { AssistRepository } from './repository.js'; // 從 ./repository.js 載入相依介面，供協助其他人簽退使用
import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供協助其他人簽退使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供協助其他人簽退使用
import { loadOpenPeople as appLoadOpenPeople } from '../attendance/index.js'; // 從 ../attendance/index.js 載入相依介面，供協助其他人簽退使用
import { roleLabel as appRoleLabel } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供協助其他人簽退使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供協助其他人簽退使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const app = await appInit(); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支

  const assistList = document.getElementById('assist-list'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const emptyAssist = document.getElementById('empty-assist'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const refreshButton = document.getElementById('refresh-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  let openPeople = []; // 宣告可更新的 openPeople，供mount()使用

  function setBusy(isBusy) { // 定義 setBusy()：切換處理狀態並避免重複操作
    refreshButton.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：refreshButton.disabled = isBusy;
    for (const button of assistList.querySelectorAll('[data-assist-user-id]')) { // 依元素 ID 或 CSS 選擇器取得頁面控制項
      button.disabled = isBusy; // 續接 setBusy() 的運算、回呼或參數：button.disabled = isBusy;
    } // 結束 setBusy() 的目前區塊、參數或資料結構
  } // 結束 setBusy() 的目前區塊、參數或資料結構

  function renderPeople() { // 定義 renderPeople()：處理 協助其他人簽退 的 renderPeople 邏輯
    assistList.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    const otherPeople = openPeople.filter((person) => person.user_id !== app.session.user.id); // 宣告不可重新指定的 otherPeople，供事件回呼()使用
    emptyAssist.classList.toggle('hidden', otherPeople.length > 0); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態

    for (const person of otherPeople) { // 依 for (const person of otherPeople) 逐項處理或重複等待
      const row = document.createElement('li'); // 建立 li DOM 元素，供後續填值與插入
      const details = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
      const name = document.createElement('strong'); // 建立 strong DOM 元素，供後續填值與插入
      const time = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
      const actions = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
      const badge = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入

      row.className = 'person-row'; // 續接 renderPeople() 的運算、回呼或參數：row.className = 'person-row';
      actions.className = 'row-actions'; // 續接 renderPeople() 的運算、回呼或參數：actions.className = 'row-actions';
      name.textContent = person.profile.display_name; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      time.textContent = `${appFormatTime(person.checked_in_at)} 簽到`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      badge.className = 'role-badge'; // 續接 renderPeople() 的運算、回呼或參數：badge.className = 'role-badge';
      badge.textContent = appRoleLabel(person.gym_role); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      details.append(name, time); // 將建立的節點加入父容器，形成畫面內容
      actions.appendChild(badge); // 將建立的節點加入父容器，形成畫面內容

      if (person.gym_role === 'primary') { // 檢查 (person.gym_role === 'primary')；成立時才執行此分支
        const locked = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
        locked.className = 'locked-label'; // 續接 renderPeople() 的運算、回呼或參數：locked.className = 'locked-label';
        locked.textContent = '需本人簽退'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        actions.appendChild(locked); // 將建立的節點加入父容器，形成畫面內容
      } else { // 前一條件未成立時，執行 renderPeople() 的另一分支
        const button = document.createElement('button'); // 建立 button DOM 元素，供後續填值與插入
        button.className = 'assist-button'; // 續接 renderPeople() 的運算、回呼或參數：button.className = 'assist-button';
        button.type = 'button'; // 續接 renderPeople() 的運算、回呼或參數：button.type = 'button';
        button.dataset.assistUserId = person.user_id; // 續接 renderPeople() 的運算、回呼或參數：button.dataset.assistUserId = person.user_id;
        button.textContent = '協助簽退'; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
        actions.appendChild(button); // 將建立的節點加入父容器，形成畫面內容
      } // 結束 renderPeople() 的目前區塊、參數或資料結構

      row.append(details, actions); // 將建立的節點加入父容器，形成畫面內容
      assistList.appendChild(row); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 renderPeople() 的目前區塊、參數或資料結構
  } // 結束 renderPeople() 的目前區塊、參數或資料結構

  async function loadPeople(successMessage = '') { // 定義 loadPeople()：查詢目前在場人員
    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    appSetMessage('正在讀取可協助簽退的人員……'); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯

    try { // 開始可捕捉例外的操作範圍
      openPeople = await appLoadOpenPeople(); // 更新 openPeople，保存本步處理結果
      renderPeople(); // 呼叫 renderPeople()，處理 協助其他人簽退 的 renderPeople 邏輯
      appSetMessage(successMessage || '名單已同步。', 'success'); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error(error); // 把偵錯或測試資訊寫到開發者主控台
      appSetMessage(`讀取失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    } // 結束 loadPeople() 的目前區塊、參數或資料結構
  } // 結束 loadPeople() 的目前區塊、參數或資料結構

  assistList.addEventListener('click', async (event) => { // 綁定 click 事件，交由回呼處理使用者操作
    const button = event.target.closest('[data-assist-user-id]'); // 宣告不可重新指定的 操作按鈕，供事件回呼()使用
    if (!button) return; // 檢查 (!button) return;；成立時才執行此分支

    const target = openPeople.find((person) => person.user_id === button.dataset.assistUserId); // 宣告不可重新指定的 target，供事件回呼()使用
    if (!target) { // 檢查 (!target)；成立時才執行此分支
      appSetMessage('找不到最新簽到狀態，請重新整理。', 'error'); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (!window.confirm(`確定要協助「${target.profile.display_name}」簽退嗎？`)) { // 檢查 (!window.confirm(`確定要協助「${target.profile.display_name}」簽退嗎？`))；成立時才執行此分支
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    setBusy(true); // 呼叫 setBusy()，切換處理狀態並避免重複操作
    appSetMessage(`正在協助「${target.profile.display_name}」簽退……`); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯

    const { error } = await AssistRepository.checkOut({ // 續接 事件回呼() 的運算、回呼或參數：const { error } = await AssistRepository.checkOut({
      target_user_id: target.user_id, // 設定 target_user_id 欄位的值或型別
    }); // 結束 事件回呼() 的目前區塊、參數或資料結構

    if (error) { // 檢查 (error)；成立時才執行此分支
      appSetMessage(`協助簽退失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 協助其他人簽退 的 appSetMessage 邏輯
      setBusy(false); // 呼叫 setBusy()，切換處理狀態並避免重複操作
      return; // 提前結束 事件回呼()，不再執行後續操作
    } // 結束 事件回呼() 的目前區塊、參數或資料結構

    await loadPeople(`已協助「${target.profile.display_name}」完成簽退。`); // 等待非同步操作完成後，才繼續同一流程
  }); // 結束 事件回呼() 的目前區塊、參數或資料結構

  refreshButton.addEventListener('click', () => loadPeople()); // 綁定 click 事件，交由回呼處理使用者操作
  await loadPeople(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
