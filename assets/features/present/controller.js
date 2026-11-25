import { formatTime as appFormatTime } from '../../shared/time.js'; // 從 ../../shared/time.js 載入相依介面，供目前在場人員使用
import { init as appInit } from '../auth/index.js'; // 從 ../auth/index.js 載入相依介面，供目前在場人員使用
import { loadOpenPeople as appLoadOpenPeople } from '../attendance/index.js'; // 從 ../attendance/index.js 載入相依介面，供目前在場人員使用
import { roleLabel as appRoleLabel } from '../../shared/profile-display.js'; // 從 ../../shared/profile-display.js 載入相依介面，供目前在場人員使用
import { setMessage as appSetMessage } from '../../shared/ui/messages.js'; // 從 ../../shared/ui/messages.js 載入相依介面，供目前在場人員使用
export async function mount() { // 定義 mount()：初始化頁面、綁定操作事件並載入資料
  const app = await appInit(); // 宣告不可重新指定的 app，供mount()使用
  if (!app) return; // 檢查 (!app) return;；成立時才執行此分支

  const peopleList = document.getElementById('people-list'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const emptyPeople = document.getElementById('empty-people'); // 依元素 ID 或 CSS 選擇器取得頁面控制項
  const refreshButton = document.getElementById('refresh-button'); // 依元素 ID 或 CSS 選擇器取得頁面控制項

  function renderPeople(people) { // 定義 renderPeople()：處理 目前在場人員 的 renderPeople 邏輯
    peopleList.replaceChildren(); // 替換容器內的子節點，清除舊畫面再放入新結果
    emptyPeople.classList.toggle('hidden', people.length > 0); // 新增、移除或切換 CSS 類別，更新顯示與選取狀態

    for (const person of people) { // 依 for (const person of people) 逐項處理或重複等待
      const row = document.createElement('li'); // 建立 li DOM 元素，供後續填值與插入
      const details = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入
      const name = document.createElement('strong'); // 建立 strong DOM 元素，供後續填值與插入
      const time = document.createElement('span'); // 建立 span DOM 元素，供後續填值與插入
      const badge = document.createElement('div'); // 建立 div DOM 元素，供後續填值與插入

      row.className = 'person-row'; // 續接 renderPeople() 的運算、回呼或參數：row.className = 'person-row';
      name.textContent = person.profile.display_name; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      time.textContent = `${appFormatTime(person.checked_in_at)} 簽到`; // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      badge.className = 'role-badge'; // 續接 renderPeople() 的運算、回呼或參數：badge.className = 'role-badge';
      badge.textContent = appRoleLabel(person.gym_role); // 以純文字讀寫介面內容，避免把資料當成 HTML 執行
      details.append(name, time); // 將建立的節點加入父容器，形成畫面內容
      row.append(details, badge); // 將建立的節點加入父容器，形成畫面內容
      peopleList.appendChild(row); // 將建立的節點加入父容器，形成畫面內容
    } // 結束 renderPeople() 的目前區塊、參數或資料結構
  } // 結束 renderPeople() 的目前區塊、參數或資料結構

  async function loadPeople() { // 定義 loadPeople()：查詢目前在場人員
    refreshButton.disabled = true; // 續接 loadPeople() 的運算、回呼或參數：refreshButton.disabled = true;
    appSetMessage('正在讀取在場人員……'); // 呼叫 appSetMessage()，處理 目前在場人員 的 appSetMessage 邏輯

    try { // 開始可捕捉例外的操作範圍
      const people = await appLoadOpenPeople(); // 宣告不可重新指定的 people，供loadPeople()使用
      renderPeople(people); // 呼叫 renderPeople()，處理 目前在場人員 的 renderPeople 邏輯
      appSetMessage( // 呼叫 appSetMessage()，處理 目前在場人員 的 appSetMessage 邏輯
        people.length > 0 ? `目前共有 ${people.length} 人在場。` : '目前沒有已簽到的人員。', // 續接 loadPeople() 的運算、回呼或參數：people.length > 0 ? `目前共有 ${people.length} 人在場。` : '目前沒有已簽到的人員。',
        'success', // 提供 'success', 文字、路徑或資料欄位值
      ); // 結束 loadPeople() 的目前區塊、參數或資料結構
    } catch (error) { // 捕捉上方操作的錯誤，進入失敗處理
      console.error(error); // 把偵錯或測試資訊寫到開發者主控台
      appSetMessage(`讀取失敗：${error.message}`, 'error'); // 呼叫 appSetMessage()，處理 目前在場人員 的 appSetMessage 邏輯
    } finally { // 不論成功或失敗都執行收尾，釋放狀態或控制項
      refreshButton.disabled = false; // 續接 loadPeople() 的運算、回呼或參數：refreshButton.disabled = false;
    } // 結束 loadPeople() 的目前區塊、參數或資料結構
  } // 結束 loadPeople() 的目前區塊、參數或資料結構

  refreshButton.addEventListener('click', loadPeople); // 綁定 click 事件，交由回呼處理使用者操作
  await loadPeople(); // 等待非同步操作完成後，才繼續同一流程
} // 結束 mount() 的目前區塊、參數或資料結構
